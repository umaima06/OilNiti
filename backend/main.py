from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.causal_engine import OilNitiEngine
from utils.backtester import run_sept_2024_backtest
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="OilNiti API", version="1.0.0")

# CORS so React frontend can call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = OilNitiEngine()

# ─── REQUEST MODELS ───────────────────────────────────────────────

class SimulateRequest(BaseModel):
    cpo_duty: float
    rpo_duty: float
    global_cpo_shock_pct: float = 0.0

class ReportRequest(BaseModel):
    simulation_result: dict
    cpo_duty: float
    rpo_duty: float

# ─── ROUTES ───────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "OilNiti API is live 🇮🇳"}

@app.post("/simulate")
def simulate(req: SimulateRequest):
    try:
        result = engine.simulate(
            new_cpo_duty=req.cpo_duty,
            new_rpo_duty=req.rpo_duty,
            global_cpo_shock_pct=req.global_cpo_shock_pct
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/states")
def get_states():
    """Return all state data for map initialization"""
    import pandas as pd
    from pathlib import Path
    df = pd.read_csv(Path(__file__).parent / "data" / "state_oil_prices.csv")
    return df.to_dict(orient="records")

@app.get("/backtest")
def backtest():
    """Return Sept 2024 model validation results"""
    return run_sept_2024_backtest()

@app.get("/scenarios")
def get_preset_scenarios():
    """Pre-built shock scenarios for demo"""
    return {
        "scenarios": [
            {
                "id": "ukraine_war_2022",
                "label": "🔴 Ukraine War 2022",
                "description": "Global CPO price spiked +40% due to sunflower oil shortage",
                "cpo_duty": 5.0,
                "rpo_duty": 12.5,
                "global_shock_pct": 40.0
            },
            {
                "id": "indonesia_ban_2022",
                "label": "🟡 Indonesia Export Ban",
                "description": "World's largest palm oil exporter banned exports in Apr 2022",
                "cpo_duty": 5.0,
                "rpo_duty": 12.5,
                "global_shock_pct": 28.0
            },
            {
                "id": "budget_2024_actual",
                "label": "🟢 Budget 2024 Actual",
                "description": "India raised CPO duty from 5% to 27.5% in Sep 2024",
                "cpo_duty": 27.5,
                "rpo_duty": 37.5,
                "global_shock_pct": 0.0
            },
            {
                "id": "free_trade_extreme",
                "label": "⚪ Zero Duty Scenario",
                "description": "What if India removed all edible oil import duties?",
                "cpo_duty": 0.0,
                "rpo_duty": 0.0,
                "global_shock_pct": 0.0
            }
        ]
    }

@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    """Generate AI policy brief using Groq API"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    client = Groq(api_key=api_key)

    ns = req.simulation_result.get("national_summary", {})
    pi = req.simulation_result.get("price_impact", {})
    ti = req.simulation_result.get("trade_impact", {})
    an = req.simulation_result.get("atma_nirbhar", {})

    prompt = f"""You are a senior policy analyst at NITI Aayog, India. Generate a concise, formal 2-page policy brief based on this simulation.

SIMULATION PARAMETERS:
- CPO Import Duty: {req.cpo_duty}% (Baseline: 20%)
- RPO Import Duty: {req.rpo_duty}% (Baseline: 32.5%)

KEY RESULTS:
- Palm oil retail price change: {pi.get('palm_oil_change_pct', 0)}%
- Import volume change: {ti.get('import_volume_change_pct', 0)}%
- Mustard oil price change: {pi.get('mustard_oil_change_pct', 0)}%
- Total oilseed farmers affected: {ns.get('total_oilseed_farmers_lakh', 0)} lakh
- Average farmer annual income change: Rs {ns.get('avg_farmer_annual_delta_rs', 0):,.0f}
- Low-income household monthly oil cost change: Rs {ns.get('low_income_monthly_delta_rs', 0):.2f}
- This is {ns.get('low_income_monthly_delta_pct_income', 0):.2f}% of their monthly income
- Atma Nirbhar self-reliance score: {an.get('score', 0)}% ({an.get('delta', 0):+.1f}% change)
- Customs revenue impact: Rs {ns.get('customs_revenue_delta_crore', 0):,.0f} crore
- Farmer Protection Score: {ns.get('farmer_protection_score', 0)}/100
- Consumer Affordability Score: {ns.get('consumer_affordability_score', 0)}/100
- OilNiti Recommended Duty: {ns.get('recommended_cpo_duty', 20)}%

Write a policy brief with these exact sections:
1. EXECUTIVE SUMMARY (3 sentences max)
2. FARMER WELFARE IMPACT (mention specific states like Rajasthan, MP, UP)
3. CONSUMER BURDEN ANALYSIS (focus on low-income households)
4. TRADE AND SELF-RELIANCE (import dependence implications)
5. OILNITI RECOMMENDATION (recommended duty with clear rationale)

Tone: Formal, factual, government-style. Use Rs symbol. Keep each section to 4-5 sentences. Total length: around 400 words."""

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.3
    )

    return {
        "report": completion.choices[0].message.content,
        "generated_at": "2026-05-13",
        "model": "llama-3.1-8b-instant"
    }