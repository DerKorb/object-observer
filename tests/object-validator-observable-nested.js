import { test } from '@gullerya/just-test';
import { assert } from '@gullerya/just-test/assert';
import { Observable } from '../src/object-observer.js';

test('validator - nested observable propagation', () => {
	const obj = { nested: { value: 10 } };
	const observable = Observable.from(obj);

	const validatorChanges = [];
	const validator = changes => {
		for (const change of changes) {
			validatorChanges.push({ path: change.path.join('.'), value: change.value });
		}
		return true;
	};

	Observable.validate(observable, validator);

	// Change nested property
	observable.nested.value = 20;

	// Validator should see the change with the full path
	assert.equal(validatorChanges.length, 1);
	assert.equal(validatorChanges[0].path, 'nested.value');
	assert.equal(validatorChanges[0].value, 20);
});

test('validator - deep nested objects', () => {
	const oo = Observable.from({
		nest: {
			level: 0,
			nest: {
				level: 1,
				nest: {
					level: 2
				}
			}
		}
	});

	Observable.validate(oo, () => false);

	assert.throws(() => oo.nest.nest.nest.level = 'something else', TypeError, 'deep nested change should be rejected');
});

test('validator - detached sub-graph is not validated by parent', () => {
	const oo = Observable.from({ inner: { prop: 'A' } });
	const inner = oo.inner;

	Observable.validate(oo, changes => {
		if (changes[0].path.join('.') === 'inner.prop') {
			return false;
		}
		return true;
	});

	// this change should be blocked
	assert.throws(() => oo.inner.prop = 'B', TypeError);
	assert.equal(oo.inner.prop, 'A');

	// detach
	oo.inner = {};

	// this change should now be allowed, as `inner` is no longer validated by `oo`
	inner.prop = 'C';
	assert.equal(inner.prop, 'C');
});
