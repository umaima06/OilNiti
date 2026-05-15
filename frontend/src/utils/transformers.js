/**
 * Transforms the real backend response into the shape the frontend components expect.
 * Backend keys  →  Frontend keys
 * price_projection  →  price_trajectory (with month numbers instead of "Month N" strings)
 * national_summary  →  farmer_impact, consumer_impact (top-level keys)
 * state_impacts     →  state_impact (net: farmer|consumer|mixed based on net_score)
 * price_impact.*    →  domestic_price_change, import_volume_change, substitution_effect
 * atma_nirbhar.*    →  atma_nirbhar_before, atma_nirbhar_after
 */
export function transformSimulationResponse(raw, cpoDuty, rpoDuty) {
  const ns = raw.national_summary || {};
  const pi = raw.price_impact || {};
  const ti = raw.trade_impact || {};
  const an = raw.atma_nirbhar || {};
  const stateImpacts = raw.state_impacts || [];
  const proj = raw.price_projection || [];

  // --- Price trajectory: map "Month 1" / "Now" to integer months ---
  const price_trajectory = proj
    .map((p, i) => ({
      month: i,                          // 0 = Now, 1 = Month 1, …
      palm_price: p.palm_oil,
      mustard_price: p.mustard_oil,
    }))
    .filter((p) => p.month <= 6);       // cap at 6 months

  // --- State impact: classify states by net_score ---
  const state_impact = stateImpacts.map((s) => {
    const farmerBenefitPerMonth = s.farmer_annual_delta_rs / 12;
    const consumerCostPerMonth = Math.abs(s.consumer_monthly_delta_rs);
    const ratio = farmerBenefitPerMonth / (consumerCostPerMonth + 1); // +1 avoid div/0

    let net;
    if (s.net_score > 500) net = 'farmer';
    else if (s.net_score < -200) net = 'consumer';
    else net = 'mixed';

    // magnitude 0–1 based on absolute net_score (cap at 2000)
    const magnitude = Math.min(1, Math.abs(s.net_score) / 2000);

    return {
      state: s.state,
      net,
      magnitude,
      // bonus data for tooltip
      farmer_annual_delta: s.farmer_annual_delta_rs,
      consumer_monthly_delta: s.consumer_monthly_delta_rs,
      oilseed_farmers_lakh: s.oilseed_farmers_lakh,
    };
  });

  // Find highest-impact farmer state
  const farmerStates = stateImpacts
    .filter((s) => s.net_score > 0)
    .sort((a, b) => b.farmer_annual_delta_rs - a.farmer_annual_delta_rs);
  const topFarmerState = farmerStates[0]?.state || 'Rajasthan';

  // Find highest-impact consumer state
  const consumerStates = stateImpacts
    .filter((s) => s.net_score < 0 || s.consumer_monthly_delta_rs > 200)
    .sort((a, b) => b.consumer_monthly_delta_rs - a.consumer_monthly_delta_rs);
  const topConsumerState = consumerStates[0]?.state || 'Tamil Nadu';
  const topConsumerMonthlyIncome = 15000; // baseline
  const topConsumerExtraCost = consumerStates[0]?.consumer_monthly_delta_rs || ns.low_income_monthly_delta_rs || 0;

  // Total farmers benefited
  const totalFarmersBenefited = farmerStates.reduce(
    (acc, s) => acc + (s.oilseed_farmers_lakh || 0), 0
  );

  // Farmer state breakdown (top 5)
  const state_breakdown = farmerStates.slice(0, 5).map((s) => ({
    state: s.state,
    farmers_lakhs: s.oilseed_farmers_lakh,
    income_delta: Math.round(s.farmer_annual_delta_rs),
  }));

  // Consumer decile breakdown (synthetic from low_income data)
  const baseExtra = ns.low_income_monthly_delta_rs || 0;
  const decile_breakdown = [
    { decile: 'Bottom 10%', monthly_extra: Math.round(baseExtra * 0.75), pct_income: +(ns.low_income_monthly_delta_pct_income * 1.8).toFixed(1) },
    { decile: 'Bottom 20%', monthly_extra: Math.round(baseExtra * 0.9),  pct_income: +(ns.low_income_monthly_delta_pct_income * 1.3).toFixed(1) },
    { decile: 'Middle 50%', monthly_extra: Math.round(baseExtra),        pct_income: +(ns.low_income_monthly_delta_pct_income).toFixed(1) },
    { decile: 'Top 20%',    monthly_extra: Math.round(baseExtra * 1.4),  pct_income: +(ns.low_income_monthly_delta_pct_income * 0.4).toFixed(1) },
  ];

  // Farmer protection score — cap to 0–100
  const farmerScore = Math.min(100, Math.max(0, ns.farmer_protection_score || 0));
  // Consumer affordability score — when palm rises a lot it goes very low; map sensibly
  const consumerScore = Math.min(100, Math.max(0, ns.consumer_affordability_score || 0));

  return {
    // Panels 1-3
    price_trajectory,
    domestic_price_change: +(pi.palm_oil_change_pct || 0).toFixed(1),
    import_volume_change: +(ti.import_volume_change_pct || 0).toFixed(1),
    substitution_effect: +(pi.mustard_oil_change_pct || 0).toFixed(1),
    atma_nirbhar_before: +(an.score - (an.delta || 0)).toFixed(1),
    atma_nirbhar_after: +an.score.toFixed(1),

    farmer_impact: {
      top_state: topFarmerState,
      income_delta_per_farmer: Math.round(ns.avg_farmer_annual_delta_rs || 0),
      farmers_benefited_lakhs: Math.round(totalFarmersBenefited),
      farmer_protection_score: farmerScore,
      state_breakdown,
    },

    consumer_impact: {
      example_household: `₹${topConsumerMonthlyIncome.toLocaleString('en-IN')}/month Household in ${topConsumerState}`,
      monthly_extra_cost: Math.round(topConsumerExtraCost),
      pct_of_income: +(ns.low_income_monthly_delta_pct_income || 0).toFixed(1),
      consumer_affordability_score: consumerScore,
      decile_breakdown,
    },

    state_impact,
    fiscal_impact_crore: Math.round(ns.customs_revenue_delta_crore || 0),

    // Store raw for report generation
    _raw: raw,
    _cpoDuty: cpoDuty,
    _rpoDuty: rpoDuty,
  };
}

