/**
 * Super admin access control.
 * Only akinwoleolaclinton@gmail.com can access /super-admin routes.
 */

const SUPER_ADMIN_EMAIL = 'akinwoleolaclinton@gmail.com'

export function isSuperAdmin(email?: string | null): boolean {
  return email === SUPER_ADMIN_EMAIL
}

export function getSuperAdminEmail(): string {
  return SUPER_ADMIN_EMAIL
}
