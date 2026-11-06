import { Component, DestroyRef, ElementRef, Injector, afterNextRender, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, take } from 'rxjs';
import { ActivityView, NotificationType } from '../../../../core/models';
import { ActivityService } from '../../../../core/services/activity-service';
import { AuthService } from '../../../../core/services/auth-service';
import { NotificationService } from '../../../../core/services/notification-service';
import { NgoService } from '../../../../core/services/ngo-service';
import { ToastService } from '../../../../core/services/toast-service';
import { AttentionKind } from '../../../../core/services/participation-stats-service';
import { broadcastPreset } from '../broadcast-presets';
import { BROADCAST_DEFAULTS, MESSAGE_MAX, TITLE_MAX, broadcastError, targetOf, targetValidator } from './broadcast-form';

/**
 * Broadcast composer (UC5). Controller: the form, a live recipient count, the inbox
 * preview, prefill from the URL (?audience=&activityId=&preset=), and sending via
 * NotificationService.broadcast (per-user copies for unregistered / participants).
 */
@Component({
  selector: 'app-broadcast-tab',
  standalone: false,
  templateUrl: './broadcast-tab.html',
  styleUrl: './broadcast-tab.css',
})
export class BroadcastTab {
  private readonly notifications = inject(NotificationService);
  private readonly activities = inject(ActivityService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly adminId = inject(AuthService).session?.userId ?? '';
  readonly sent = output<void>();

  protected readonly messageMax = MESSAGE_MAX;
  protected readonly type = signal<NotificationType>('broadcast');
  protected readonly confirmOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly submitted = signal(false);
  protected readonly ngos$ = inject(NgoService).list();
  protected readonly activities$ = this.activities.live$().pipe(map((views) => views.filter((v) => v.status === 'published')));
  /** The preview shows the notice as if it arrived just now. */
  protected readonly now = new Date();
  protected readonly createdAt = this.now.toISOString();

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      audience: [BROADCAST_DEFAULTS.audience],
      activityId: [''],
      ngoId: [''],
      title: ['', [Validators.required, Validators.maxLength(TITLE_MAX)]],
      message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX)]],
      urgent: [false],
    },
    { validators: targetValidator },
  );
  protected readonly value = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), { initialValue: this.form.getRawValue() });

  /** How many people the current audience reaches (AJAX, debounced). */
  protected readonly recipients = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.target()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      debounceTime(200),
      switchMap((target) => this.notifications.recipientCount(target)),
    ),
  );

  constructor() {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const activityId = params.get('activityId');
    const preset = params.get('preset') as AttentionKind | null;
    if (activityId && preset) {
      this.activities
        .getView(activityId)
        .pipe(filter((v): v is ActivityView => v !== null), take(1), takeUntilDestroyed())
        .subscribe((view) => this.applyPreset(preset, view));
    } else if (activityId) {
      this.form.patchValue({ audience: 'activity', activityId });
    }
  }

  protected error(field: 'title' | 'message' | 'target'): string | null {
    return this.submitted() ? broadcastError(this.form, field) : null;
  }

  protected review(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
      return;
    }
    this.confirmOpen.set(true);
  }

  protected send(): void {
    const { title, message, urgent } = this.form.getRawValue();
    this.busy.set(true);
    this.notifications
      .broadcast({ ...this.target(), type: this.type(), title: title.trim(), message: message.trim(), urgent, sentBy: this.adminId })
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.confirmOpen.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ recipientCount }) => {
        const who = this.form.getRawValue().audience === 'ngo' ? 'the NGO contact' : recipientCount === 1 ? '1 person' : `${recipientCount} people`;
        this.toast.success(`Sent "${title.trim()}" to ${who}.`);
        this.form.reset(BROADCAST_DEFAULTS);
        this.type.set('broadcast');
        this.submitted.set(false);
        this.sent.emit();
      });
  }

  protected closeConfirm(open: boolean): void {
    if (!open && !this.busy()) this.confirmOpen.set(false);
  }

  private target() {
    return targetOf(this.form.getRawValue());
  }

  private applyPreset(kind: AttentionKind, view: ActivityView): void {
    const preset = broadcastPreset(kind, view);
    this.type.set(preset.type);
    this.form.patchValue({ audience: preset.audience, activityId: preset.activityId ?? '', title: preset.title, message: preset.message, urgent: preset.urgent });
  }
}
