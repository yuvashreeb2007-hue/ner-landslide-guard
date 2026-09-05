import { SensorProvider } from './SensorProvider';
import { 
  SensorData, 
  SensorKPIs, 
  SimulationScenario, 
  SensorStatus,
  SensorHistoryPoint 
} from './types';
import { INITIAL_NER_SENSORS } from './sensorData';

/**
 * MockSensorSimulator
 * Implements SensorProvider to simulate live real-time IoT geotechnical telemetry
 * with Brownian stochastic micro-pulses, battery drain, and scenario switching (Normal -> Warning -> Critical).
 */
export class MockSensorSimulator implements SensorProvider {
  private sensors: SensorData[];
  private listeners: Set<(sensors: SensorData[]) => void> = new Set();
  private timer: any = null;
  private currentScenario: SimulationScenario = 'WARNING';
  private autoTickEnabled: boolean = true;

  constructor(initialSensors?: SensorData[]) {
    // Deep clone initial state
    this.sensors = JSON.parse(JSON.stringify(initialSensors || INITIAL_NER_SENSORS));
    this.startAutoSimulation();
  }

  private startAutoSimulation() {
    if (typeof window === 'undefined') return;
    if (this.timer) clearInterval(this.timer);
    
    // Simulate telemetric pulse every 3.5 seconds
    this.timer = setInterval(() => {
      if (this.autoTickEnabled) {
        this.triggerTick();
      }
    }, 3500);
  }

  public async getSensors(): Promise<SensorData[]> {
    return JSON.parse(JSON.stringify(this.sensors));
  }

  public async getSensorById(sensorId: string): Promise<SensorData | null> {
    const s = this.sensors.find((item) => item.sensorId === sensorId);
    return s ? JSON.parse(JSON.stringify(s)) : null;
  }

  public async getKPIs(): Promise<SensorKPIs> {
    const total = this.sensors.length;
    const online = this.sensors.filter((s) => s.status === 'ONLINE').length;
    const offline = this.sensors.filter((s) => s.status === 'OFFLINE').length;
    const warning = this.sensors.filter((s) => s.status === 'WARNING').length;
    const critical = this.sensors.filter((s) => s.status === 'CRITICAL').length;

    const avgBat = Math.round(
      this.sensors.reduce((acc, s) => acc + s.battery, 0) / Math.max(1, total)
    );
    const avgSig = Math.round(
      this.sensors.reduce((acc, s) => acc + s.signalStrength, 0) / Math.max(1, total)
    );

    return {
      totalSensors: total,
      online,
      offline,
      warning,
      critical,
      averageBattery: avgBat,
      averageSignal: avgSig
    };
  }

  public subscribeSensors(callback: (sensors: SensorData[]) => void): () => void {
    this.listeners.add(callback);
    // Send immediate initial state
    callback(JSON.parse(JSON.stringify(this.sensors)));

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const copy = JSON.parse(JSON.stringify(this.sensors));
    this.listeners.forEach((fn) => {
      try {
        fn(copy);
      } catch (err) {
        console.error('[MockSensorSimulator] Listener error:', err);
      }
    });
  }

  public setAutoTick(enabled: boolean) {
    this.autoTickEnabled = enabled;
  }

