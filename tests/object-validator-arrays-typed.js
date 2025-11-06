import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - typed array set - reject', () => {
	const ta = new Int8Array([1, 2, 3, 4]);
	const observable = Observable.from(ta);

	const validator = changes => {
		for (const change of changes) {
			if (change.value === 99) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	observable.set([99, 100]);
	assert.deepEqual(observable, new Int8Array([1, 2, 3, 4]));

	// This should be allowed
	observable.set([5, 6]);
	assert.deepEqual(observable, new Int8Array([5, 6, 3, 4]));
});

test('validator - typed array reverse', () => {
	const ta = new Int8Array([1, 2, 3]);
	const observable = Observable.from(ta);

	const validator = () => false;

	Observable.validate(observable, validator);

	// This should be rejected
	observable.reverse();
	assert.deepEqual(observable, new Int8Array([1, 2, 3]));
});

test('validator - typed array sort', () => {
	const ta = new Int8Array([3, 1, 2]);
	const observable = Observable.from(ta);

	const validator = () => false;

	Observable.validate(observable, validator);

	// This should be rejected
	observable.sort();
	assert.deepEqual(observable, new Int8Array([3, 1, 2]));
});

test('validator - typed array fill', () => {
	const ta = new Int8Array([1, 2, 3]);
	const observable = Observable.from(ta);

	const validator = changes => {
		for (const change of changes) {
			if (change.value === 0) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	observable.fill(0);
	assert.deepEqual(observable, new Int8Array([1, 2, 3]));
});

test('validator - typed array copyWithin', () => {
	const ta = new Int8Array([1, 2, 3, 4, 5]);
	const observable = Observable.from(ta);

	const validator = changes => {
		for (const change of changes) {
			if (change.value === 4) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	observable.copyWithin(0, 3, 4);
	assert.deepEqual(observable, new Int8Array([1, 2, 3, 4, 5]));
});

test('validator - typed array direct property set - reject', () => {
	const ta = new Uint8Array([1, 2, 3]);
	const observable = Observable.from(ta);
	const validator = () => false;
	Observable.validate(observable, validator);

	assert.throws(() => observable[1] = 7, TypeError);
	assert.equal(observable[1], 2);
});
