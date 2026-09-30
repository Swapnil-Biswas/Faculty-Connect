/**
 * Audit Middleware — wraps every mutating service call
 *
 * Single entry point so coverage is consistent.
 * Every write that goes through withAudit() gets a row in AuditLog.
 */

import { db } from "@/lib/db";

export interface AuditParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: object | null;
  afterState?: object | null;
  isImpersonated?: boolean;
  impersonatorId?: string;
  ipAddress?: string;
}

/** Write an audit log entry directly */
export async function writeAudit(params: AuditParams) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeState: params.beforeState ?? undefined,
      afterState: params.afterState ?? undefined,
      isImpersonated: params.isImpersonated ?? false,
      impersonatorId: params.impersonatorId,
      ipAddress: params.ipAddress,
    },
  });
}

/**
 * Higher-order wrapper: run fn(), then write audit log.
 * beforeState and afterState can be passed explicitly or derived from fn result.
 */
export async function withAudit<T>(
  params: Omit<AuditParams, "afterState"> & {
    fn: () => Promise<T>;
    deriveAfterState?: (result: T) => object | null;
  }
): Promise<T> {
  const result = await params.fn();

  await writeAudit({
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    beforeState: params.beforeState,
    afterState: params.deriveAfterState
      ? params.deriveAfterState(result)
      : (result as object),
    isImpersonated: params.isImpersonated,
    impersonatorId: params.impersonatorId,
    ipAddress: params.ipAddress,
  });

  return result;
}
