/**
 * Where each role lives, and how a category string becomes a role.
 *
 * This module is the single source of truth shared by the middleware (which
 * bounces a signed-in user out of a section they may not view), the post-login
 * router, and the landing-page header (which sends an already-signed-in visitor
 * to their own dashboard instead of offering Login / Sign Up again).
 *
 * Deliberately free of `next/server`, `jsonwebtoken` and any other server-only
 * import so client components and the edge middleware can both use it.
 */

/** Categories are stored with human spacing and casing, e.g. "Relationship Manager". */
export const normaliseRole = (category: unknown): string =>
  typeof category === 'string' ? category.replace(/\s+/g, '').toLowerCase() : '';

/** Landing page for each role, keyed by normalised category. */
export const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  tutor: '/tutor',
  student: '/student',
  academic: '/academy',
  teamlead: '/teamlead/tutors',
  relationshipmanager: '/relationshipmanager',
  saleshead: '/salesHead/society',
};

/**
 * Dashboard path for a category, or null when the category is missing or not
 * one we route. Callers should treat null as "no usable session" rather than
 * guessing a destination.
 */
export function roleHomePath(category: unknown): string | null {
  return ROLE_HOME[normaliseRole(category)] ?? null;
}

/** Button copy for the dashboard link, so the CTA names the role it opens. */
const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin Dashboard',
  tutor: 'Tutor Dashboard',
  student: 'My Dashboard',
  academic: 'Academy Dashboard',
  teamlead: 'Team Lead Dashboard',
  relationshipmanager: 'RM Dashboard',
  saleshead: 'Sales Dashboard',
};

export function roleDashboardLabel(category: unknown): string {
  return ROLE_LABEL[normaliseRole(category)] ?? 'Go to Dashboard';
}
