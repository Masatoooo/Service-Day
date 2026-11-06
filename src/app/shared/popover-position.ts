/**
 * Places a fixed-position popover under its trigger, right edges aligned, or above
 * it when there is no room below. Kept on screen with a small margin.
 * (Presentation helper shared by the row menu and the notification bell.)
 */
export function placeUnder(trigger: HTMLElement, panel: HTMLElement, gap = 6): void {
  const button = trigger.getBoundingClientRect();
  const { width, height } = panel.getBoundingClientRect();
  const below = button.bottom + gap + height <= window.innerHeight - gap;
  panel.style.top = `${below ? button.bottom + gap : Math.max(gap, button.top - gap - height)}px`;
  panel.style.left = `${Math.max(gap, Math.min(button.right - width, window.innerWidth - width - gap))}px`;
}
