import { convertToParamMap } from '@angular/router';
import { ActivityView, Availability, ServiceType } from '../../../core/models';
import {
  OpportunityCriteria,
  applyCriteria,
  bestSuggestion,
  criteriaFromParams,
  criteriaToParams,
  visibleToEmployees,
} from './opportunity-filters';

function view(id: string, serviceType: ServiceType, availability: Availability, extra: Partial<ActivityView> = {}): ActivityView {
  return {
    id,
    ngoId: 'n',
    title: id,
    serviceType,
    description: '',
    location: 'Kuala Lumpur',
    date: '2026-11-20',
    startTime: '09:00',
    endTime: '12:00',
    maxSlots: 10,
    cutoffAt: '2026-11-15T17:00:00',
    status: 'published',
    checkInCode: null,
    createdAt: '',
    updatedAt: '',
    ngo: { id: 'n', name: 'Riverbank Food Collective', focusArea: '', description: '', contactName: '', contactEmail: '', verified: true },
    taken: 2,
    remaining: 8,
    availability,
    ...extra,
  };
}

const DEFAULTS: OpportunityCriteria = { query: '', type: null, date: null, showAll: false, sort: 'cutoff' };

const views = [
  view('reading', 'Education', 'last-slots', { cutoffAt: '2026-11-15T17:00:00', remaining: 1 }),
  view('mangrove', 'Environment', 'full', { remaining: 0 }),
  view('kennel', 'Animal Welfare', 'closed', { isRegisteredByMe: true }),
  view('lunch', 'Food & Nutrition', 'closing-soon', { cutoffAt: '2026-11-07T12:00:00', remaining: 8 }),
  view('beach', 'Environment', 'open', { date: '2026-11-27', cutoffAt: '2026-11-24T17:00:00', remaining: 25 }),
  view('stem', 'Education', 'draft', { status: 'draft' }),
];

describe('opportunity filters', () => {
  it('reads and writes the URL, leaving defaults out', () => {
    const criteria = criteriaFromParams(convertToParamMap({ type: 'Education', all: '1', sort: 'slots' }));
    expect(criteria).toEqual({ query: '', type: 'Education', date: null, showAll: true, sort: 'slots' });
    expect(criteriaToParams(DEFAULTS)).toEqual({ q: null, type: null, date: null, all: null, sort: null });
  });

  it('ignores an unknown service type in the URL', () => {
    expect(criteriaFromParams(convertToParamMap({ type: 'Space travel' })).type).toBeNull();
  });

  it('hides drafts from employees', () => {
    expect(visibleToEmployees(views).map((v) => v.id)).not.toContain('stem');
  });

  it('by default shows bookable activities plus your own place, soonest cut-off first', () => {
    expect(applyCriteria(visibleToEmployees(views), DEFAULTS).map((v) => v.id)).toEqual(['lunch', 'reading', 'kennel', 'beach']);
  });

  it('includes full and closed activities when asked', () => {
    expect(applyCriteria(views, { ...DEFAULTS, showAll: true, type: 'Environment' }).map((v) => v.id)).toEqual(['mangrove', 'beach']);
  });

  it('searches title, NGO and location, case-insensitive', () => {
    expect(applyCriteria(views, { ...DEFAULTS, query: 'BEACH' }).map((v) => v.id)).toEqual(['beach']);
  });

  it('sorts by most slots left', () => {
    expect(applyCriteria(views, { ...DEFAULTS, sort: 'slots' })[0].id).toBe('beach');
  });

  it('suggests the smallest change first, keeping the service type', () => {
    // Environment on 20 Nov: Mangrove is full (hidden) and Beach is on 27 Nov, so nothing matches.
    // Including full activities brings Mangrove back without dropping "Environment".
    const criteria: OpportunityCriteria = { ...DEFAULTS, type: 'Environment', date: '2026-11-20' };
    expect(bestSuggestion(views, criteria)).toMatchObject({ label: 'Include full and closed activities', extra: 1 });
  });

  it('moves on to the date when full/closed are already shown', () => {
    const criteria: OpportunityCriteria = { ...DEFAULTS, type: 'Food & Nutrition', date: '2026-11-27', showAll: true };
    expect(bestSuggestion(views, criteria)).toMatchObject({ label: 'Clear the date filter', extra: 1 });
  });

  it('suggests clearing the search when only that helps', () => {
    expect(bestSuggestion(views, { ...DEFAULTS, query: 'no such activity anywhere', showAll: true })).toMatchObject({ patch: { query: '' } });
  });

  it('returns null when nothing would help', () => {
    expect(bestSuggestion([], DEFAULTS)).toBeNull();
  });
});
