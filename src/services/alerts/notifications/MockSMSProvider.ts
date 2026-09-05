/**
 * Mock SMS Notification Provider (Cell Broadcast & Geo-Fenced SMS)
 * Simulates telecom SMS delivery conforming to NDMA / CAP-IPAWS standards.
 * Designed with a clean decoupled interface so Twilio, AWS SNS, or C-DAC SMS Gateway
 * can be plugged in later by configuring API credentials without modifying caller code.
 */

import { NotificationProvider } from './NotificationProvider';
import { AlertObject, DeliveryResult } from '../types';

export class MockSMSProvider implements NotificationProvider {
  readonly id = 'PROVIDER_SMS_MOCK';
  readonly name = 'Cell-Broadcast & Telecom SMS Gateway';
  readonly channel = 'SMS' as const;
  readonly description = 'Geo-targeted cell tower emergency SMS broadcast (NDMA / C-DAC / Twilio ready)';
  readonly enabled = true;

  // Configuration placeholders for future real SMS provider
  private apiKey?: string;
  private senderId: string;

  constructor(apiKey?: string, senderId = 'NDMA-NER') {
    this.apiKey = apiKey;
    this.senderId = senderId;
  }

  /**
   * Formats a standardized 160-char SMS bulletin
   */
  public formatSmsPayload(alert: AlertObject): string {
    const prefix = alert.severity === 'CRITICAL' ? '🔴 RED ALERT' : alert.severity === 'DANGER' ? '🟠 DANGER' : '🟡 WARNING';
    return `${prefix} [${this.senderId}]: Landslide threat in ${alert.district}, ${alert.location}. Action: ${alert.recommendedAction.slice(0, 75)}... Call 1070/1078.`;
  }

  async send(alert: AlertObject): Promise<DeliveryResult> {
    const startTime = performance.now();

    // Simulate telecom network propagation latency (120ms - 280ms)
    const simulatedDelay = 150 + Math.floor(Math.random() * 120);
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    const latencyMs = Math.round(performance.now() - startTime);

    // Estimate delivered SMS recipients based on affected population & mobile density in NER
    const recipientCount = Math.round(alert.affectedPopulation * 0.88);

    const messageId = `SMS-GATEWAY-IN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;

    return {
      channel: 'SMS',
      providerName: this.name,
      success: true,
      recipientCount,
      latencyMs,
      messageId,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
    };
  }
}
