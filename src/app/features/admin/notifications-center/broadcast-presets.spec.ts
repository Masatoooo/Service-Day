import { ActivityView } from '../../../core/models';
import { broadcastPreset } from './broadcast-presets';

const readingBuddies: ActivityView = {
  id: 'act-reading-buddies',
  ngoId: 'ngo-little-readers',
  title: 'Reading Buddies',
  serviceType: 'Education',
  description: '',
  location: 'Little Readers Library, Jalan Sentul, Kuala Lumpur',
  date: '2026-11-20',
  startTime: '09:00',
  endTime: '12:00',
  maxSlots: 12,
  cutoffAt: '2026-11-15T17:00:00+08:00',
  status: 'published',
  checkInCode: null,
  createdAt: '',
  updatedAt: '',
  ngo: { id: 'ngo-little-readers', name: 'Little Readers Library', focusArea: '', description: '', contactName: '', contactEmail: '', verified: true },
  taken: 11,
  remaining: 1,
  availability: 'last-slots',
};

describe('broadcastPreset', () => {
  it('last slots: urgent, all staff, names the place count and the cut-off', () => {
    const preset = broadcastPreset('last-slots', readingBuddies);
    expect(preset.audience).toBe('all-staff');
    expect(preset.type).toBe('last-slots');
    expect(preset.urgent).toBe(true);
    expect(preset.title).toBe('Reading Buddies: 1 place left');
    expect(preset.message).toContain('Little Readers Library — Reading Buddies on Fri 20 Nov, 09:00 has 1 place left');
    expect(preset.message).toContain('Registration closes 15 Nov, 17:00.');
  });

  it('closing soon: a reminder for staff without a place', () => {
    const preset = broadcastPreset('closing-soon', readingBuddies);
    expect(preset.audience).toBe('unregistered');
    expect(preset.type).toBe('reminder');
    expect(preset.urgent).toBe(false);
    expect(preset.title).toBe('Reading Buddies closes 15 Nov, 17:00');
  });

  it('low fill: promotes to all staff with places left out of capacity', () => {
    const preset = broadcastPreset('low-fill', { ...readingBuddies, taken: 1, remaining: 11, availability: 'open' });
    expect(preset.audience).toBe('all-staff');
    expect(preset.activityId).toBe('act-reading-buddies');
    expect(preset.message).toContain('still has 11 of 12 places');
  });
});
