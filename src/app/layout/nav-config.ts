import { HOME_BY_ROLE, Role } from '../core/models';

export { HOME_BY_ROLE };

/** One sidebar entry. `icon` is a Lucide name registered in shared/icons.ts. */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Match the path exactly (needed for section roots like /app and /admin). */
  exact: boolean;
}

/** Employee area (PLAN §3). */
export const EMPLOYEE_NAV: readonly NavItem[] = [
  { label: 'Home', path: '/app', icon: 'house', exact: true },
  { label: 'Opportunities', path: '/app/opportunities', icon: 'compass', exact: false },
  { label: 'My registrations', path: '/app/registrations', icon: 'clipboard-list', exact: false },
  { label: 'Notifications', path: '/app/inbox', icon: 'inbox', exact: false },
  { label: 'Check in', path: '/app/check-in', icon: 'scan-qr-code', exact: false },
];

/** Admin area (PLAN §3). */
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Overview', path: '/admin', icon: 'layout-dashboard', exact: true },
  { label: 'Activities', path: '/admin/activities', icon: 'calendar-days', exact: false },
  { label: 'NGOs', path: '/admin/ngos', icon: 'heart-handshake', exact: false },
  { label: 'Participation', path: '/admin/participation', icon: 'chart-column', exact: false },
  { label: 'Notifications', path: '/admin/notifications', icon: 'megaphone', exact: false },
  { label: 'Check-ins', path: '/admin/check-ins', icon: 'qr-code', exact: false },
];

export const NAV_BY_ROLE: Record<Role, readonly NavItem[]> = {
  employee: EMPLOYEE_NAV,
  admin: ADMIN_NAV,
};

export const INBOX_BY_ROLE: Record<Role, string> = {
  employee: '/app/inbox',
  admin: '/admin/notifications',
};
