//SimulationContext.jsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockSimulationResult, mockPolicyReport } from '../mockData';
import { transformSimulationResponse, transformReportResponse } from '../utils/transformers';
import { API_BASE } from '../config';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [cpoDuty, setCpoDuty] = useState(20);
  const [rpoDuty, setRpoDuty] = useState(32.5);
  const [globalShock, setGlobalShock] = useState(0);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [policyReport, setPolicyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState('default');

  const runSimulation = useCallback(async (cpo = cpoDuty, rpo = rpoDuty, shock = globalShock) => {
    setIsLoading(true);
    setError(null);
    setPolicyReport(null);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpo_duty: cpo, rpo_duty: rpo, global_cpo_shock_pct: shock }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const raw = await res.json();
      // Transform backend shape → frontend shape
      const transformed = transformSimulationResponse(raw, cpo, rpo);
      setSimulationResult(transformed);
    } catch (err) {
      setError('Simulation service unavailable. Check that the backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }, [cpoDuty, rpoDuty, globalShock]);

  const generateReport = useCallback(async () => {
    if (!simulationResult) return;
    setReportLoading(true);
    setError(null);
    try {
      // Backend expects: { simulation_result: <raw>, cpo_duty: number, rpo_duty: number }
      const body = {
        simulation_result: simulationResult._raw || simulationResult,
        cpo_duty: simulationResult._cpoDuty ?? cpoDuty,
        rpo_duty: simulationResult._rpoDuty ?? rpoDuty,
      };
      const res = await fetch(`${API_BASE}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const raw = await res.json();
      // Transform backend report → frontend PolicyReport shape
      const transformed = transformReportResponse(raw, simulationResult);
      setPolicyReport(transformed);
    } catch (err) {
      setError('Report generation failed. Check that the backend is running on port 8000.');
    } finally {
      setReportLoading(false);
    }
  }, [simulationResult, cpoDuty, rpoDuty]);

  const useMockData = useCallback(() => {
    setSimulationResult(mockSimulationResult);
    setError(null);
    setPolicyReport(null);
  }, []);

  const useMockReport = useCallback(() => {
    setPolicyReport(mockPolicyReport);
  }, []);

  const applyPreset = useCallback((preset) => {
    setActivePreset(preset);
    const presets = {
      ukraine:    { cpo: 5.0,  rpo: 12.5,  shock: 40.0 },
      indonesia:  { cpo: 5.0,  rpo: 12.5,  shock: 28.0 },
      budget2024: { cpo: 27.5, rpo: 37.5,  shock: 0.0  },
      zero_duty:  { cpo: 0.0,  rpo: 0.0,   shock: 0.0  },
      default:    { cpo: 20.0, rpo: 32.5,  shock: 0.0  },
    };
    const { cpo, rpo, shock } = presets[preset] || presets.default;
    setCpoDuty(cpo);
    setRpoDuty(rpo);
    setGlobalShock(shock);
    return { cpo, rpo, shock };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <SimulationContext.Provider value={{
      cpoDuty, setCpoDuty,
      rpoDuty, setRpoDuty,
      globalShock, setGlobalShock,
      simulationResult, setSimulationResult,
      isLoading,
      policyReport, setPolicyReport,
      reportLoading,
      error, clearError,
      activePreset,
      runSimulation,
      generateReport,
      useMockData,
      useMockReport,
      applyPreset,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
};

export default SimulationContext;
