import { SensorData, SensorKPIs, SimulationScenario } from './types';

/**
 * SensorProvider
 * Core interface for IoT Geotechnical Sensor telemetric data providers.
 * Decouples the UI from live hardware, allowing seamless substitution with
 * MQTT, LoRaWAN Gateway, or AWS IoT Core clients.
 */
export interface SensorProvider {
  /**
   * Fetches all registered sensors with their current real-time readings.
   */
  getSensors(): Promise<SensorData[]>;

  /**
   * Fetches detailed telemetric profile and time-series history for a specific sensor.
   */
  getSensorById(sensorId: string): Promise<SensorData | null>;

  /**
   * Calculates fleet health metrics and operational KPIs.
   */
  getKPIs(): Promise<SensorKPIs>;

  /**
   * Subscribes to live stream telemetry events (polling or WebSocket/MQTT events).
   * Returns an unsubscribe cleanup function.
   */
  subscribeSensors(callback: (sensors: SensorData[]) => void): () => void;

  /**
   * Changes the simulation scenario state (NORMAL, WARNING, CRITICAL).
   */
  setSimulationScenario(scenario: SimulationScenario): void;

  /**
   * Manually triggers a telemetry update tick with micro-fluctuations.
   */
  triggerTick(): void;
}
