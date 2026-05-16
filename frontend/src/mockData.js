//mockData.js

export const mockSimulationResult = {
  price_trajectory: [
    { month: 1, palm_price: 142.5, mustard_price: 178.2 },
    { month: 2, palm_price: 148.3, mustard_price: 181.4 },
    { month: 3, palm_price: 151.1, mustard_price: 183.7 }
  ],
  domestic_price_change: +12.4,
  import_volume_change: -18,
  substitution_effect: +9.2,
  atma_nirbhar_before: 34.1,
  atma_nirbhar_after: 38.7,
  farmer_impact: {
    top_state: "Rajasthan",
    income_delta_per_farmer: 3200,
    farmers_benefited_lakhs: 18,
    farmer_protection_score: 74,
    state_breakdown: [
      { state: "Rajasthan", farmers_lakhs: 8.2, income_delta: 3200 },
      { state: "Madhya Pradesh", farmers_lakhs: 5.1, income_delta: 2800 },
      { state: "Haryana", farmers_lakhs: 2.4, income_delta: 3100 }
    ]
  },
  consumer_impact: {
    example_household: "₹15,000/month Household in Chennai",
    monthly_extra_cost: 287,
    pct_of_income: 4.1,
    consumer_affordability_score: 48,
    decile_breakdown: [
      { decile: "Bottom 10%", monthly_extra: 187, pct_income: 8.2 },
      { decile: "Bottom 20%", monthly_extra: 210, pct_income: 6.1 },
      { decile: "Middle 50%", monthly_extra: 287, pct_income: 4.1 },
      { decile: "Top 20%", monthly_extra: 320, pct_income: 1.2 }
    ]
  },
  state_impact: [
    { state: "Rajasthan", net: "farmer", magnitude: 0.9 },
    { state: "Tamil Nadu", net: "consumer", magnitude: 0.8 },
    { state: "West Bengal", net: "consumer", magnitude: 0.7 },
    { state: "Madhya Pradesh", net: "farmer", magnitude: 0.7 },
    { state: "Maharashtra", net: "mixed", magnitude: 0.5 },
    { state: "Uttar Pradesh", net: "farmer", magnitude: 0.6 },
    { state: "Haryana", net: "farmer", magnitude: 0.8 },
    { state: "Punjab", net: "farmer", magnitude: 0.5 },
    { state: "Gujarat", net: "mixed", magnitude: 0.4 },
    { state: "Karnataka", net: "consumer", magnitude: 0.6 },
    { state: "Kerala", net: "consumer", magnitude: 0.9 },
    { state: "Andhra Pradesh", net: "consumer", magnitude: 0.5 },
    { state: "Odisha", net: "mixed", magnitude: 0.3 },
    { state: "Bihar", net: "farmer", magnitude: 0.4 },
    { state: "Jharkhand", net: "mixed", magnitude: 0.3 }
  ],
  fiscal_impact_crore: -4200
};

export const mockPolicyReport = {
  executive_summary: "The proposed CPO duty increase to 100% will provide significant income support to oilseed farmers, particularly mustard cultivators in Rajasthan and Madhya Pradesh, while imposing a modest but measurable burden on lower-income urban households. A balanced policy approach is recommended to protect both stakeholder groups simultaneously.",
  farmer_welfare: {
    table: [
      { state: "Rajasthan", farmers_lakhs: 8.2, income_delta: 3200 },
      { state: "Madhya Pradesh", farmers_lakhs: 5.1, income_delta: 2800 },
      { state: "Haryana", farmers_lakhs: 2.4, income_delta: 3100 },
      { state: "Uttar Pradesh", farmers_lakhs: 3.8, income_delta: 2600 },
      { state: "Gujarat", farmers_lakhs: 1.2, income_delta: 2200 }
    ]
  },
  consumer_burden: {
    table: [
      { decile: "Bottom 10%", monthly_extra: 187, pct_income: 8.2 },
      { decile: "Bottom 20%", monthly_extra: 210, pct_income: 6.1 },
      { decile: "Middle 50%", monthly_extra: 287, pct_income: 4.1 },
      { decile: "Top 20%", monthly_extra: 320, pct_income: 1.2 }
    ]
  },
  recommended_cpo_duty: 75,
  recommended_rpo_duty: 20,
  rationale: "A CPO duty of 75% optimally balances farmer income support with consumer affordability, maintaining domestic production incentives while limiting the household edible oil cost increase to under 2% of income for bottom-decile households. Pairing this with targeted DBT subsidies for BPL households would neutralize the regressive impact.",
  fiscal_impact_crore: -4200
};
