import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - array push - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		if (changes[0].value === 99) {
			return false;
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	const result = observable.push(99);
	assert.equal(observable.length, 3);
	assert.equal(result, 3); // Returns original length when rejected

	// This should be allowed
	observable.push(4);
	assert.equal(observable.length, 4);
	assert.equal(observable[3], 4);
});

test('validator - array pop - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		if (changes[0].type === 'delete' && changes[0].path[0] === 2) {
			return false;
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	const result = observable.pop();
	assert.equal(observable.length, 3);
	assert.equal(result, undefined);
});

test('validator - array shift - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'delete' && change.path[0] === 0) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	const result = observable.shift();
	assert.equal(observable.length, 3);
	assert.equal(result, undefined);
});

test('validator - array unshift - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.value === 0) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	const result = observable.unshift(0);
	assert.equal(observable.length, 3);
	assert.equal(result, 3); // Returns original length when rejected
});

test('validator - array reverse', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'reverse') {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	observable.reverse();
	assert.equal(observable[0], 1);
	assert.equal(observable[1], 2);
	assert.equal(observable[2], 3);
});

test('validator - array sort', () => {
	const arr = [3, 1, 2];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'shuffle') {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	observable.sort();
	assert.equal(observable[0], 3);
	assert.equal(observable[1], 1);
	assert.equal(observable[2], 2);
});

test('validator - array fill', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

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
	assert.equal(observable[0], 1);
	assert.equal(observable[1], 2);
	assert.equal(observable[2], 3);

	// This should be allowed
	observable.fill(5);
	assert.equal(observable[0], 5);
	assert.equal(observable[1], 5);
	assert.equal(observable[2], 5);
});

test('validator - array splice - reject', () => {
	const arr = [1, 2, 3, 4];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'delete') {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected (trying to delete)
	const result = observable.splice(1, 2, 10, 11);
	assert.equal(observable.length, 4);
	assert.deepEqual(result, []);
});

test('validator - array copyWithin - reject', () => {
	const arr = [1, 2, 3, 4, 5];
	const observable = Observable.from(arr);

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
	assert.deepEqual(Array.from(observable), [1, 2, 3, 4, 5]);

	// This should be allowed
	observable.copyWithin(0, 1, 2);
	assert.deepEqual(Array.from(observable), [2, 2, 3, 4, 5]);
});

test('validator - array splice insert - reject', () => {
	const arr = [1, 2, 3, 4];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'insert' && change.value === 99) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected (trying to insert 99)
	const result = observable.splice(1, 0, 99, 100);
	assert.equal(observable.length, 4);
	assert.deepEqual(result, []);
	assert.deepEqual(Array.from(observable), [1, 2, 3, 4]);
});

test('validator - array splice update - reject', () => {
	const arr = [1, 2, 3, 4];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'update' && change.value === 99) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected (trying to update to 99)
	const result = observable.splice(1, 2, 99, 100);
	assert.equal(observable.length, 4);
	assert.deepEqual(result, []);
	assert.deepEqual(Array.from(observable), [1, 2, 3, 4]);
});

test('validator - array push multiple values - reject one', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = changes => {
		for (const change of changes) {
			if (change.value === 99) {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	const result = observable.push(4, 99, 5);
	assert.equal(observable.length, 3, 'array length should not change if one of the pushes is rejected');
	assert.equal(result, 3, 'push should return original length when rejected');
	assert.deepEqual(Array.from(observable), [1, 2, 3]);
});

test('validator - array fill on sparse array - reject', () => {
	const arr = new Array(3);
	arr[0] = 'a';
	const observable = Observable.from(arr);
	const validator = changes => {
		for (const change of changes) {
			if (change.type === 'insert' || change.type === 'update') {
				return false;
			}
		}
	};
	Observable.validate(observable, validator);

	observable.fill('b', 1, 3);

	assert.equal(observable.length, 3);
	assert.equal(observable[0], 'a');
	assert.equal(observable[1], undefined);
	assert.equal(observable[2], undefined);
});
