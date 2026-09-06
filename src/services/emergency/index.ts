/**
 * Central Exports and Custom Hook for Emergency Response Prioritization
 */

'use client';

import { useState, useEffect } from 'react';
import { emergencyService } from './EmergencyService';
import { PrioritizationEngine } from './PrioritizationEngine';
import {
  EmergencyTeam,
  PrioritizedIncident,
  IncidentRelationshipChain,
  ReliefCamp,
  PriorityTier,
  EmergencyPriorityScore,
} from './types';

export * from './types';
export { emergencyService } from './EmergencyService';
export { PrioritizationEngine } from './PrioritizationEngine';

export function useEmergencyResponse() {
  const [incidents, setIncidents] = useState<PrioritizedIncident[]>(() =>
    emergencyService.getPrioritizedQueue()
  );
  const [responseTeams, setResponseTeams] = useState<EmergencyTeam[]>(() =>
    emergencyService.getResponseTeams()
  );
  const [reliefCamps, setReliefCamps] = useState<ReliefCamp[]>(() =>
    emergencyService.getReliefCamps()
  );
  const [metrics, setMetrics] = useState(() => emergencyService.getMetrics());

  useEffect(() => {
    const updateState = () => {
      setIncidents(emergencyService.getPrioritizedQueue());
      setResponseTeams(emergencyService.getResponseTeams());
      setReliefCamps(emergencyService.getReliefCamps());
      setMetrics(emergencyService.getMetrics());
    };

    const unsubscribe = emergencyService.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const dispatchTeam = (incidentId: string, teamId: string) => {
    return emergencyService.dispatchTeam(incidentId, teamId);
  };

  const recallTeam = (teamId: string) => {
    emergencyService.recallTeam(teamId);
  };

  const getRelationshipChain = (incidentId: string): IncidentRelationshipChain | null => {
    return emergencyService.getRelationshipChain(incidentId);
  };

  return {
    incidents,
    responseTeams,
    reliefCamps,
    metrics,
    dispatchTeam,
    recallTeam,
    getRelationshipChain,
  };
}