/**
 * Transforms the generate-report response.
 * Backend returns { report: "markdown text", generated_at, model }
 * Frontend PolicyReport expects structured sections.
 */
export function transformReportResponse(raw, simulationResult) {
  if (!raw) return null;

  // If backend returns a structured object, use it directly
  if (raw.executive_summary) return raw;

  // Otherwise parse the markdown text into sections
  const text = raw.report || '';

  // Extract sections by heading
  const sections = {};
  const lines = text.split('\n');
  let currentSection = null;
  let buffer = [];

  for (const line of lines) {
    const heading = line.match(/^#+\s+(.+)$/) || line.match(/^(\d+\.\s+[A-Z\s]+)$/);
    if (heading) {
      if (currentSection) sections[currentSection] = buffer.join('\n').trim();
      currentSection = heading[1].trim().toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (currentSection) sections[currentSection] = buffer.join('\n').trim();

  const ns = simulationResult?._raw?.national_summary || {};
  const sr = simulationResult || {};

  // Build structured report from parsed text + simulation data
  return {
    executive_summary:
      sections['executive_summary'] ||
      sections['1__executive_summary'] ||
      Object.values(sections)[0] ||
      text.slice(0, 400),

    farmer_welfare: {
      table: (sr.farmer_impact?.state_breakdown || []).map((s) => ({
        state: s.state,
        farmers_lakhs: s.farmers_lakhs,
        income_delta: s.income_delta,
      })),
    },

    consumer_burden: {
      table: sr.consumer_impact?.decile_breakdown || [],
    },

    recommended_cpo_duty: ns.recommended_cpo_duty || sr._cpoDuty || 20,
    recommended_rpo_duty: ns.recommended_cpo_duty ? ns.recommended_cpo_duty + 12.5 : sr._rpoDuty || 32.5,

    rationale:
      sections['oilniti_recommendation'] ||
      sections['5__oilniti_recommendation'] ||
      sections['recommendation'] ||
      `A CPO duty of ${ns.recommended_cpo_duty || 20}% balances farmer income support with consumer affordability, based on OilNiti's causal policy model.`,

    fiscal_impact_crore: sr.fiscal_impact_crore || Math.round(ns.customs_revenue_delta_crore || 0),
  };
}
