export interface SystemMetrics {
  uptimeSeconds: number;
  databaseStatus: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
  totalEntitiesCount: number;
  totalTransactionsProcessed: number;
  activeAlertsCount: number;
  openCasesCount: number;
  memoryUsageMb: number;
}

export interface IAdminService {
  getSystemMetrics(): Promise<SystemMetrics>;
}

export class AdminServiceStub implements IAdminService {
  async getSystemMetrics(): Promise<SystemMetrics> {
    return {
      uptimeSeconds: process.uptime(),
      databaseStatus: 'HEALTHY',
      totalEntitiesCount: 1420,
      totalTransactionsProcessed: 89450,
      activeAlertsCount: 18,
      openCasesCount: 5,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}

export const adminService = new AdminServiceStub();
