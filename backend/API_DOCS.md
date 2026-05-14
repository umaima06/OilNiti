# OilNiti Backend API — For Amena 🎯

Base URL: http://localhost:8000
Swagger UI: http://localhost:8000/docs

---

## Endpoints

### POST /simulate
The main endpoint. Call this whenever a slider changes.

Request:
{
  "cpo_duty": 20.0,       // float, 0-100
  "rpo_duty": 32.5,       // float, 0-100  
  "global_cpo_shock_pct": 0.0   // float, 0-60, optional
}

Response fields you need:
- result.price_impact.palm_oil_change_pct        → % change in palm oil price
- result.price_impact.mustard_oil_change_pct     → % change in mustard oil price
- result.price_impact.new_domestic_price_rs_kg   → new price in ₹/kg
- result.trade_impact.import_volume_change_pct   → % change in imports
- result.trade_impact.new_import_volume_lakh_tons
- result.atma_nirbhar.score                      → self reliance % (0-100)
- result.atma_nirbhar.delta                      → change from baseline
- result.price_projection                        → array of 7 months for line chart
- result.state_impacts                           → array of 19 states for map
- result.national_summary.total_oilseed_farmers_lakh
- result.national_summary.avg_farmer_annual_delta_rs
- result.national_summary.farmer_direction       → "benefit" or "loss"
- result.national_summary.low_income_monthly_delta_rs
- result.national_summary.low_income_monthly_delta_pct_income
- result.national_summary.consumer_direction     → "hurt" or "benefit"
- result.national_summary.customs_revenue_delta_crore
- result.national_summary.recommended_cpo_duty
- result.national_summary.farmer_protection_score    → 0-100
- result.national_summary.consumer_affordability_score → 0-100

---

### GET /scenarios
Returns 4 preset scenarios for the button panel.

Response: { scenarios: [ { id, label, description, cpo_duty, rpo_duty, global_shock_pct } ] }

---

### GET /backtest
Returns Sept 2024 model validation.

Response: { predicted_price_change_pct, actual_price_change_pct, model_error_pct, verdict }

---

### GET /states
Returns baseline state data for map initialization.

---

### GET /live-price
Returns current global CPO price.

Response: { price_usd_per_ton, price_inr_per_kg, trend, trend_icon, last_updated }

---

### POST /generate-report
Generates AI policy brief. Call ONLY when judge clicks button (not on every slider change).

Request:
{
  "cpo_duty": 30.0,
  "rpo_duty": 42.5,
  "simulation_result": { ...full result from /simulate... }
}

Response: { report: "full policy brief text", model: "llama-3.1-8b-instant" }

---

## State Impact Object (for map coloring)
Each state in result.state_impacts has:
- state: string (state name)
- net_score: float (higher = farmers benefit more than consumers lose)
  - > 240: dark green
  - > 220: green  
  - > 200: amber
  - < 200: red
- consumer_monthly_delta_rs: float (monthly cost change per household)
- farmer_annual_delta_rs: float (annual income change per farmer)
- oilseed_farmers_lakh: float (number of farmers)
- palm_price_new: float (new palm oil retail price ₹/kg)
- mustard_price_new: float (new mustard oil retail price ₹/kg)

---

## How to run backend
cd oilniti/backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000