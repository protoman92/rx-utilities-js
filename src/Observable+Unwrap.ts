import { MonoTypeOperatorFunction, Observable, OperatorFunction, empty, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { Try, TryResult } from 'javascriptutilities';

/**
 * FlatMap to a nullable Observable and return an empty Observable if the result
 * is null.
 * @template T Generic parameter.
 * @template R Generic parameter.
 * @param {(v: T) => Nullable<R>} selector Selector function.
 * @returns {OperatorFunction<T, R>} An OperatorFunction instance.
 */
export function flatMapNonNilOrEmpty<T, R>(selector: (v: T) => TryResult<Observable<R>>): OperatorFunction<T, R> {
  return flatMap(v => {
    let result = Try.evaluate(() => selector(v)).value;

    if (result !== undefined && result !== null) {
      return result;
    } else {
      return empty();
    }
  });
}

/**
 * Map the inner emission to type R and return empty if the result is null.
 * @template T Generic parameter.
 * @template R Generic parameter.
 * @param {(v: T) => TryResult<R>} selector Selector function.
 * @returns {OperatorFunction<T, R>} An OperatorFunction instance.
 */
export function mapNonNilOrEmpty<T, R>(selector: (v: T) => TryResult<R>): OperatorFunction<T, R> {
  return flatMapNonNilOrEmpty(v => {
    return Try.evaluate(() => selector(v)).map(v1 => of(v1));
  });
}

/**
 * Ignore nil emissions.
 * @template T Generics parameter.
 * @returns {MonoTypeOperatorFunction<T>} A MonoTypeOperatorFunction instance.
 */
export function emptyIfNil<T>(): MonoTypeOperatorFunction<T> {
  return mapNonNilOrEmpty(v => v);
}

/**
 * Map the inner emission to type R and return a fallback value if the result is
 * null.
 * @template T Generic parameter.
 * @template R Generic parameter.
 * @param {(v: T) => TryResult<R>} selector Selector function.
 * @param {((v: T) => R) | R} fallback Fallback selector type.
 * @returns {OperatorFunction<T, R>} An OperatorFunction instance.
 */
export function mapNonNilOrElse<T, R>(selector: (v: T) => TryResult<R>, fallback: ((v: T) => R) | R): OperatorFunction<T, R> {
  return map(v => Try.evaluate(() => selector(v)).getOrElse(() => {
    if (fallback instanceof Function) {
      return fallback(v);
    } else {
      return fallback;
    }
  }));
}
