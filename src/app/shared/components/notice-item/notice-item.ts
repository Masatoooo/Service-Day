import { Component, computed, input } from '@angular/core';
import { AppNotification } from '../../../core/models';
import { NOTICE_ICON } from '../../notice-meta';

/** The fields a notice needs to render (a draft in the composer preview has no id yet). */
export type NoticeLike = Pick<AppNotification, 'type' | 'title' | 'message' | 'urgent' | 'createdAt'>;

/**
 * One notice: type icon, title, optional message, time, urgent label and unread dot.
 * Used by the inbox, the bell dropdown, the broadcast preview and the admin history.
 * Actions (e.g. "Mark as read") are projected as content.
 */
@Component({
  selector: 'app-notice-item',
  standalone: false,
  templateUrl: './notice-item.html',
  styleUrl: './notice-item.css',
})
export class NoticeItem {
  readonly notice = input.required<NoticeLike>();
  readonly now = input.required<Date>();
  readonly unread = input(false);
  /** Show the full message under the title. */
  readonly detailed = input(true);

  protected readonly icon = computed(() => NOTICE_ICON[this.notice().type]);
}
