import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('ensure Observable has validate/unvalidate APIs', () => {
	assert.equal(typeof Observable.validate, 'function');
	assert.equal(typeof Observable.unvalidate, 'function');
});

test('validator - basic object property set - reject', () => {
	const obj = { name: 'initial' };
	const observable = Observable.from(obj);

	const validator = change => {
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

	const validator = change => {
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

	const changes = [];
	const validator = change => {
		changes.push(change);
		if (change.type === 'insert' && change.path[0] === 'forbidden') {
			return false;
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
	assert.equal(changes.length, 2);
	assert.equal(changes[0].type, 'insert');
	assert.equal(changes[1].type, 'insert');
});

test('validator - property delete', () => {
	const obj = { protected: 'value', deletable: 'value' };
	const observable = Observable.from(obj);

	const validator = change => {
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

test('validator - array push - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = change => {
		if (change.value === 99) {
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

	const validator = change => {
		if (change.type === 'delete' && change.path[0] === 2) {
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

	const validator = () => false;

	Observable.validate(observable, validator);

	// This should be rejected
	const result = observable.shift();
	assert.equal(observable.length, 3);
	assert.equal(result, undefined);
});

test('validator - array unshift - reject', () => {
	const arr = [1, 2, 3];
	const observable = Observable.from(arr);

	const validator = change => {
		if (change.value === 0) {
			return false;
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

	const validator = () => false;

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

	const validator = () => false;

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

	const validator = change => {
		if (change.value === 0) {
			return false;
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

	const validator = change => {
		if (change.type === 'delete') {
			return false;
		}
	};

	Observable.validate(observable, validator);

	// This should be rejected (trying to delete)
	const result = observable.splice(1, 2, 10, 11);
	assert.equal(observable.length, 4);
	assert.deepEqual(result, []);
});

test('validator - multiple validators', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);

	const validator1 = change => {
		if (change.value < 0) {
			return false;
		}
	};

	const validator2 = change => {
		if (change.value > 100) {
			return false;
		}
	};

	Observable.validate(observable, validator1);
	Observable.validate(observable, validator2);

	// Too small - rejected by validator1
	assert.throws(() => {
		observable.value = -5;
	}, TypeError);
	assert.equal(observable.value, 10);

	// Too large - rejected by validator2
	assert.throws(() => {
		observable.value = 150;
	}, TypeError);
	assert.equal(observable.value, 10);

	// Just right - allowed by both
	observable.value = 50;
	assert.equal(observable.value, 50);
});

test('validator - unvalidate single', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);

	const validator = () => false;

	Observable.validate(observable, validator);

	// Should be rejected
	assert.throws(() => {
		observable.value = 20;
	}, TypeError);
	assert.equal(observable.value, 10);

	// Remove validator
	Observable.unvalidate(observable, validator);

	// Should be allowed now
	observable.value = 30;
	assert.equal(observable.value, 30);
});

test('validator - unvalidate all', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);

	const validator1 = () => false;
	const validator2 = () => false;

	Observable.validate(observable, validator1);
	Observable.validate(observable, validator2);

	// Should be rejected
	assert.throws(() => {
		observable.value = 20;
	}, TypeError);
	assert.equal(observable.value, 10);

	// Remove all validators
	Observable.unvalidate(observable);

	// Should be allowed now
	observable.value = 30;
	assert.equal(observable.value, 30);
});

test('validator - with path option', () => {
	const obj = { user: { name: 'John', age: 30 } };
	const observable = Observable.from(obj);

	const validator = () => false;

	Observable.validate(observable, validator, { path: 'user.name' });

	// This should be rejected (matches path)
	assert.throws(() => {
		observable.user.name = 'Jane';
	}, TypeError);
	assert.equal(observable.user.name, 'John');

	// This should be allowed (different path)
	observable.user.age = 31;
	assert.equal(observable.user.age, 31);
});

test('validator - with pathsOf option', () => {
	const obj = { user: { name: 'John', address: { city: 'NYC' } } };
	const observable = Observable.from(obj);

	const validator = () => false;

	Observable.validate(observable, validator, { pathsOf: 'user' });

	// This should be rejected (direct property of user)
	assert.throws(() => {
		observable.user.name = 'Jane';
	}, TypeError);
	assert.equal(observable.user.name, 'John');

	// This should be allowed (nested deeper)
	observable.user.address.city = 'LA';
	assert.equal(observable.user.address.city, 'LA');
});

test('validator - with pathsFrom option', () => {
	const obj = { user: { name: 'John', address: { city: 'NYC' } } };
	const observable = Observable.from(obj);

	const validator = () => false;

	Observable.validate(observable, validator, { pathsFrom: 'user' });

	// This should be rejected (under user path)
	assert.throws(() => {
		observable.user.name = 'Jane';
	}, TypeError);
	assert.equal(observable.user.name, 'John');

	// This should also be rejected (nested under user)
	assert.throws(() => {
		observable.user.address.city = 'LA';
	}, TypeError);
	assert.equal(observable.user.address.city, 'NYC');
});

test('validator - nested observable propagation', () => {
	const obj = { nested: { value: 10 } };
	const observable = Observable.from(obj);

	const changes = [];
	const validator = change => {
		changes.push({ path: change.path.join('.'), value: change.value });
		return true;
	};

	Observable.validate(observable, validator);

	// Change nested property
	observable.nested.value = 20;

	// Validator should see the change with the full path
	assert.equal(changes.length, 1);
	assert.equal(changes[0].path, 'nested.value');
	assert.equal(changes[0].value, 20);
});

test('validator - observers still fire after validation passes', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);

	const observedChanges = [];
	const validator = change => {
		if (change.value < 0) {
			return false;
		}
		return true;
	};

	Observable.validate(observable, validator);
	Observable.observe(observable, changes => {
		observedChanges.push(...changes);
	});

	// This should be rejected - no observer notification
	assert.throws(() => {
		observable.value = -5;
	}, TypeError);
	assert.equal(observable.value, 10);
	assert.equal(observedChanges.length, 0);

	// This should be allowed - observer should be notified
	observable.value = 20;
	assert.equal(observable.value, 20);
	assert.equal(observedChanges.length, 1);
	assert.equal(observedChanges[0].value, 20);
});

test('validator - invalid parameters', () => {
	const observable = Observable.from({});

	assert.throws(() => Observable.validate({}, () => { }), 'invalid observable parameter');
	assert.throws(() => Observable.validate(observable, 'not a function'), 'validator MUST be a function');
	assert.throws(() => Observable.unvalidate({}, () => { }), 'invalid observable parameter');
});

test('validator - duplicate registration', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);

	const validator = () => false;

	Observable.validate(observable, validator);

	// Try to register again - should warn but not duplicate
	Observable.validate(observable, validator);

	// Should only be one validator (if there were two, the second check would also fail)
	assert.throws(() => {
		observable.value = 20;
	}, TypeError);
	assert.equal(observable.value, 10);

	// Remove validator once
	Observable.unvalidate(observable, validator);

	// Should work now (proves there was only one validator)
	observable.value = 30;
	assert.equal(observable.value, 30);
});
