import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  Subscription,
  merge,
  of,
  range,
  throwError,
} from 'rxjs';

import { flatMap, isEmpty, map, } from 'rxjs/operators';
import * as utils from './../src';
import { IncompletableSubject } from './../src';
import { Collections, Nullable, Numbers } from 'javascriptutilities';

const timeout = 10000;

describe('Do should be implemented correctly', () => {
  it('doOnNext and doOnCompleted should work correctly', done => {
    /// Setup
    let nextCount = 0;
    let completedCount = 0;
    let times = 1000;

    /// When
    range(0, times)
      .pipe(
        utils.doOnNext(() => nextCount += 1),
        utils.logNext(),
        utils.logNext(v => v),
        utils.logNextPrefix('Current value:'),
        utils.logNextPrefix('Current value:', v => v),
        utils.doOnCompleted(() => {
          completedCount += 1;

          /// Then
          expect(nextCount).toBe(times);
          expect(completedCount).toBe(1);
          done();
        }))
      .subscribe();
  }, timeout);

  it('doOnError and catchJustReturn should work correctly', (done) => {
    /// Setup
    let nextCount = 0;
    let errorCount = 0;
    let message = 'Error!';

    /// When
    try {
      throwError(new Error(message))
        .pipe(
          utils.doOnNext(() => nextCount += 1),
          utils.logError(e => e),
          utils.logError(),
          utils.logErrorPrefix('Current error:'),
          utils.logErrorPrefix('Current error:', e => e),
          utils.doOnError((error: Error) => {
            errorCount += 1;

            /// Then
            expect(nextCount).toBe(0);
            expect(errorCount).toBe(1);
            expect(error.message).toBe(message);
            done();
          }))
        .subscribe();
    } catch (e) {
      expect(e.message).toBe(message);
    }
  }, timeout);
});

describe('Catch should be implemented correctly', () => {
  it('Catch just return some value should work correctly', (done) => {
    /// Setup
    let message = 'Error!';
    let fallback = 1;
    let nextCount = 0;

    /// When
    try {
      throwError(new Error(message))
        .pipe(
          map(() => 0),
          utils.catchJustReturnValue(fallback),
          utils.doOnNext((value) => {
            nextCount += 1;

            /// Then
            expect(value).toBe(fallback);
          }),
          utils.doOnCompleted(() => {
            /// Then
            expect(nextCount).toBe(1);
            done();
          }))
        .subscribe();
    } catch (e) {
      fail(e);
    }
  }, timeout);
});

describe('Iterables should be implemented correctly', () => {
  it('flatMapIterable should work correctly', (done) => {
    /// Setup
    let array = [1, 2, 3, 4];
    let nextCount = 0;

    /// When
    of(array)
      .pipe(
        utils.flatMapIterable(value => value),
        utils.doOnNext(value => {
          nextCount += 1;

          /// Then
          expect(array).toContain(value);
        }),
        utils.doOnCompleted(() => {
          /// Then
          expect(nextCount).toBe(array.length);
          done();
        }))
      .subscribe();
  }, timeout);
});

describe('flatMap and map non nil should be implemented correctly', () => {
  it('Map non nil or empty should be implemented correctly', done => {
    /// Setup & When & Then
    of<any>(1)
      .pipe(
        flatMap(v => merge(
          of(v).pipe(utils.mapNonNilOrEmpty(v1 => (<string>v1).length)),
          of(v).pipe(utils.mapNonNilOrEmpty(() => { throw Error('Failed!'); })),
        )),
        isEmpty(),
        utils.doOnNext(v => expect(v).toBeTruthy()),
        utils.doOnCompleted(() => done()))
      .subscribe();
  }, timeout);

  it('Map non nil or else should be implemented correctly', done => {
    /// Setup & When & Then
    of<any>(1)
      .pipe(
        flatMap(v => merge(
          of(v).pipe(utils.mapNonNilOrElse(v1 => (<string>v1).length, () => 2)),
          of(v).pipe(utils.mapNonNilOrElse(() => { throw Error('Failed!'); }, 2)),
        )),
        utils.doOnNext(v => expect(v).toBe(2)),
        isEmpty(),
        utils.doOnNext(v => expect(v).toBeFalsy()),
        utils.doOnCompleted(() => done()))
      .subscribe();
  });
});

