export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INVESTIGATOR' | 'ANALYST' | 'AUDITOR';
  badgeNumber?: string;
}

export interface IAuthService {
  validateToken(token: string): Promise<AuthSession | null>;
  hasPermission(session: AuthSession, action: string): boolean;
}

export class AuthServiceStub implements IAuthService {
  async validateToken(_token: string): Promise<AuthSession | null> {
    return {
      userId: 'inv-demo-001',
      name: 'Agent Kiddo',
      email: 'investigator@fintrace.gov.in',
      role: 'INVESTIGATOR',
      badgeNumber: 'SIH-2026-FT',
    };
  }

  hasPermission(_session: AuthSession, _action: string): boolean {
    return true;
  }
}

export const authService = new AuthServiceStub();
