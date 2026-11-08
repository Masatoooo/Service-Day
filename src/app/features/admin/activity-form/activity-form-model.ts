import { ValidationErrors } from '@angular/forms';
import { format, formatISO } from 'date-fns';
import { ActivityView, ServiceType } from '../../../core/models';
import { NewActivity } from '../../../core/services/activity-service';

/** The flat form value (cut-off is split into date + time inputs). */
export interface ActivityFormValue {
  ngoId: string;
  title: string;
  serviceType: string;
  description: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  cutoffDate: string;
  cutoffTime: string;
  status: 'draft' | 'published';
}

export type ActivityField = keyof ActivityFormValue;

/** Activity → form value, for editing. */
export function formValueFrom(view: ActivityView): ActivityFormValue {
  const cutoff = new Date(view.cutoffAt);
  return {
    ngoId: view.ngoId,
    title: view.title,
    serviceType: view.serviceType,
    description: view.description,
    location: view.location,
    date: view.date,
    startTime: view.startTime,
    endTime: view.endTime,
    maxSlots: view.maxSlots,
    cutoffDate: format(cutoff, 'yyyy-MM-dd'),
    cutoffTime: format(cutoff, 'HH:mm'),
    status: view.status === 'published' ? 'published' : 'draft',
  };
}

/** Form value → what ActivityService saves (cut-off as local ISO with offset). */
export function buildActivityInput(value: ActivityFormValue): NewActivity {
  return {
    ngoId: value.ngoId,
    title: value.title.trim(),
    serviceType: value.serviceType as ServiceType,
    description: value.description.trim(),
    location: value.location.trim(),
    date: value.date,
    startTime: value.startTime,
    endTime: value.endTime,
    maxSlots: Number(value.maxSlots),
    cutoffAt: formatISO(new Date(`${value.cutoffDate}T${value.cutoffTime}:00`)),
    status: value.status,
  };
}

/** One specific sentence per validation error (says what is wrong and how to fix it). */
export function messageFor(field: ActivityField, errors: ValidationErrors): string | null {
  if (errors['endBeforeStart']) return `The end time must be after the start time (${errors['endBeforeStart'].start}).`;
  if (errors['cutoffAfterStart']) return `The cut-off must be before the activity starts (${errors['cutoffAfterStart'].start}).`;
  if (errors['belowTaken']) {
    const taken = errors['belowTaken'].taken;
    return `Max slots can't go below the ${taken} ${taken === 1 ? 'person' : 'people'} already registered.`;
  }
  const messages: Partial<Record<ActivityField, Record<string, string>>> = {
    ngoId: { required: 'Choose the NGO running this activity.' },
    title: { required: 'Give the activity a name.', maxlength: 'Keep the name under 80 characters.' },
    serviceType: { required: 'Choose a service type.' },
    description: {
      required: 'Describe what volunteers will do.',
      minlength: 'Add a little more detail (at least 20 characters).',
      maxlength: 'Keep the description under 800 characters.',
    },
    location: { required: 'Say where volunteers should go.', maxlength: 'Keep the location under 120 characters.' },
    date: { required: 'Pick the day of the activity.' },
    startTime: { required: 'Add a start time.' },
    endTime: { required: 'Add an end time.' },
    maxSlots: { required: 'Say how many volunteers can join.', min: 'An activity needs at least 1 slot.', max: 'Up to 500 slots per activity.' },
    cutoffDate: { required: 'Pick the day registration closes.' },
    cutoffTime: { required: 'Add the time registration closes.' },
  };
  const key = Object.keys(errors).find((k) => messages[field]?.[k]);
  return key ? messages[field]![key] : null;
}
