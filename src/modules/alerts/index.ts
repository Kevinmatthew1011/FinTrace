export interface SystemAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  entityId?: string;
  createdAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface IAlertsService {
  getActiveAlerts(): Promise<SystemAlert[]>;
  updateAlertStatus(alertId: string, status: string): Promise<boolean>;
}

export class AlertsServiceStub implements IAlertsService {
  async getActiveAlerts(): Promise<SystemAlert[]> {
    return [
      {
        id: 'ALT-1092',
        type: 'RAPID_DISPERSAL',
        severity: 'CRITICAL',
        title: 'Rapid Dispersal Detected in Node Alpha',
        description: 'INR 24.2 Lakhs split into 12 beneficiary accounts within 6 minutes.',
        entityId: 'ENT-9021',
        createdAt: new Date().toISOString(),
        status: 'OPEN',
      },
      {
        id: 'ALT-1093',
        type: 'CYCLIC_TRANSACTION',
        severity: 'HIGH',
        title: 'Closed Loop Fund Routing',
        description: 'Circular money movement detected across 3 shell company accounts.',
        entityId: 'ENT-4412',
        createdAt: new Date().toISOString(),
        status: 'INVESTIGATING',
      },
    ];
  }

  async updateAlertStatus(_alertId: string, _status: string): Promise<boolean> {
    return true;
  }
}

export const alertsService = new AlertsServiceStub();
