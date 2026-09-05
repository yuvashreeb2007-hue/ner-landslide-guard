/**
 * In-App Notification Provider
 * Delivers alerts to the real-time EOC Command Center UI, audio alert siren, and live notification drawer.
 */

import { NotificationProvider } from './NotificationProvider';
import { AlertObject, DeliveryResult } from '../types';

export class InAppNotificationProvider implements NotificationProvider {
  readonly id = 'PROVIDER_INAPP';
  readonly name = 'In-App EOC Command Feed';
  readonly channel = 'APP' as const;
  readonly description = 'Instant EOC dispatch ticker, emergency modal popup, and audio siren telemetry';
  readonly enabled = true;

  async send(alert: AlertObject): Promise<DeliveryResult> {
    const startTime = performance.now();

    // Simulate instant in-app dispatch
    await new Promise((resolve) => setTimeout(resolve, 45));

    const latencyMs = Math.round(performance.now() - startTime);

    // Estimate active dashboard operators & field tablets in district
    const recipientCount = alert.severity === 'CRITICAL' ? 38 : alert.severity === 'DANGER' ? 24 : 12;

    // Dispatches a custom browser event if running in browser
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('ner-landslide-alert', {
        detail: {
          alertId: alert.id,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          district: alert.district,
          state: alert.state,
        },
      });
      window.dispatchEvent(event);
    }

    return {
      channel: 'APP',
      providerName: this.name,
      success: true,
      recipientCount,
      latencyMs,
      messageId: `INAPP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
    };
  }
}
