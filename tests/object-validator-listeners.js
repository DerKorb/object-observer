import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

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
