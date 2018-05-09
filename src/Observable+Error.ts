import { OperatorFunction, of } from 'rxjs';
import { catchError, } from 'rxjs/operators';

/**
 * Catch the emitted Error and transform it to some other value, then emit
 * that value.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {((error: Error) => T | R)} transform Transform function.
 * @returns {(OperatorFunction<T, T | R>)} An OperatorFunction instance.
 */
export function catchJustReturn<T, R>(transform: (error: Error) => T | R): OperatorFunction<T, T | R> {
  return catchError((err: Error) => of(transform(err)));
}

/**
 * Catch the emitted Error and simply emit some other value.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {(T | R)} value The fallback value.
 * @returns {(OperatorFunction<T, T | R>)} An OperatorFunction instance.
 */
export function catchJustReturnValue<T, R>(value: T | R): OperatorFunction<T, T | R> {
  return catchJustReturn<T, R>((_err: Error): T | R => value);
}