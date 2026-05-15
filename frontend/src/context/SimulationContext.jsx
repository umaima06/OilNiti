import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockSimulationResult, mockPolicyReport } from '../mockData';
import { transformSimulationResponse, transformReportResponse } from '../utils/transformers';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [cpoDuty, setCpoDuty] = useState(100);
  const [rpoDuty, setRpoDuty] = useState(13.75);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [policyReport, setPolicyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState('default');

  const runSimulation = useCallback(async (cpo = cpoDuty, rpo = rpoDuty) => {
    setIsLoading(true);
    setError(null);
    setPolicyReport(null);
    try {
      const res = await fetch('http://localhost:8000/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpo_duty: cpo, rpo_duty: rpo }),
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
  }, [cpoDuty, rpoDuty]);

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
      const res = await fetch('http://localhost:8000/generate-report', {
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
      ukraine:   { cpo: 5.5,  rpo: 5.5   },
      indonesia: { cpo: 100,  rpo: 13.75 },
      budget2025:{ cpo: 20,   rpo: 32.5  },
      default:   { cpo: 100,  rpo: 13.75 },
    };
    const { cpo, rpo } = presets[preset] || presets.default;
    setCpoDuty(cpo);
    setRpoDuty(rpo);
    return { cpo, rpo };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <SimulationContext.Provider value={{
      cpoDuty, setCpoDuty,
      rpoDuty, setRpoDuty,
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
