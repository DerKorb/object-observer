import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - two pointers to the same object', () => {
	const c = { p: 'p' };
	const b = { c: c };
	const a = { b: b, c: c };
	const pa = Observable.from(a);

	Observable.validate(pa, () => false);

	assert.throws(() => pa.b.c.p = 'something else', TypeError, 'changes on any path should be rejected');
	assert.throws(() => pa.c.p = 'something new', TypeError, 'changes on any path should be rejected');
});
