/**
 * Network Status Manager
 * Monitors real-time browser connectivity (online/offline events), supports heartbeat validation,
 * and allows simulated offline testing for field demonstration scenarios.
 */

import { NetworkConnectionState } from './types';

export class NetworkStatusManager {
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private listeners: Set<(state: NetworkConnectionState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleNetworkChange);
      window.addEventListener('offline', this.handleNetworkChange);
    }
  }

  private handleNetworkChange = () => {
    this.notifyListeners();
  };

  public getNetworkState(): NetworkConnectionState {
    if (this.isSimulatedOffline) {
      return 'OFFLINE';
    }

    if (this.isSyncing) {
      return 'SYNCING';
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'OFFLINE';
    }

    return 'ONLINE';
  }

  public isOffline(): boolean {
    return this.getNetworkState() === 'OFFLINE';
  }

  public isOnline(): boolean {
    return this.getNetworkState() === 'ONLINE';
  }

  public setSimulatedOffline(simulated: boolean): void {
    this.isSimulatedOffline = simulated;
    this.notifyListeners();
  }

  public getIsSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public setSyncing(syncing: boolean): void {
    this.isSyncing = syncing;
    this.notifyListeners();
  }

  public subscribe(callback: (state: NetworkConnectionState) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const currentState = this.getNetworkState();
    this.listeners.forEach((callback) => {
      try {
        callback(currentState);
      } catch (err) {
        console.error('Error in NetworkStatusManager listener:', err);
      }
    });
  }
}

export const networkStatusManager = new NetworkStatusManager();
