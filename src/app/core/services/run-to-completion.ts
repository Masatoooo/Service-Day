import { Observable, ReplaySubject } from 'rxjs';

/**
 * AJAX: some writes take several requests in a row (switch = PATCH the old place,
 * POST the new one, POST a notice). Components subscribe with takeUntilDestroyed,
 * so leaving the page mid-way would unsubscribe and stop the chain half done
 * (old place released, new place never created).
 *
 * This starts the chain immediately and lets it finish on its own; the caller
 * still receives the result (or the error) if it is still listening.
 */
export function runToCompletion<T>(source$: Observable<T>): Observable<T> {
  const result$ = new ReplaySubject<T>(1);
  source$.subscribe(result$);
  return result$.asObservable();
}