  public setSimulationScenario(scenario: SimulationScenario): void {
    this.currentScenario = scenario;
    const nowStr = new Date().toISOString();

    this.sensors.forEach((s) => {
      if (s.status === 'OFFLINE') return; // keep offline node offline

      if (scenario === 'NORMAL') {
        if (s.sensorType === 'Soil Moisture') {
          s.currentValue = Number((42.0 + Math.random() * 15).toFixed(1));
          s.soilMoisture = s.currentValue;
        } else if (s.sensorType === 'Slope Tilt') {
          s.currentValue = Number((0.8 + Math.random() * 0.8).toFixed(2));
        } else if (s.sensorType === 'Rain Gauge') {
          s.currentValue = Number((Math.random() * 3.5).toFixed(1));
        } else if (s.sensorType === 'Ground Movement') {
          s.currentValue = Number((1.2 + Math.random() * 1.5).toFixed(1));
        }
        s.status = 'ONLINE';
        s.trend = 'STABLE';
      } else if (scenario === 'WARNING') {
        if (s.sensorType === 'Soil Moisture') {
          s.currentValue = Number((78.0 + Math.random() * 6).toFixed(1));
          s.soilMoisture = s.currentValue;
        } else if (s.sensorType === 'Slope Tilt') {
          s.currentValue = Number((3.1 + Math.random() * 0.5).toFixed(2));
        } else if (s.sensorType === 'Rain Gauge') {
          s.currentValue = Number((14.0 + Math.random() * 4).toFixed(1));
        } else if (s.sensorType === 'Ground Movement') {
          s.currentValue = Number((9.5 + Math.random() * 2).toFixed(1));
        }
        s.status = 'WARNING';
        s.trend = 'RISING';
      } else if (scenario === 'CRITICAL') {
        if (s.sensorType === 'Soil Moisture') {
          s.currentValue = Number((91.0 + Math.random() * 6).toFixed(1));
          s.soilMoisture = s.currentValue;
        } else if (s.sensorType === 'Slope Tilt') {
          s.currentValue = Number((4.9 + Math.random() * 1.5).toFixed(2));
        } else if (s.sensorType === 'Rain Gauge') {
          s.currentValue = Number((28.0 + Math.random() * 10).toFixed(1));
        } else if (s.sensorType === 'Ground Movement') {
          s.currentValue = Number((17.5 + Math.random() * 5).toFixed(1));
        }
        s.status = 'CRITICAL';
        s.trend = 'CRITICAL_SURGE';
      }

      s.lastUpdated = nowStr;
      this.appendHistoryPoint(s);
    });

    this.notify();
  }

  public triggerTick(): void {
    const now = new Date();
    const nowStr = now.toISOString();

    this.sensors.forEach((s) => {
      if (s.status === 'OFFLINE') return;

      // Small Brownian fluctuation (-2% to +2%)
      const delta = (Math.random() - 0.48) * (s.currentValue * 0.03 + 0.05);
      let nextVal = Math.max(0, Number((s.currentValue + delta).toFixed(2)));

      if (s.sensorType === 'Soil Moisture') {
        nextVal = Math.min(100, Math.max(15, nextVal));
        s.soilMoisture = nextVal;
      } else if (s.sensorType === 'Slope Tilt') {
        nextVal = Math.min(25, Math.max(0, nextVal));
      }

      s.currentValue = nextVal;
      s.lastUpdated = nowStr;

      // Dynamically evaluate status based on threshold
      if (s.currentValue >= s.threshold * 1.15) {
        s.status = 'CRITICAL';
        s.trend = delta > 0 ? 'CRITICAL_SURGE' : 'RISING';
      } else if (s.currentValue >= s.threshold * 0.9) {
        s.status = 'WARNING';
        s.trend = delta > 0 ? 'RISING' : 'STABLE';
      } else {
        s.status = 'ONLINE';
        s.trend = delta < 0 ? 'FALLING' : 'STABLE';
      }

      // Battery micro-fluctuation / slow discharge
      if (Math.random() < 0.15) {
        s.battery = Math.max(5, s.battery - (Math.random() > 0.8 ? 1 : 0));
      }

      this.appendHistoryPoint(s);
    });

    this.notify();
  }

  private appendHistoryPoint(s: SensorData) {
    const d = new Date();
    const timeLabel = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    
    s.history.push({
      timestamp: timeLabel,
      value: s.currentValue,
      battery: s.battery,
      signalStrength: s.signalStrength
    });

    // Keep last 15 time-series points
    if (s.history.length > 15) {
      s.history.shift();
    }
  }
}
