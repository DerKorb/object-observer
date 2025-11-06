import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('reassignment of equals should not trigger validation', () => {
	const oo = Observable.from({ a: 'a' });
	let validationCalled = false;
	const validator = () => {
		validationCalled = true;
		return true;
	};
	Observable.validate(oo, validator);

	oo.a = 'a';
	assert.isFalse(validationCalled, 'validator should not be called on reassignment of equal value');
});
