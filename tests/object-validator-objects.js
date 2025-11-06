import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - basic object property set - reject', () => {
	const obj = { name: 'initial' };
	const observable = Observable.from(obj);

	const validator = changes => {
		const change = changes[0];
		if (change.value === 'rejected') {
			return false;
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	assert.throws(() => {
		observable.name = 'rejected';
	}, TypeError);
	assert.equal(observable.name, 'initial');

	// This should be allowed
	observable.name = 'allowed';
	assert.equal(observable.name, 'allowed');
});

test('validator - basic object property set - throw (brute force)', () => {
	const obj = { name: 'initial' };
	const observable = Observable.from(obj);

	const validator = changes => {
		const change = changes[0];
		if (change.value === 'bad') {
			throw new Error('Invalid value');
		}
	};

	Observable.validate(observable, validator);

	// This should throw (brute force rejection - more expensive than returning false)
	assert.throws(() => {
		observable.name = 'bad';
	}, 'Invalid value');
	assert.equal(observable.name, 'initial');

	// This should be allowed
	observable.name = 'good';
	assert.equal(observable.name, 'good');
});

test('validator - property insert', () => {
	const obj = {};
	const observable = Observable.from(obj);

	const validatorChanges = [];
	const validator = changes => {
		validatorChanges.push(...changes);
		for (const change of changes) {
			if (change.type === 'insert' && change.path[0] === 'forbidden') {
				return false;
			}
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	assert.throws(() => {
		observable.forbidden = 'value';
	}, TypeError);
	assert.isFalse('forbidden' in observable);

	// This should be allowed
	observable.allowed = 'value';
	assert.equal(observable.allowed, 'value');
	assert.equal(validatorChanges.length, 2);
	assert.equal(validatorChanges[0].type, 'insert');
	assert.equal(validatorChanges[1].type, 'insert');
});

test('validator - property delete', () => {
	const obj = { protected: 'value', deletable: 'value' };
	const observable = Observable.from(obj);

	const validator = changes => {
		const change = changes[0];
		if (change.type === 'delete' && change.path[0] === 'protected') {
			return false;
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected
	assert.throws(() => {
		delete observable.protected;
	}, TypeError);
	assert.equal(observable.protected, 'value');

	// This should be allowed
	delete observable.deletable;
	assert.isFalse('deletable' in observable);
});

test('validator - Object.assign with multiple properties - reject', () => {
	const observable = Observable.from({ a: 1 });
	const validator = changes => {
		const change = changes[0];
		if (change.path[0] === 'b') {
			return false;
		}
	};
	Observable.validate(observable, validator);

	const newData = { a: 2, b: 3, c: 4 };

	assert.throws(() => Object.assign(observable, newData), TypeError);

	// change on 'a' successful, then throw on 'b'
	assert.deepEqual(observable, { a: 2 });
	assert.isFalse('b' in observable);
	assert.isFalse('c' in observable);
});

test('validator - property delete - return value', () => {
	const
		data = { a: 1 },
		observable = Observable.from(data);

	Observable.validate(observable, changes => {
		const change = changes[0];
		if (change.type === 'delete' && change.path[0] === 'a') {
			return false;
		}
		return true;
	});

	const deleteResult = Reflect.deleteProperty(observable, 'a');
	assert.isFalse(deleteResult);
	assert.deepEqual(data, { a: 1 });
});

test('validator - property delete - throws', () => {
	const
		data = { a: 1 },
		observable = Observable.from(data);

	Observable.validate(observable, changes => {
		const change = changes[0];
		if (change.type === 'delete' && change.path[0] === 'a') {
			return false;
		}
	});

	assert.throws(() => {
		delete observable.a;
	}, TypeError);
	assert.deepEqual(data, { a: 1 });
});
