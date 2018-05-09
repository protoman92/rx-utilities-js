import { MonoTypeOperatorFunction } from 'rxjs';
import { doOnNext, doOnError } from './Observable+Do';

/**
 * Log the next emission.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {(value: T) => R} transform Optional transform function to convert
 * the emission to another type. If this is omitted, simply log the
 * emission.
 * @returns {MonoTypeOperatorFunction<T>} An MonoTypeOperatorFunction instance.
 */
export function logNext<T, R>(transform: (value: T) => R): MonoTypeOperatorFunction<T> {
  return doOnNext((value) => {
    if (transform !== undefined && transform !== null) {
      console.log(transform(value));
    } else {
      console.log(value);
    }
  });
}

/**
 * Log the next emission with a specified prefix.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {string} prefix A string value.
 * @param {(value: T) => R} transform Optional transform function to convert
 * the emission to another type. If this is omitted, simply log the
 * emission.
 * @returns {MonoTypeOperatorFunction<T>} An MonoTypeOperatorFunction instance.
 */
export function logNextPrefix<T, R>(prefix: string, transform: (v: T) => R): MonoTypeOperatorFunction<T> {
  return doOnNext(v => {
    if (transform !== undefined && transform !== null) {
      console.log(`${prefix}${transform(v)}`);
    } else {
      console.log(`${prefix}${v}`);
    }
  });
}

/**
 * Log the emitted Error.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {(error: Error) => R} transform Optional transform function to convert
 * the error to another type. If this is omitted, simply log the error.
 * @returns {MonoTypeOperatorFunction<T>} An MonoTypeOperatorFunction instance.
 */
export function logError<T, R>(transform: (error: Error) => R): MonoTypeOperatorFunction<T> {
  return doOnError((error) => {
    if (transform !== undefined && transform !== null) {
      console.log(transform(error));
    } else {
      console.log(error);
    }
  });
}

/**
 * Log the emitted Error with a specified prefix.
 * @template T Generics parameter.
 * @template R Generics parameter.
 * @param {string} prefix A string value.
 * @param {(error: Error) => R} transform Optional transform function to convert
 * the error to another type. If this is omitted, simply log the error.
 * @returns {MonoTypeOperatorFunction<T>} An MonoTypeOperatorFunction instance.
 */
export function logErrorPrefix<T, R>(prefix: string, transform: (error: Error) => R): MonoTypeOperatorFunction<T> {
  return doOnError(e => {
    if (transform !== undefined && transform !== null) {
      console.log(`${prefix}${transform(e)}`);
    } else {
      console.log(`${prefix}${e}`);
    }
  });
}