import { Observer } from 'rxjs';

/**
 * Provides mapping functionalities for a base observer.
 * @extends {Observer<T>} Observer extension.
 * @template T Generic parameter.
 */
export interface Type<T> extends Observer<T> {
  /**
   * Map further to get a R observer.
   * @template R Generic parameter.
   * @param {(v: R) => T} selector Selector function.
   * @returns {Type<R>} A Type instance.
   */
  mapObserver<R>(selector: (v: R) => T): Type<R>;
}

/**
 * Use this class to provide mapping functionalities for a base observer.
 * @implements {Type<T, R>} Type implementation.
 * @template T Generic parameter.
 * @template R Generic parameter.
 */
export class Self<T, R> implements Type<T> {
  /**
   * Convenience method to create a MappableObserver.
   * @template T Generics parameter.
   * @param {Observer<T>} observer An Observer instance.
   * @returns {Self<T, T>} A Self instance.
   */
  public static of<T>(observer: Observer<T>): Self<T, T> {
    return new Self(observer, (v: T) => v);
  }

  private readonly observer: Observer<R>;
  private readonly mapper: (v: T) => R;

  public constructor(observer: Observer<R>, mapper: (v: T) => R) {
    this.observer = observer;
    this.mapper = mapper;
  }

  public next(v: T): void {
    try {
      let v1 = this.mapper(v);
      this.observer.next(v1);
    } catch (e) {
      this.error(e);
    }
  }

  public error(e: Error): void {
    this.observer.error(e);
  }

  public complete(): void {
    this.observer.complete();
  }

  public mapObserver<R1>(selector: (v: R1) => T): Type<R1> {
    return new Self<R1, T>(this, selector);
  }
}