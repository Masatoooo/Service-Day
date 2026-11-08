import { Pipe, PipeTransform } from '@angular/core';

/** Small words that should not become an initial ("Kaneko.co" → "HC"). */
const SKIP = new Set(['&', 'and', 'of', 'the', 'for']);

/** "Riverbank Food Collective" → "RF", "Daniel Koh" → "DK". */
@Pipe({ name: 'initials', standalone: false })
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) {
      return '';
    }
    return name
      .split(/\s+/)
      .filter((word) => word && !SKIP.has(word.toLowerCase()))
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}
