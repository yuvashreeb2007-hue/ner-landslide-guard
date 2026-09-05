/**
 * Mock Web Push / Mobile Push Provider (FCM / APNS)
 * Simulates mobile application push notifications with high-priority wake locks,
 * vibration patterns, and action buttons.
 */

import { NotificationProvider } from './NotificationProvider';
import { AlertObject, DeliveryResult } from '../types';

export class MockPushProvider implements NotificationProvider {
  readonly id = 'PROVIDER_PUSH_MOCK';
  readonly name = 'Web Push & Mobile FCM Gateway';
  readonly channel = 'PUSH' as const;
  readonly description = 'Instant high-priority push notifications to registered citizen & responder mobile apps';
  readonly enabled = true;

  async send(alert: AlertObject): Promise<DeliveryResult> {
    const startTime = performance.now();

    // Simulate FCM/APNS cloud messaging latency (90ms - 220ms)
    const simulatedDelay = 110 + Math.floor(Math.random() * 90);
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

    const latencyMs = Math.round(performance.now() - startTime);

    // Push recipient subscriber count
    const recipientCount = Math.round(alert.affectedPopulation * 0.62);

    const messageId = `FCM-NER-PUSH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      channel: 'PUSH',
      providerName: this.name,
      success: true,
      recipientCount,
      latencyMs,
      messageId,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
    };
  }
}