describe('IncompletableSubject should be implemented correctly', () => {
  /// Setup
  let subject = new Subject<number>();
  let wrapper = new IncompletableSubject(subject);
  let mappableWrapper = wrapper.mapObserver<number>(v => v * 2);
  let events: number[] = [];
  wrapper.asObservable().pipe(utils.doOnNext(v => events.push(v))).subscribe();

  /// When
  mappableWrapper.next(1);
  mappableWrapper.next(2);
  mappableWrapper.error(new Error(''));
  mappableWrapper.complete();
  mappableWrapper.next(3);

  /// Then
  expect(events).toEqual([2, 4, 6]);
});

describe('MappableObserver should be implemented correctly', () => {
  let testObserver = (subject: Subject<Nullable<number>>): void => {
    /// Setup
    let times = 10;
    let numberRange = Numbers.range(0, times);
    let elements: Nullable<number>[] = [];
    let errors: Error[] = [];

    let observer = utils.MappableObserver.Self.of(subject)
      .mapObserver<string>(v => Number.parseInt(v))
      .mapObserver<number>(v => '' + v)
      .mapObserver<number>(v => v * 2);

    subject.asObservable()
      .pipe(
        utils.mapNonNilOrEmpty(v => v),
        utils.emptyIfNil(),
        utils.doOnNext(v => elements.push(v)),
        utils.doOnError(e => errors.push(e)))
      .subscribe();

    /// When && Then
    for (let i of numberRange) {
      observer.next(i);
    }

    expect(elements).toEqual(numberRange.map(v => v * 2));

    for (let _ of numberRange) {
      observer.error(new Error('Error!'));
    }

    expect(errors).toHaveLength(1);
  };

  it('Mappable observer wrapper - should work correctly', () => {
    testObserver(new BehaviorSubject<Nullable<number>>(undefined));
    testObserver(new ReplaySubject<Nullable<number>>());
    testObserver(new Subject<Nullable<number>>());
  });

  it('Mappable observer with error mapper - should work', () => {
    /// Setup
    let errors: Error[] = [];
    let subject = new Subject();

    let mappableObserver = utils.MappableObserver.Self.of(subject)
      .mapObserver(() => { throw Error('error'); });

    subject.pipe(utils.doOnError(e => errors.push(e))).subscribe();

    /// When
    mappableObserver.next(1);
    mappableObserver.next(2);
    mappableObserver.next(3);

    /// Then
    expect(errors).toHaveLength(1);
  });
});

describe('ensureOrder should be implemented correctly', () => {
  it('ensureOrder should be implemented correctly', done => {
    /// Setup
    let times = 10;
    let valueTrigger = new Subject<number>();
    let subscription = new Subscription();
    let values: number[] = [];
    let sortFn: (a: number, b: number) => boolean = (a, b) => (a - b) > 0;

    let disposable1 = valueTrigger.asObservable()
      .pipe(
        utils.ensureOrder(sortFn),
        utils.doOnNext(v => values.push(v)))
      .subscribe();

    subscription.add(disposable1);

    /// When
    Numbers.range(0, times).forEach(() => {
      let randomValue = Numbers.randomBetween(0, 100000);
      valueTrigger.next(randomValue);
    });

    /// Then
    let sortedValues = values.sort((a, b) => sortFn(a, b) ? 1 : -1);
    let equals = Collections.zip(values, sortedValues, (a, b) => a === b);
    expect(values.length).toBeGreaterThan(0);
    expect(values).toEqual(sortedValues);
    expect(equals.getOrThrow().every(v => v)).toBeTruthy();
    done();
  }, timeout);
});
