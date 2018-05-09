import { from, OperatorFunction } from 'rxjs';
import { flatMap } from 'rxjs/operators';

/**
 * Flatten an emission by converting it to an Array of some type.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {(value: T) => R[]} transform Transform function.
 * @returns {OperatorFunction<T, R>} An OperatorFunction instance.
 */
export function flatMapIterable<T, R>(transform: (value: T) => R[]): OperatorFunction<T, R> {
  return flatMap(value => from(transform(value)));
}