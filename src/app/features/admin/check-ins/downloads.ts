/**
 * Client-side downloads for the Check-ins page (View helpers: DOM only, no HTTP).
 * A Blob + temporary <a download> saves the file without any server.
 */

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(csv: string, filename: string): void {
  saveBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename);
}

/** "Memory Lane Afternoon" → "memory-lane-afternoon". */
export function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export interface PosterText {
  title: string;
  when: string;
  code: string;
}

/**
 * A printable PNG: the QR code with the activity, date and the 8-character code
 * under it (for people who type it in). Colours and font come from the design tokens.
 */
export function downloadQrPoster(qr: HTMLCanvasElement, text: PosterText, filename: string): void {
  const styles = getComputedStyle(document.documentElement);
  const ink = styles.getPropertyValue('--ink').trim();
  const muted = styles.getPropertyValue('--ink-muted').trim();
  const paper = styles.getPropertyValue('--surface').trim();
  const font = styles.getPropertyValue('--font-sans').trim();
  const width = 800;
  const qrSize = 560;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = 980;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.fillStyle = ink;
  ctx.font = `500 40px ${font}`;
  ctx.fillText(text.title, width / 2, 96);
  ctx.fillStyle = muted;
  ctx.font = `400 26px ${font}`;
  ctx.fillText(text.when, width / 2, 140);
  ctx.imageSmoothingEnabled = false; // keep the modules crisp when scaling
  ctx.drawImage(qr, (width - qrSize) / 2, 180, qrSize, qrSize);
  ctx.fillStyle = muted;
  ctx.font = `400 26px ${font}`;
  ctx.fillText('Scan to check in, or enter this code in Service Day', width / 2, 800);
  ctx.fillStyle = ink;
  ctx.font = `500 72px ${font}`;
  ctx.fillText(`${text.code.slice(0, 4)} ${text.code.slice(4)}`, width / 2, 890);
  canvas.toBlob((blob) => blob && saveBlob(blob, filename), 'image/png');
}
