import { ActivityView } from '../../../core/models';
import { MenuItem } from '../../../shared/components/menu-button/menu-button';

/**
 * Presentation helpers for the activities table: which actions a row offers and
 * what the confirm dialog says. Pure functions (no HTTP, no DOM), so the
 * controller stays lean and the wording lives in one place.
 */

/** A destructive action waiting for confirmation. */
export interface PendingAction {
  kind: 'cancel' | 'delete' | 'blocked';
  view: ActivityView;
  reason?: string;
}

export interface DialogCopy {
  heading: string;
  message: string;
  /** Empty = no confirm button (the dialog only explains). */
  confirmLabel: string;
  cancelLabel: string;
  tone: 'default' | 'danger';
}

/** The less frequent row actions, behind the "More actions" menu. */
export function rowMenu(view: ActivityView): MenuItem[] {
  const items: MenuItem[] = [];
  if (view.status === 'published' && view.taken === 0) items.push({ id: 'unpublish', label: 'Unpublish' });
  if (view.status === 'published') items.push({ id: 'cancel', label: 'Cancel activity…', tone: 'danger' });
  items.push({ id: 'delete', label: 'Delete…', tone: 'danger' });
  return items;
}

export function dialogFor(p: PendingAction): DialogCopy {
  const { title, taken, status } = p.view;
  const people = taken === 1 ? '1 person' : `${taken} people`;
  switch (p.kind) {
    case 'cancel':
      return {
        heading: `Cancel ${title}?`,
        message: taken
          ? `${people} will get a notice and their places are released. This can't be undone.`
          : 'Nobody is registered yet. It will show as cancelled.',
        confirmLabel: 'Cancel activity',
        cancelLabel: 'Keep it',
        tone: 'danger',
      };
    case 'delete':
      return {
        heading: `Delete ${title}?`,
        message: "It disappears for everyone. This can't be undone.",
        confirmLabel: 'Delete activity',
        cancelLabel: 'Keep it',
        tone: 'danger',
      };
    case 'blocked':
      // Still running → offer the safe alternative; already cancelled → only explain.
      return status === 'cancelled'
        ? { heading: `You can't delete ${title}`, message: p.reason ?? '', confirmLabel: '', cancelLabel: 'OK', tone: 'default' }
        : { heading: `You can't delete ${title}`, message: p.reason ?? '', confirmLabel: 'Cancel activity instead', cancelLabel: 'Keep it', tone: 'danger' };
  }
}
