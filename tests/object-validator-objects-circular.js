import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - circular object, modification on a path that is not circular', () => {
	const a = { b: { c: 2 } };
	a.a = a;
	const pa = Observable.from(a);

	Observable.validate(pa, () => false);

	assert.throws(() => pa.b.c = 4, TypeError, 'modification on a non-circular path should be rejected');
});

test('validator - circular object, modification on a path that is circular', () => {
	const a = { b: { c: 2 } };
	a.a = a;
	const pa = Observable.from(a);

	Observable.validate(pa, () => false);

	assert.throws(() => pa.a.a.a.b.c = 4, TypeError, 'modification on a circular path should be rejected');
});

test('validator - subgraph object pointing to the top parent - reject', () => {
	const o = { prop: 'text' };
	o.child = o;
	const oo = Observable.from(o);
	Observable.validate(oo, () => false);

	assert.throws(() => oo.prop = 'else', TypeError);
});

test('validator - subgraph object pointing to parent in the graph - reject', () => {
	const o = { gen1: { gen2: { prop: 'text' } } };
	o.gen1.gen2.child = o.gen1;
	const oo = Observable.from(o);
	Observable.validate(oo, () => false);

	assert.throws(() => oo.gen1.gen2.prop = 'else', TypeError);
});

test('validator - circular object assigned to an existing observable graph - reject', () => {
	const o = { gen1: { gen2: { prop: 'text' } } };
	o.gen1.gen2.child = o.gen1;

	const oo = Observable.from({});
	oo.newbie = o;

	Observable.validate(oo, () => false);

	assert.throws(() => oo.newbie.gen1.gen2.prop = 'else', TypeError);
});
