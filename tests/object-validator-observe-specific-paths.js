import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

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
