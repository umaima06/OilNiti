import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
class OilNitiEngine:
    def __init__(self):
        self.elasticities = pd.read_csv(DATA_DIR / "elasticities.csv", index_col="parameter")["value"]
        self.state_data = pd.read_csv(DATA_DIR / "state_oil_prices.csv")
        self.duty_history = pd.read_csv(DATA_DIR / "duty_history.csv")
        
        # Current baseline (latest entry)
        self.baseline_cpo_duty = 20.0
        self.baseline_rpo_duty = 32.5
        self.baseline_global_cpo_usd = 870  # current approx
        self.baseline_domestic_palm_price = 133.0  # ₹/kg national avg
        self.baseline_import_volume_lakh_tons = 85.0  # annual
        self.domestic_production_share = float(self.elasticities["domestic_production_share"])
        self._finding_sweet_spot = False  # recursion guard
        self._sweet_spot_cache = None  # cache the sweet-spot result

    def simulate(self, new_cpo_duty: float, new_rpo_duty: float, global_cpo_shock_pct: float = 0.0):
        """
        Core simulation engine.
        Returns full prediction dict for frontend consumption.
        """
        # Guard against extreme inputs
        new_cpo_duty = max(0.0, min(100.0, new_cpo_duty))
        new_rpo_duty = max(0.0, min(100.0, new_rpo_duty))
        global_cpo_shock_pct = max(-50.0, min(100.0, global_cpo_shock_pct))
        
        # --- STEP 1: Duty delta ---
        delta_cpo = new_cpo_duty - self.baseline_cpo_duty
        delta_rpo = new_rpo_duty - self.baseline_rpo_duty

        # --- STEP 2: Effective duty change (weighted: CPO dominates import mix 70/30) ---
        effective_duty_delta = (delta_cpo * 0.70) + (delta_rpo * 0.30)

        # --- STEP 3: Global price shock ---
        global_price_multiplier = 1 + (global_cpo_shock_pct / 100)

        # --- STEP 4: Domestic price change ---
        # Pass-through rate = how much of tariff change reaches retail
        pass_through = float(self.elasticities["pass_through_rate"])
        
        # Price change % from duty
        duty_price_impact_pct = (effective_duty_delta / 100) * pass_through * 100
        
        # Price change % from global shock
        global_price_impact_pct = (global_cpo_shock_pct * pass_through * 0.6)
        
        total_price_change_pct = duty_price_impact_pct + global_price_impact_pct
        new_domestic_price = max(
            50.0,  # price can never go below ₹50/kg (floor)
            self.baseline_domestic_palm_price * (1 + total_price_change_pct / 100)
        )

        # --- STEP 5: Import volume change ---
        import_elasticity = float(self.elasticities["import_volume_elasticity"])
        import_volume_change_pct = import_elasticity * total_price_change_pct
        new_import_volume = self.baseline_import_volume_lakh_tons * (1 + import_volume_change_pct / 100)

        # --- STEP 6: Cross-oil substitution ---
        mustard_cross = float(self.elasticities["cross_price_elasticity_mustard"])
        soybean_cross = float(self.elasticities["cross_price_elasticity_soybean"])
        sunflower_cross = float(self.elasticities["cross_price_elasticity_sunflower"])

        mustard_price_change_pct = mustard_cross * total_price_change_pct
        soybean_price_change_pct = soybean_cross * total_price_change_pct
        sunflower_price_change_pct = sunflower_cross * total_price_change_pct

        # --- STEP 7: Atma Nirbhar score ---
        # If imports drop, domestic share rises
        import_reduction_factor = -import_volume_change_pct / 100
        new_domestic_share = min(
            self.domestic_production_share + (import_reduction_factor * 0.3),
            0.95
        )
        atma_nirbhar_score = round(new_domestic_share * 100, 1)
        atma_nirbhar_delta = round((new_domestic_share - self.domestic_production_share) * 100, 1)

        # --- STEP 8: 3-month price projection ---
        price_projection = self._generate_price_projection(
            self.baseline_domestic_palm_price,
            new_domestic_price,
            total_price_change_pct
        )

        # --- STEP 9: State-level impact ---
        state_impacts = self._calculate_state_impacts(
            total_price_change_pct,
            mustard_price_change_pct
        )

        # --- STEP 10: National summary ---
        national_summary = self._calculate_national_summary(
            total_price_change_pct,
            mustard_price_change_pct,
            new_cpo_duty,
            delta_cpo,
            delta_rpo
        )

        return {
            "input": {
                "cpo_duty": new_cpo_duty,
                "rpo_duty": new_rpo_duty,
                "global_shock_pct": global_cpo_shock_pct
            },
            "price_impact": {
                "palm_oil_change_pct": round(total_price_change_pct, 2),
                "new_domestic_price_rs_kg": round(new_domestic_price, 2),
                "mustard_oil_change_pct": round(mustard_price_change_pct, 2),
                "soybean_oil_change_pct": round(soybean_price_change_pct, 2),
                "sunflower_oil_change_pct": round(sunflower_price_change_pct, 2),
            },
            "trade_impact": {
                "import_volume_change_pct": round(import_volume_change_pct, 2),
                "new_import_volume_lakh_tons": round(new_import_volume, 2),
                "baseline_import_volume_lakh_tons": self.baseline_import_volume_lakh_tons
            },
            "atma_nirbhar": {
                "score": atma_nirbhar_score,
                "delta": atma_nirbhar_delta,
                "domestic_share_pct": round(new_domestic_share * 100, 1)
            },
            "price_projection": price_projection,
            "state_impacts": state_impacts,
            "national_summary": national_summary
        }

    def _generate_price_projection(self, baseline, new_price, total_change_pct):
        """Generate month-by-month price projection for 6 months"""
        months = ["Now", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"]
        prices = []
        
        for i, month in enumerate(months):
            # Gradual price adjustment (markets don't move instantly)
            adjustment_factor = 1 - np.exp(-0.8 * i)
            price = baseline + (new_price - baseline) * adjustment_factor
            prices.append({
                "month": month,
                "palm_oil": round(price, 2),
                "mustard_oil": round(130 + (145 - 130) * adjustment_factor * (total_change_pct * 0.38 / 10), 2)
            })
        return prices

    def _calculate_state_impacts(self, palm_price_change_pct, mustard_price_change_pct):
        """Calculate per-state farmer and consumer impact"""
        impacts = []
        
        for _, row in self.state_data.iterrows():
            # Consumer impact
            monthly_oil_spend_rs = row["monthly_hh_income_rs"] * 0.035  # ~3.5% of income on edible oil
            monthly_cost_delta = monthly_oil_spend_rs * (palm_price_change_pct / 100)
            income_impact_pct = (monthly_cost_delta / row["monthly_hh_income_rs"]) * 100

            # Farmer impact (mustard/oilseed farmers gain when palm gets expensive)
            msp_mustard = float(self.elasticities["msp_mustard_rs_quintal"])
            market_price_change_rs_quintal = (mustard_price_change_pct / 100) * (row["avg_mustard_retail_rs_kg"] * 100)
            annual_farmer_income_delta = market_price_change_rs_quintal * 8 # Sanitize any NaN/inf values
            if not isinstance(annual_farmer_income_delta, (int, float)) or annual_farmer_income_delta != annual_farmer_income_delta:
                annual_farmer_income_delta = 0.0

            # Net impact score: positive = farmers win more than consumers lose
            net_score = (annual_farmer_income_delta / 12) - abs(monthly_cost_delta)

            impacts.append({
                "state": row["state"],
                "region": row["region"],
                "consumer_monthly_delta_rs": round(monthly_cost_delta, 2),
                "consumer_income_impact_pct": round(income_impact_pct, 3),
                "farmer_annual_delta_rs": round(annual_farmer_income_delta, 2),
                "oilseed_farmers_lakh": row["oilseed_farmers_lakh"],
                "net_score": round(net_score, 2),
                "palm_price_new": round(row["avg_palm_retail_rs_kg"] * (1 + palm_price_change_pct / 100), 2),
                "mustard_price_new": round(row["avg_mustard_retail_rs_kg"] * (1 + mustard_price_change_pct / 100), 2),
            })
        
        return impacts

    def _calculate_national_summary(self, palm_change_pct, mustard_change_pct, new_cpo_duty, delta_cpo, delta_rpo):
        """High-level national numbers for the Human Face Panel"""
        
        # Total farmers helped/hurt
        total_oilseed_farmers_lakh = self.state_data["oilseed_farmers_lakh"].sum()
        farmers_significantly_affected = self.state_data[
            self.state_data["oilseed_farmers_lakh"] > 5
        ]["oilseed_farmers_lakh"].sum()

        # Avg annual farmer income delta
        avg_mustard_price = self.state_data["avg_mustard_retail_rs_kg"].mean()
        avg_farmer_income_delta_yr = (mustard_change_pct / 100) * avg_mustard_price * 100 * 8

        # Low income consumer impact (bottom 40% households)
        low_income_avg_monthly = 9000
        low_income_oil_spend = low_income_avg_monthly * 0.045  # they spend higher share on food
        low_income_monthly_delta = low_income_oil_spend * (palm_change_pct / 100)

        # Total low income households (~31 crore)
        total_low_income_hh_crore = 31.0

        # Customs revenue impact (rough estimate)
        # Current imports ~85 lakh tons, avg CIF ~$870/ton
        import_value_crore = 85 * 87000 / 100  # lakh tons * ₹/ton / 100 = crore
        duty_revenue_change_crore = import_value_crore * (delta_cpo * 0.7 + delta_rpo * 0.3) / 100

        # Recommended sweet spot duty
        recommended_duty = self._find_sweet_spot() if not self._finding_sweet_spot else 20.0

        # Farmer protection score (0-100)
        farmer_score = max(0, min(100, 50 + (mustard_change_pct * 5)))
        
        # Consumer affordability score (0-100, higher = more affordable)
        consumer_score = max(0, min(100, 50 - (palm_change_pct * 3)))

        return {
            "total_oilseed_farmers_lakh": round(total_oilseed_farmers_lakh, 1),
            "avg_farmer_annual_delta_rs": round(avg_farmer_income_delta_yr, 0),
            "farmer_direction": "benefit" if mustard_change_pct > 0 else "loss",
            "low_income_monthly_delta_rs": round(low_income_monthly_delta, 2),
            "low_income_monthly_delta_pct_income": round((low_income_monthly_delta / low_income_avg_monthly) * 100, 2),
            "consumer_direction": "hurt" if palm_change_pct > 0 else "benefit",
            "total_low_income_hh_crore": total_low_income_hh_crore,
            "customs_revenue_delta_crore": round(duty_revenue_change_crore, 0),
            "recommended_cpo_duty": recommended_duty,
            "farmer_protection_score": round(farmer_score, 1),
            "consumer_affordability_score": round(consumer_score, 1),
        }

    def _find_sweet_spot(self):
        """Find duty that balances farmer protection and consumer affordability.
        Cached to avoid re-running 18+ simulations on every request."""
        if self._sweet_spot_cache is not None:
            return self._sweet_spot_cache

        self._finding_sweet_spot = True  # prevent recursion
        best_duty = 20.0
        best_balance = float('inf')
        
        try:
            for duty in np.arange(5, 50, 1.0):  # finer step since we cache
                result = self.simulate(duty, duty + 12.5)
                f_score = result["national_summary"]["farmer_protection_score"]
                c_score = result["national_summary"]["consumer_affordability_score"]
                gap = abs(f_score - c_score)
                
                if gap < best_balance:
                    best_balance = gap
                    best_duty = duty
        finally:
            self._finding_sweet_spot = False  # always reset even if error
        
        self._sweet_spot_cache = round(float(best_duty), 1)
        return self._sweet_spot_cache