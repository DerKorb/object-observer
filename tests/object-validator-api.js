import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('ensure Observable has validate/unvalidate APIs', () => {
	assert.equal(typeof Observable.validate, 'function');
	assert.equal(typeof Observable.unvalidate, 'function');
});

test('validator - invalid parameters', () => {
	const observable = Observable.from({});

	assert.throws(() => Observable.validate({}, () => { }), 'invalid observable parameter');
	assert.throws(() => Observable.validate(observable, 'not a function'), 'validator MUST be a function');
	assert.throws(() => Observable.unvalidate({}, () => { }), 'invalid observable parameter');
});
