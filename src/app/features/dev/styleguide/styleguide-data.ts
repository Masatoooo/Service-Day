import { Session } from '../../../core/models';
import { PillOption } from '../../../shared/components/pill-filter/pill-filter';
import { TabItem } from '../../../shared/components/tabs/tabs';

/** Dev-only sample data for the styleguide. Names match the planned seed (PLAN §2, §6.3). */

export interface TokenSwatch {
  token: string;
  role: string;
}

export const COLOR_GROUPS: { name: string; swatches: TokenSwatch[] }[] = [
  {
    name: 'Neutrals',
    swatches: [
      { token: '--canvas', role: 'App background' },
      { token: '--surface', role: 'Cards, sidebar, top bar' },
      { token: '--surface-sunken', role: 'Inputs, inner tiles' },
      { token: '--hairline', role: 'Dividers' },
      { token: '--hairline-strong', role: 'Input outlines, empty slots' },
      { token: '--ink', role: 'Primary text' },
      { token: '--ink-muted', role: 'Secondary text' },
      { token: '--ink-faint', role: 'Placeholders, axis labels' },
    ],
  },
  {
    name: 'Action (Ink)',
    swatches: [
      { token: '--action', role: 'Primary button, selected nav / pill / tab' },
      { token: '--action-hover', role: 'Hover on Ink fills' },
    ],
  },
  {
    name: 'Accent (Pine)',
    swatches: [
      { token: '--accent', role: 'Marks: charts, slot meter, gauge, icon tiles' },
      { token: '--accent-strong', role: 'Links, focus ring, pine text' },
      { token: '--accent-soft', role: 'Icon tiles, selected choice, chips' },
    ],
  },
  {
    name: 'Status',
    swatches: [
      { token: '--success', role: 'Open, checked in' },
      { token: '--success-soft', role: 'Success tint' },
      { token: '--warning', role: 'Last slots, closing soon' },
      { token: '--warning-soft', role: 'Warning tint' },
      { token: '--danger', role: 'Full, destructive' },
      { token: '--danger-soft', role: 'Danger tint' },
      { token: '--info', role: 'Draft, information' },
      { token: '--info-soft', role: 'Info tint' },
    ],
  },
  {
    name: 'NGO avatar tints',
    swatches: [1, 2, 3, 4, 5, 6].map((n) => ({ token: `--tint-${n}`, role: `Tint ${n}` })),
  },
];

export const TYPE_SCALE = [
  { token: '--text-kpi', spec: '40 / 44 · 500', sample: '72 of 128' },
  { token: '--text-h1', spec: '28 / 34 · 500', sample: 'Good morning, Daniel' },
  { token: '--text-h2', spec: '20 / 28 · 500', sample: 'Fill by NGO' },
  { token: '--text-h3', spec: '16 / 24 · 500', sample: 'Recent registrations' },
  { token: '--text-body', spec: '15 / 22 · 400', sample: 'Pack and deliver food hampers for families in the east district.' },
  { token: '--text-small', spec: '13 / 18 · 400', sample: 'Riverbank Food Collective · Sat 21 Nov, 08:30' },
  { token: '--text-micro', spec: '12 / 16 · 500', sample: 'Last slots' },
];

export const SPACE_TOKENS = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `--space-${n}`);
export const RADIUS_TOKENS = ['--radius-card', '--radius-tile', '--radius-input', '--radius-control'];

export const NGOS = [
  { id: 'ngo-riverbank', name: 'Riverbank Food Collective' },
  { id: 'ngo-little-readers', name: 'Little Readers Library' },
  { id: 'ngo-greenline', name: 'Greenline Coastal Cleanup' },
  { id: 'ngo-harbour', name: 'Harbour Animal Shelter' },
  { id: 'ngo-open-hands', name: 'Open Hands Community Kitchen' },
  { id: 'ngo-silver-years', name: 'Silver Years Care Home' },
];

export const SERVICE_TYPES: PillOption[] = [
  { value: 'food', label: 'Food & Nutrition', count: 2 },
  { value: 'education', label: 'Education', count: 2 },
  { value: 'environment', label: 'Environment', count: 2 },
  { value: 'animals', label: 'Animal Welfare', count: 1 },
  { value: 'elderly', label: 'Elderly Care', count: 1 },
  { value: 'community', label: 'Community', count: 1 },
];

export const NOTIFICATION_TABS: TabItem[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'broadcast', label: 'Broadcast' },
  { id: 'history', label: 'History', count: 14 },
];

export const PREVIEW_EMPLOYEE: Session = {
  userId: 'u-daniel-koh',
  name: 'Daniel Koh',
  role: 'employee',
  department: 'Engineering',
};

export const PREVIEW_ADMIN: Session = {
  userId: 'u-masato-kaneko',
  name: 'Masato Kaneko',
  role: 'admin',
  department: 'People & Culture',
};
