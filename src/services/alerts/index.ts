/**
 * Central Exports for NER LandslideGuard Alert Engine
 */

'use client';

import { useState, useEffect } from 'react';
import { alertService } from './AlertService';
import { alertRulesEngine, STANDARD_ALERT_RULES } from './AlertRulesEngine';
import { notificationManager } from './notifications/NotificationManager';
import {
  AlertObject,
  AlertSeverity,
  AlertStatus,
  RuleDefinition,
  RuleEvaluationInput,
  DeliveryLogEntry,
} from './types';

export * from './types';
export { alertRulesEngine, STANDARD_ALERT_RULES } from './AlertRulesEngine';
export { alertService } from './AlertService';
export { notificationManager } from './notifications/NotificationManager';

/**
 * Custom React Hook for real-time alert state and operations
 */
export function useAlertEngine() {
  const [alerts, setAlerts] = useState<AlertObject[]>(() => alertService.getAlerts());
  const [activeAlerts, setActiveAlerts] = useState<AlertObject[]>(() => alertService.getActiveAlerts());
  const [alertHistory, setAlertHistory] = useState<AlertObject[]>(() => alertService.getAlertHistory());
  const [rules, setRules] = useState<RuleDefinition[]>(() => alertRulesEngine.getRules());
  const [metrics, setMetrics] = useState(() => alertService.getMetrics());

  useEffect(() => {
    const updateState = () => {
      setAlerts(alertService.getAlerts());
      setActiveAlerts(alertService.getActiveAlerts());
      setAlertHistory(alertService.getAlertHistory());
      setMetrics(alertService.getMetrics());
    };

    const unsubscribe = alertService.subscribe(updateState);
    return () => unsubscribe();
  }, []);

  const acknowledgeAlert = (id: string, officerName?: string) => {
    return alertService.acknowledgeAlert(id, officerName);
  };

  const escalateAlert = (id: string, targetAuthority?: string) => {
    return alertService.escalateAlert(id, targetAuthority);
  };

  const dispatchResponseTeam = (id: string, teamNames?: string[]) => {
    return alertService.dispatchResponseTeam(id, teamNames);
  };

  const resolveAlert = (id: string, note?: string) => {
    return alertService.resolveAlert(id, note);
  };

  const evaluateAndTriggerAlert = async (input: RuleEvaluationInput) => {
    return await alertService.evaluateAndTriggerAlert(input);
  };

  const toggleRule = (ruleId: string, enabled: boolean) => {
    alertRulesEngine.toggleRule(ruleId, enabled);
    setRules(alertRulesEngine.getRules());
  };

  return {
    alerts,
    activeAlerts,
    alertHistory,
    rules,
    metrics,
    acknowledgeAlert,
    escalateAlert,
    dispatchResponseTeam,
    resolveAlert,
    evaluateAndTriggerAlert,
    toggleRule,
    testEvaluation: (input: RuleEvaluationInput) => alertRulesEngine.evaluate(input),
  };
}
