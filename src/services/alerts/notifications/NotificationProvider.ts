/**
 * Abstract Notification Provider interface for NER LandslideGuard
 * Enables pluggable integration for InApp, SMS (Twilio/CDAC), Web Push (FCM/APNS), and sirens.
 */

import { AlertObject, DeliveryChannelType, DeliveryResult } from '../types';

export interface NotificationProvider {
  readonly id: string;
  readonly name: string;
  readonly channel: DeliveryChannelType;
  readonly description: string;
  readonly enabled: boolean;

  /**
   * Dispatches the alert to the designated communications channel
   */
  send(alert: AlertObject): Promise<DeliveryResult>;
}
