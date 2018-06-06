import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { filter, scan } from 'rxjs/operators';
import { Try } from 'javascriptutilities';
import { mapNonNilOrEmpty } from './Observable+Unwrap';

/**
 * Ensure the order of emission according to some order selector by skipping
 * some elements if they are out of order.
 * @template T Generic parameter.
 * @param {(current: T, previous: T) => boolean} fn Order selector function.
 * If this function returns true, emit current, otherwise skip it.
 * @returns {MonoTypeOperatorFunction<T>} An MonoTypeOperatorFunction instance.
 */
export function ensureOrder<T>(fn: (current: T, previous: T) => boolean): MonoTypeOperatorFunction<T> {
  interface ScannedValue {
    larger: boolean;
    value: Try<T>;
  }
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      scan((acc: ScannedValue, v: T): ScannedValue => ({
        larger: acc.value.map(v1 => fn(v, v1)).getOrElse(true),
        value: Try.success(v),
      }), { larger: true, value: Try.failure<T>('') }),
      filter(v => v.larger),
      mapNonNilOrEmpty<ScannedValue, T>(v => v.value.value),
    );
  };
}
