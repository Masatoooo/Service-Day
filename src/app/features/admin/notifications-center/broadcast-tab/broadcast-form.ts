import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { AudienceTarget } from '../../../../core/services/notification-service';

/** Broadcast form helpers: defaults, the cross-field rule, messages, and form value → target. */

export type BroadcastAudience = AudienceTarget['audience'];
export const MESSAGE_MAX = 500;
export const TITLE_MAX = 80;

export interface BroadcastFormValue {
  audience: BroadcastAudience;
  activityId: string;
  ngoId: string;
  title: string;
  message: string;
  urgent: boolean;
}

export const BROADCAST_DEFAULTS: BroadcastFormValue = {
  audience: 'all-staff',
  activityId: '',
  ngoId: '',
  title: '',
  message: '',
  urgent: false,
};

/** Cross-field: "participants of an activity" needs an activity, "NGO contact" needs an NGO. */
export function targetValidator(group: AbstractControl): ValidationErrors | null {
  const { audience, activityId, ngoId } = group.value as BroadcastFormValue;
  if (audience === 'activity' && !activityId) return { needsActivity: true };
  if (audience === 'ngo' && !ngoId) return { needsNgo: true };
  return null;
}

/** One specific sentence per problem (says how to fix it). */
export function broadcastError(form: FormGroup, field: 'title' | 'message' | 'target'): string | null {
  if (field === 'target') {
    if (form.hasError('needsActivity')) return 'Choose the activity whose participants should get this.';
    if (form.hasError('needsNgo')) return 'Choose the NGO to contact.';
    return null;
  }
  const errors = form.get(field)?.errors;
  if (!errors) return null;
  if (errors['required']) return field === 'title' ? 'Give the notice a short title.' : 'Write the message people will read.';
  return field === 'title' ? `Keep the title under ${TITLE_MAX} characters.` : `Keep the message under ${MESSAGE_MAX} characters.`;
}

export function targetOf({ audience, activityId, ngoId }: BroadcastFormValue): AudienceTarget {
  return {
    audience,
    activityId: audience === 'activity' ? activityId || null : null,
    ngoId: audience === 'ngo' ? ngoId || null : null,
  };
}
