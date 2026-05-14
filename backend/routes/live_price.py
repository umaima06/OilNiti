import requests
from datetime import datetime
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).parent.parent / "data"

def get_live_cpo_price():
    """
    Fetches current CPO price.
    Primary: World Bank commodity API (free, no key)
    Fallback: Latest entry from our duty_history.csv
    """
    try:
        # World Bank free commodity price API — no key needed
        url = "https://api.worldbank.org/v2/en/indicator/PPOIL.USD?format=json&mrv=1"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            # World Bank returns nested array
            if data and len(data) > 1 and data[1]:
                latest = data[1][0]
                price_usd = float(latest.get('value', 870))
                return _build_response(price_usd, "World Bank Commodity Data", live=True)
    except Exception:
        pass

    # Fallback: use our CSV data
    try:
        df = pd.read_csv(DATA_DIR / "duty_history.csv")
        latest_price = float(df["global_cpo_price_usd"].iloc[-1])
        return _build_response(latest_price, "OilNiti Historical Data (MPOB)", live=False)
    except Exception:
        pass

    # Final hardcoded fallback
    return _build_response(870, "OilNiti Cached Price", live=False)


def _build_response(price_usd: float, source: str, live: bool):
    usd_to_inr = 83.5
    price_inr_kg = round((price_usd * usd_to_inr) / 1000, 2)

    # Determine trend by comparing to baseline
    baseline = 870
    diff = price_usd - baseline
    if diff > 30:
        trend = "rising"
        trend_icon = "📈"
    elif diff < -30:
        trend = "falling"
        trend_icon = "📉"
    else:
        trend = "stable"
        trend_icon = "➡️"

    return {
        "price_usd_per_ton": round(price_usd, 2),
        "price_inr_per_kg": price_inr_kg,
        "baseline_usd": baseline,
        "change_from_baseline_pct": round((diff / baseline) * 100, 2),
        "trend": trend,
        "trend_icon": trend_icon,
        "source": source,
        "live": live,
        "last_updated": datetime.now().strftime("%d %b %Y, %H:%M IST"),
        "note": "Global CPO benchmark — Malaysian Palm Oil Board reference price"
    }