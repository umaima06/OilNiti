from models.causal_engine import OilNitiEngine

engine = OilNitiEngine()

def farmer_impact(duty_change_pct: float, state: str = None):
    """
    Standalone farmer impact for a given duty change.
    duty_change_pct: positive = duty increase, negative = decrease
    """
    new_cpo = engine.baseline_cpo_duty + duty_change_pct
    new_rpo = engine.baseline_rpo_duty + duty_change_pct
    result = engine.simulate(new_cpo, new_rpo)
    
    if state:
        state_data = next(
            (s for s in result["state_impacts"] if s["state"] == state), 
            None
        )
        return state_data
    
    return {
        "avg_annual_delta_rs": result["national_summary"]["avg_farmer_annual_delta_rs"],
        "direction": result["national_summary"]["farmer_direction"],
        "total_farmers_lakh": result["national_summary"]["total_oilseed_farmers_lakh"],
        "farmer_score": result["national_summary"]["farmer_protection_score"]
    }

def consumer_impact(price_change_pct: float, state: str = None):
    """
    Standalone consumer impact for a given price change.
    """
    # Back-calculate the duty that produces this price change
    # price_change ≈ duty_change * pass_through (0.72)
    implied_duty_change = price_change_pct / 0.72
    new_cpo = engine.baseline_cpo_duty + implied_duty_change
    new_rpo = engine.baseline_rpo_duty + implied_duty_change
    result = engine.simulate(new_cpo, new_rpo)
    
    if state:
        state_data = next(
            (s for s in result["state_impacts"] if s["state"] == state),
            None
        )
        return state_data
    
    return {
        "monthly_delta_rs": result["national_summary"]["low_income_monthly_delta_rs"],
        "monthly_delta_pct_income": result["national_summary"]["low_income_monthly_delta_pct_income"],
        "direction": result["national_summary"]["consumer_direction"],
        "affected_hh_crore": result["national_summary"]["total_low_income_hh_crore"],
        "consumer_score": result["national_summary"]["consumer_affordability_score"]
    }