'use client';

import { useState, useEffect } from 'react';
import { SensorProvider } from './SensorProvider';
import { MockSensorSimulator } from './MockSensorSimulator';
import { SensorData, SensorKPIs, SimulationScenario } from './types';

class SensorService {
  private provider: SensorProvider;

  constructor(provider?: SensorProvider) {
    this.provider = provider || new MockSensorSimulator();
  }

  public setProvider(newProvider: SensorProvider): void {
    this.provider = newProvider;
  }

  public async getSensors(): Promise<SensorData[]> {
    return this.provider.getSensors();
  }

  public async getSensorById(sensorId: string): Promise<SensorData | null> {
    return this.provider.getSensorById(sensorId);
  }

  public async getKPIs(): Promise<SensorKPIs> {
    return this.provider.getKPIs();
  }

  public subscribe(callback: (sensors: SensorData[]) => void): () => void {
    return this.provider.subscribeSensors(callback);
  }

  public setScenario(scenario: SimulationScenario): void {
    this.provider.setSimulationScenario(scenario);
  }

  public triggerTick(): void {
    this.provider.triggerTick();
  }
}

export const sensorService = new SensorService();

/**
 * Custom React Hook for live subscribing to IoT Geotechnical Sensor fleet
 */
export function useSensorFleet() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [kpis, setKPIs] = useState<SensorKPIs>({
    totalSensors: 0,
    online: 0,
    offline: 0,
    warning: 0,
    critical: 0,
    averageBattery: 0,
    averageSignal: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = sensorService.subscribe((updatedList) => {
      if (!isMounted) return;
      setSensors(updatedList);
      setIsLoading(false);

      // Recompute KPIs
      const total = updatedList.length;
      const online = updatedList.filter((s) => s.status === 'ONLINE').length;
      const offline = updatedList.filter((s) => s.status === 'OFFLINE').length;
      const warning = updatedList.filter((s) => s.status === 'WARNING').length;
      const critical = updatedList.filter((s) => s.status === 'CRITICAL').length;
      const avgBat = Math.round(
        updatedList.reduce((acc, s) => acc + s.battery, 0) / Math.max(1, total)
      );
      const avgSig = Math.round(
        updatedList.reduce((acc, s) => acc + s.signalStrength, 0) / Math.max(1, total)
      );

      setKPIs({
        totalSensors: total,
        online,
        offline,
        warning,
        critical,
        averageBattery: avgBat,
        averageSignal: avgSig
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    sensors,
    kpis,
    isLoading,
    setScenario: (sc: SimulationScenario) => sensorService.setScenario(sc),
    triggerTick: () => sensorService.triggerTick()
  };
}

export * from './types';
export * from './SensorProvider';
export * from './MockSensorSimulator';
export * from './sensorData';
