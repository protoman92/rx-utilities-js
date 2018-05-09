import { Observable, Observer, Subject } from 'rxjs';
import * as MappableObserver from './MappableObserver';

/**
 * Use this subject wrapper to ignore error and completed events.
 * @implements {Observer<T>} Observer implementation.
 * @implements {MappableObserver.Type<T>} Mappable observer implementation.
 * @template T Generic parameter.
 */
export default class IncompletableSubject<T> implements Observer<T>, MappableObserver.Type<T> {
  private readonly subject: Subject<T>;

  public constructor(subject: Subject<T>) {
    this.subject = subject;
  }

  public next(v: T): void {
    this.subject.next(v);
  }

  public error(_e: Error): void { }
  public complete(): void { }

  public asObservable(): Observable<T> {
    return this.subject;
  }

  public mapObserver<R>(selector: (v: R) => T): MappableObserver.Type<R> {
    return new MappableObserver.Self<R, T>(this, selector);
  }
}