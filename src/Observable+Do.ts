import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Side effect: perform some action when an element is emitted.
 * @template T Generics parameter.
 * @param {(element: T) => void} perform Perform function.
 * @returns {MonoTypeOperatorFunction<T>} An Operator function.
 */
export function doOnNext<T>(perform: (value: T) => void): MonoTypeOperatorFunction<T> {
  return tap((v: T) => perform(v));
}

/**
 * Side effect: perform some action when an error is emitted.
 * @template T Generics parameter.
 * @param {(error: Error) => void} perform Perform function.
 * @returns {MonoTypeOperatorFunction<T>} An Operator function.
 */
export function doOnError<T>(perform: (error: Error) => void): MonoTypeOperatorFunction<T> {
  return tap(() => { }, (err: Error) => perform(err));
}

/**
 * Side effect: perform some action when the stream completes.
 * @template T Generics parameter.
 * @param  {() => void} perform Perform function.
 * @returns {MonoTypeOperatorFunction<T>} An Operator function.
 */
export function doOnCompleted<T>(perform: () => void): MonoTypeOperatorFunction<T> {
  return tap(() => { }, () => { }, () => perform());
}