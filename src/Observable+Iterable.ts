import { from, OperatorFunction } from 'rxjs';
import { flatMap } from 'rxjs/operators';

/**
 * Flatten an emission by converting it to an Array of some type.
 * @template T Generics parameter.
 * @template R Generics parameter. Defaults to T if not specified.
 * @param {(value: T) => R[]} transform Transform function.
 * @returns {OperatorFunction<T, R>} An OperatorFunction instance.
 */
export function flatMapIterable<T, R= T>(transform: (value: T) => R[]): OperatorFunction<T, R> {
  return flatMap(value => from(transform(value)));
}
