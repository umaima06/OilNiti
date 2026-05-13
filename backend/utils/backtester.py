"""
September 2024 Backtesting Module
Real event: India raised CPO duty from 5% to 27.5% in Aug-Sep 2024
Real observed price change: ~+10.8% in retail palm oil over 3 months
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.causal_engine import OilNitiEngine

def run_sept_2024_backtest():
    engine = OilNitiEngine()
    
    # Temporarily set baseline to pre-change values
    engine.baseline_cpo_duty = 5.0
    engine.baseline_rpo_duty = 12.5
    engine.baseline_domestic_palm_price = 103.0 # price before the change
    
    # Simulate the actual duty change
    result = engine.simulate(new_cpo_duty=27.5, new_rpo_duty=37.5)
    
    predicted_change = result["price_impact"]["palm_oil_change_pct"]
    actual_change = 10.8  # real observed data
    error_pct = abs(predicted_change - actual_change) / actual_change * 100
    
    return {
        "event": "India CPO Duty Hike — September 2024",
        "duty_change": "CPO: 5% → 27.5%, RPO: 12.5% → 37.5%",
        "predicted_price_change_pct": round(predicted_change, 2),
        "actual_price_change_pct": actual_change,
        "model_error_pct": round(error_pct, 2),
        "verdict": "✅ Validated" if error_pct < 15 else "⚠️ Review needed",
        "state_breakdown": result["state_impacts"][:5]  # top 5 states
    }

if __name__ == "__main__":
    import json
    result = run_sept_2024_backtest()
    print(json.dumps(result, indent=2))