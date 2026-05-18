from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.causal_engine import OilNitiEngine
from utils.backtester import run_sept_2024_backtest
from routes.live_price import get_live_cpo_price
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="OilNiti API", version="1.0.0")

# CORS — allow all origins for hackathon deployment flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    report_type: str = "think_tank"

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
    fi = req.simulation_result.get("fiscal_impact", {})
    
    # Sort states by farmer income delta
    states_data = req.simulation_result.get("state_impacts", [])
    top_farmer_states = sorted(states_data, key=lambda x: x.get('farmer_annual_delta', 0), reverse=True)[:5]
    top_consumer_states = sorted(states_data, key=lambda x: x.get('consumer_monthly_delta', 0), reverse=True)[:3]
    
    # Format data blocks for the prompt
    farmer_data = "\n".join([f"- {s['state']}: {s.get('oilseed_farmers_lakh', 0)} lakh farmers, +₹{s.get('farmer_annual_delta', 0)}/season" for s in top_farmer_states])
    consumer_data = "\n".join([f"- {s['state']}: +₹{s.get('consumer_monthly_delta', 0)}/month ({s.get('percent_of_income_impact', 0)}% of income)" for s in top_consumer_states])
    
    common_data = f"""
SIMULATION PARAMETERS:
- CPO Duty: {req.cpo_duty}% 
- RPO Duty: {req.rpo_duty}%  
- Palm oil retail price change: {pi.get('palm_oil_change_pct', 0)}%
- Soybean oil price change: {pi.get('soybean_oil_change_pct', 0)}%
- Mustard oil price change: {pi.get('mustard_oil_change_pct', 0)}%
- Sunflower oil price change: {pi.get('sunflower_oil_change_pct', 0)}%
- Import volume change: {ti.get('import_volume_change_pct', 0)}%
- Fiscal Revenue Delta: +Rs {ns.get('customs_revenue_delta_crore', 0):,.0f} crore
- Total oilseed farmers affected: {ns.get('total_oilseed_farmers_lakh', 0)} lakh
- Low-income monthly burden: Rs {ns.get('low_income_monthly_delta_rs', 0):.0f}/month
- Low-income burden % of income: {ns.get('low_income_monthly_delta_pct_income', 0):.1f}%
- Farmer Protection Score: {ns.get('farmer_protection_score', 0)}/100
- Consumer Affordability Score: {ns.get('consumer_affordability_score', 0)}/100
- Recommended CPO Duty (sweet spot): {ns.get('recommended_cpo_duty', 22)}%
- Atma Nirbhar self-reliance: {an.get('score', 35)}% (delta: {an.get('delta', 0):+.1f}%)

TOP 5 FARMER-BENEFIT STATES:
{farmer_data}

TOP 3 CONSUMER-BURDEN STATES:
{consumer_data}"""

    if req.report_type == 'journalist':
        system_prompt = f"""You are generating an OilNiti PRESS INTELLIGENCE BRIEF.
Audience: Business Standard, Reuters, Mint, BQ Prime.
Tone: Punchy, accessible, journalistic. Lead with the most shocking human statistic.

{common_data}

FORMAT (follow this EXACTLY):
# OILNITI PRESS INTELLIGENCE BRIEF
**For editorial use — not for direct publication**
CPO Duty: {req.cpo_duty}% | RPO Duty: {req.rpo_duty}% | Generated: 18 May 2026

## THE HEADLINE NUMBER
(Lead with: "A family earning Rs X/month in [state] will pay Rs Y more every month for cooking oil. That's Z% of their entire income.")

## Ready-to-use Story Angles
**ANGLE 1 — Consumer Impact:** (one paragraph, quotable)
**ANGLE 2 — Farmer Welfare:** (one paragraph, quotable)
**ANGLE 3 — Policy Gap:** (one paragraph, quotable)

## Key Quotable Statistics
(Bullet list: price impact, farmer benefit, consumer burden, fiscal gain, most burdened state, most benefited state)

## State-by-State One-Liners
(One line per major state: Bihar, Rajasthan, Tamil Nadu, Kerala, UP — ready to drop into any article)

## Model Credibility
"OilNiti's structural causal model predicted the September 2024 price rise with 3.6% error — validated against DFPD retail price data."

Use real numbers from the simulation data. No filler. Every sentence should be publishable."""

    elif req.report_type == 'trader':
        system_prompt = f"""You are generating an OilNiti TRADE INTELLIGENCE BRIEF.
Audience: SEA India members, edible oil importers, procurement desks.
Tone: Market-focused, actionable, no political language. Lead with the procurement recommendation.

{common_data}

FORMAT (follow this EXACTLY):
# OILNITI TRADE INTELLIGENCE BRIEF
**MARKET SENSITIVE — INTERNAL USE ONLY**
Simulation: CPO {req.cpo_duty}% | RPO {req.rpo_duty}% | Generated: 18 May 2026

## PROCUREMENT RECOMMENDATION
| Field | Value |
|---|---|
| ACTION | BUY NOW / HOLD / WAIT (based on data) |
| WINDOW | X weeks at current price |
| EXPECTED PRICE MOVE | +X% |
| OPTIMAL OIL | (lowest projected increase) |
| SUBSTITUTE RATIO | X:Y palm:soybean |

## Price Impact by Oil Type
(Markdown table: Oil Type | Current Price | Post-Duty Projected | Change %)
Include: CPO, RBD Palmolein, Soybean Oil, Mustard Oil, Sunflower Oil

## Import Volume Impact
(Current monthly CPO import, projected post-duty, value change, port impact)

## Duty Implementation Timeline
- Week 1-2: Gazette notification → port price adjustment
- Week 3-4: Wholesale price transmission
- Week 5-8: Full retail impact visible
- Week 9-12: Import volume stabilizes
- OPTIMAL IMPORT WINDOW: Next 10-14 days

## Substitution Recommendation
(Recommended mix shift, estimated cost saving per tonne)

Use market terminology only. Every number must come from the simulation data."""

    else:
        system_prompt = f"""You are generating an OilNiti POLICY BRIEF (RESTRICTED CIRCULATION).
Audience: Think tanks (ORF, ICRIER, PRS Legislative Research), NITI Aayog.
Tone: Formal policy language. Data-dense. Lead with methodology credibility.

{common_data}

FORMAT (follow this EXACTLY):
# OILNITI POLICY BRIEF — RESTRICTED CIRCULATION
**Prepared for**: Policy Research Use
**Simulation Parameters**: CPO Duty {req.cpo_duty}% | RPO Duty {req.rpo_duty}%
**Generated**: 18 May 2026 | **Model Version**: OilNiti 1.0
**Backtested Accuracy**: 3.6% error (Sept 2024 validation)

### Section 1 — Policy Context
(2 sentences: what changed, why it matters, what this brief covers)

### Section 2 — Executive Summary
(Exactly 5 bullet points: price change, import volume, farmers benefited, consumer burden peak, fiscal gain)

### Section 3 — Farmer Welfare Analysis
(Markdown table: Top 5 states ranked by farmer income delta — State | Crop | Farmers Affected | Income Delta | MSP Status)
Then one paragraph of analysis.

### Section 4 — Consumer Burden Analysis
(Markdown table: Income deciles — Income Group | Monthly Oil Spend | Extra Cost | % of Income | Risk Level 🔴🟡🟢)
Then top 3 most burdened states with numbers.

### Section 5 — Fiscal Impact
(Customs revenue breakdown: current import value, volume reduction, new import value, duty revenue, previous revenue, NET FISCAL GAIN)

### Section 6 — OilNiti Recommendation
(Recommended CPO duty range, RPO range, confidence level, rationale paragraph, consumer protection measure)

### Section 7 — Policy Risk Flags
(3 risk flags with ⚠️ prefix: festive season timing, supply shock, MSP breach gap)

Use real numbers from the simulation data. No filler. Every claim must be backed by data."""

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Generate the report now based on the provided simulation data and instructions. Do not include any meta-commentary, just output the report directly."}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.4,
            max_tokens=3000,
        )
        report_text = response.choices[0].message.content
        
        # Add the mandatory attribution footer
        footer = "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis report was generated by OilNiti's structural causal model\nbacktested to 3.6% error against September 2024 DFPD data.\nNot for redistribution without attribution.\noil-niti.vercel.app"
        
        return {
            "report": report_text + footer,
            "generated_at": "2026-05-18",
            "model": "llama-3.1-8b-instant"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/live-price")
def live_price():
    """Return current global CPO price with trend"""
    return get_live_cpo_price()

@app.get("/duty-history")
def duty_history():
    """Return historical duty timeline for chart"""
    import pandas as pd
    from pathlib import Path
    df = pd.read_csv(Path(__file__).parent / "data" / "duty_history.csv")
    records = []
    for _, row in df.iterrows():
        records.append({
            "date": row["date"],
            "year": row["date"][:4],
            "cpo_duty": float(row["cpo_duty_pct"]),
            "rpo_duty": float(row["rpo_duty_pct"]),
            "global_price": float(row["global_cpo_price_usd"]),
        })
    return {"timeline": records}

# ─── NITIBOT CHAT ────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    current_simulation: dict | None = None
    current_cpo_duty: float = 20.0
    current_rpo_duty: float = 32.5

@app.post("/chat")
async def chat(req: ChatRequest):
    """NitiBot — Context-aware policy advisor that can run simulations"""
    import re
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    client = Groq(api_key=api_key)
    
    # ── Layer 2: Detect if user is asking about a specific duty rate ──
    auto_sim = None
    auto_sim_result = None
    
    # Parse duty rates from natural language
    duty_patterns = [
        r'(?:set|raise|increase|change|put|make|try|what if|what about|simulate)\s+(?:cpo\s+)?(?:duty\s+)?(?:to\s+)?(\d+(?:\.\d+)?)\s*%',
        r'(\d+(?:\.\d+)?)\s*%\s+(?:cpo\s+)?duty',
        r'cpo\s+(?:duty\s+)?(?:at|to|of|=)\s*(\d+(?:\.\d+)?)',
        r'duty\s+(?:goes?|raised?|set|changed?)\s+to\s+(\d+(?:\.\d+)?)',
        r'what\s+(?:if|about)\s+(\d+(?:\.\d+)?)\s*%',
    ]
    
    parsed_cpo = None
    for pattern in duty_patterns:
        match = re.search(pattern, req.message.lower())
        if match:
            parsed_cpo = float(match.group(1))
            break
    
    # If we detected a duty rate, run the simulation
    if parsed_cpo is not None:
        parsed_rpo = parsed_cpo + 12.5  # standard gap
        try:
            auto_sim_result = engine.simulate(parsed_cpo, parsed_rpo)
            auto_sim = {
                "cpo_duty": parsed_cpo,
                "rpo_duty": parsed_rpo,
                "result": auto_sim_result
            }
        except Exception:
            pass
    
    # ── Build context for the AI ──
    sim_data = auto_sim_result or (req.current_simulation if req.current_simulation else None)
    current_cpo = parsed_cpo if parsed_cpo is not None else req.current_cpo_duty
    current_rpo = auto_sim["rpo_duty"] if auto_sim else req.current_rpo_duty
    
    # Build simulation context string
    sim_context = "No simulation has been run yet."
    if sim_data:
        ns = sim_data.get("national_summary", {})
        pi = sim_data.get("price_impact", {})
        ti = sim_data.get("trade_impact", {})
        an = sim_data.get("atma_nirbhar", {})
        states = sim_data.get("state_impacts", [])
        
        # Find top farmer and consumer states
        farmer_states = sorted(states, key=lambda s: s.get("farmer_annual_delta_rs", 0), reverse=True)[:5]
        consumer_states = sorted(states, key=lambda s: s.get("consumer_monthly_delta_rs", 0), reverse=True)[:5]
        
        sim_context = f"""CURRENT SIMULATION (CPO duty: {current_cpo}%, RPO duty: {current_rpo}%):
- Palm oil retail price change: {pi.get('palm_oil_change_pct', 0):.1f}%
- Mustard oil price change: {pi.get('mustard_oil_change_pct', 0):.1f}%
- Import volume change: {ti.get('import_volume_change_pct', 0):.1f}%
- Total oilseed farmers affected: {ns.get('total_oilseed_farmers_lakh', 0):.1f} lakh
- Avg farmer annual income delta: Rs {ns.get('avg_farmer_annual_delta_rs', 0):,.0f}
- Low-income monthly oil cost delta: Rs {ns.get('low_income_monthly_delta_rs', 0):.0f}
- Low-income burden as % of income: {ns.get('low_income_monthly_delta_pct_income', 0):.2f}%
- Atma Nirbhar self-reliance score: {an.get('score', 0):.1f}% (delta: {an.get('delta', 0):+.1f}%)
- Customs revenue impact: Rs {ns.get('customs_revenue_delta_crore', 0):,.0f} crore
- Farmer Protection Score: {ns.get('farmer_protection_score', 0)}/100
- Consumer Affordability Score: {ns.get('consumer_affordability_score', 0)}/100
- OilNiti Recommended Duty (sweet spot): {ns.get('recommended_cpo_duty', 20)}%

TOP 5 STATES WHERE FARMERS BENEFIT MOST:
""" + "\n".join([f"  - {s['state']}: +Rs {s.get('farmer_annual_delta_rs', 0):,.0f}/yr, {s.get('oilseed_farmers_lakh', 0):.1f}L farmers" for s in farmer_states]) + """

TOP 5 STATES WHERE CONSUMERS ARE MOST BURDENED:
""" + "\n".join([f"  - {s['state']}: +Rs {s.get('consumer_monthly_delta_rs', 0):,.0f}/mo, household income Rs {s.get('monthly_hh_income_rs', 0):,}" for s in consumer_states])

    system_prompt = f"""You are NitiBot — OilNiti's AI Policy Advisor. You are a senior analyst at NITI Aayog specializing in edible oil trade policy.

PERSONALITY:
- Sharp, concise, data-driven. Always cite specific numbers.
- You speak like a seasoned bureaucrat who actually cares about farmers AND consumers.
- Use Rs symbol for Indian currency. Use "lakh" and "crore" for Indian number system.
- Keep responses to 3-5 sentences MAX unless asked for detail.
- Never say "I'm an AI" or "I don't have feelings" — stay in character.
- If the simulation shows an extreme policy (e.g., 100% duty), flag the political/practical risks.

INDIA EDIBLE OIL CONTEXT:
- India imports ~60% of its edible oil, mostly palm oil from Indonesia/Malaysia
- 8 crore farming families depend on oilseed crops (mustard, soybean, groundnut)
- Edible oil is a politically sensitive commodity — any price spike affects 140 crore consumers
- CPO (Crude Palm Oil) duty has swung from 2.5% to 44% in the last decade
- The India-ASEAN FTA complicates duty changes
- MSP for mustard is Rs 5,650/quintal (2024-25)

{sim_context}

RULES:
1. When citing numbers, use the EXACT figures from the simulation data above. Never make up numbers.
2. If someone asks about a specific state, check the state data provided.
3. If asked for a recommendation, always reference OilNiti's computed sweet spot duty.
4. If the question is about history (2024 duty change, Ukraine war), reference India's duty history: 2014 (2.5%), 2017 (15→30%), 2018 (44% peak), 2021 (2.5% COVID cut), 2022 (5% during Ukraine), 2024 (27.5% hike), 2025 (20% current).
5. If asked for a "publishable summary" or "headline," give a crisp one-liner suitable for news.
6. Always end with a brief actionable insight or recommendation when relevant."""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            max_tokens=500,
            temperature=0.4
        )
        
        response = {
            "reply": completion.choices[0].message.content,
        }
        
        # If we auto-ran a simulation, include it so frontend can update
        if auto_sim:
            response["auto_simulation"] = {
                "cpo_duty": auto_sim["cpo_duty"],
                "rpo_duty": auto_sim["rpo_duty"],
                "result": auto_sim["result"]
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")