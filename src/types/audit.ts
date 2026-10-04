export type AuditCategory =
  | 'AUTHENTICATION'
  | 'ORGANIZATION'
  | 'USERS'
  | 'PROJECTS'
  | 'COMMERCIAL'
  | 'FINANCE'
  | 'RESOURCES'
  | 'ADDONS'
  | 'ADMINISTRATION'
  | 'SECURITY';

export type AuditSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InvestigativeAuditEvent {
  id: string;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;

  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
    isPlatformAdmin?: boolean;
  };

  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  target?: {
    type: string;
    id?: string;
    name?: string;
  };

  request: {
    requestId?: string;
    correlationId?: string;
    method?: string;
    endpoint?: string;
  };

  network: {
    ip: string;
    forwardedIp?: string;
  };

  device: {
    deviceId?: string;
    browser: string;
    browserVersion?: string;
    operatingSystem: string;
    operatingSystemVersion?: string;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'BOT' | 'UNKNOWN';
    formattedUserAgent: string;
  };

  session: {
    sessionId?: string;
    authenticationMethod?: string;
  };

  location?: {
    country?: string;
    city?: string;
  };

  result: {
    status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  };

  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changedFields?: string[];
  };

  metadata?: Record<string, unknown>;
  createdAt: string;

  // Propriedades retrocompatíveis
  organizationId?: string;
  organizationName?: string;
  userId?: string;
  userName?: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
}

export interface AuditLogItem extends InvestigativeAuditEvent {}
