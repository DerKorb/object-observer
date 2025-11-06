import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - moving sub-graph', () => {
	const oo = Observable.from({
		a: { id: 'a' },
		b: { id: 'b' }
	});
	let validationCount = 0;
	const validator = () => {
		validationCount++;
		return true;
	};
	Observable.validate(oo, validator);

	const sub = oo.a;
	oo.b = sub;

	assert.equal(validationCount, 1, 'validator should be called once for the subgraph move');
});

test('validator - moving sub-graph - reject', () => {
	const oo = Observable.from({
		a: { id: 'a' },
		b: { id: 'b' }
	});

	const validator = () => false;
	Observable.validate(oo, validator);

	const sub = oo.a;
	assert.throws(() => oo.b = sub, TypeError, 'subgraph move should be rejected');
	assert.notEqual(oo.b, sub);
});

test('validator - Object.assign on observable with subgraph - reject', () => {
	const observable = Observable.from({ b: { b1: 'x', b2: 'y' } });
	const newData = { b: { b1: 'z' } };
	const validator = changes => {
		if (changes[0].path[0] === 'b') {
			return false;
		}
	};
	Observable.validate(observable, validator);

	assert.throws(() => Object.assign(observable, newData), TypeError);
	assert.equal(observable.b.b1, 'x');
});
