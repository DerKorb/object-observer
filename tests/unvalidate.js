import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

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

test('validator - unvalidate one of two', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);
	const validator1 = () => false;
	const validator2 = change => change.value < 100;
	Observable.validate(observable, validator1);
	Observable.validate(observable, validator2);

	// should be rejected by validator1
	assert.throws(() => observable.value = 20, TypeError);
	assert.equal(observable.value, 10);

	Observable.unvalidate(observable, validator1);

	// should be allowed by validator2
	observable.value = 50;
	assert.equal(observable.value, 50);

	// should be rejected by validator2
	assert.throws(() => observable.value = 150, TypeError);
	assert.equal(observable.value, 50);
});

test('validator - unvalidate multiple', () => {
	const obj = { value: 10 };
	const observable = Observable.from(obj);
	const validator1 = () => false;
	const validator2 = () => false;
	Observable.validate(observable, validator1);
	Observable.validate(observable, validator2);

	// should be rejected
	assert.throws(() => observable.value = 20, TypeError);

	Observable.unvalidate(observable, validator1, validator2);

	// should be allowed
	observable.value = 30;
	assert.equal(observable.value, 30);
});

test('validator - unvalidate non existing validator', () => {
	const obj = Observable.from({});
	const validator = () => false;

	assert.doesNotThrow(() => {
		Observable.unvalidate(obj, validator);
	});
});
