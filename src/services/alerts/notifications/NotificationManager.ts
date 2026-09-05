/**
 * Notification Manager Orchestrator
 * Coordinates multi-channel broadcasts across all registered providers (In-App, SMS, Web Push).
 * Collects delivery receipts and generates comprehensive audit logs.
 */

import { NotificationProvider } from './NotificationProvider';
import { InAppNotificationProvider } from './InAppNotificationProvider';
import { MockSMSProvider } from './MockSMSProvider';
import { MockPushProvider } from './MockPushProvider';
import { AlertObject, DeliveryLogEntry, DeliveryResult } from '../types';

export class NotificationManager {
  private providers: Map<string, NotificationProvider> = new Map();

  constructor() {
    // Register default providers
    this.registerProvider(new InAppNotificationProvider());
    this.registerProvider(new MockSMSProvider());
    this.registerProvider(new MockPushProvider());
  }

  public registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProviders(): NotificationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Broadcasts an alert across all active notification channels in parallel
   */
  public async broadcastAlert(alert: AlertObject): Promise<DeliveryLogEntry[]> {
    const activeProviders = Array.from(this.providers.values()).filter((p) => p.enabled);
    
    const deliveryPromises = activeProviders.map(async (provider): Promise<DeliveryLogEntry> => {
      try {
        const result: DeliveryResult = await provider.send(alert);
        return {
          channel: result.channel,
          providerName: result.providerName,
          status: result.success ? 'DELIVERED' : 'FAILED',
          timestamp: result.timestamp,
          recipientCount: result.recipientCount,
          latencyMs: result.latencyMs,
          details: result.success
            ? `Successfully transmitted (Msg ID: ${result.messageId})`
            : `Delivery error: ${result.error}`,
        };
      } catch (err: any) {
        return {
          channel: provider.channel,
          providerName: provider.name,
          status: 'FAILED',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
          recipientCount: 0,
          latencyMs: 500,
          details: `Provider failed: ${err?.message || 'Unknown error'}`,
        };
      }
    });

    return await Promise.all(deliveryPromises);
  }
}

export const notificationManager = new NotificationManager();
