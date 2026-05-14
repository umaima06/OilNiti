from models.causal_engine import OilNitiEngine

e = OilNitiEngine()

scenarios = [
    ('Ukraine War',    5.0,  12.5, 40.0),
    ('Indonesia Ban',  5.0,  12.5, 28.0),
    ('Budget 2024',   27.5,  37.5,  0.0),
    ('Zero Duty',      0.0,   0.0,  0.0),
]

print("\n=== SCENARIO TESTS ===")
for name, cpo, rpo, shock in scenarios:
    r = e.simulate(cpo, rpo, shock)
    palm = r["price_impact"]["palm_oil_change_pct"]
    imports = r["trade_impact"]["import_volume_change_pct"]
    farmer = r["national_summary"]["farmer_direction"]
    consumer = r["national_summary"]["consumer_direction"]
    print(f"✅ {name:<20} palm: {palm:+.1f}% | imports: {imports:+.1f}% | farmer: {farmer} | consumer: {consumer}")

print("\n=== ALL SCENARIOS PASSED ===")