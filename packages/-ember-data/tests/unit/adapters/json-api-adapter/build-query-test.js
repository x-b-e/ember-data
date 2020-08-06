import { module, test } from 'qunit';

import JSONAPIAdapter from '@ember-data/adapter/json-api';

module('unit/adapters/json-api-adapter/build-query - building queries', function() {
  test('buildQuery() returns query with `fields` from snapshot', function(assert) {
    const adapter = JSONAPIAdapter.create();
    adapter.supportsJSONAPIFields = true;
    const snapshotStub = { adapterOptions: { fields: { post: 'name' } } };

    const query = adapter.buildQuery(snapshotStub);

    assert.deepEqual(query, { fields: { post: 'name' } }, 'query includes `fields`');
  });

  test('buildQuery() returns query with `fields` and `include` from snapshot', function(assert) {
    const adapter = JSONAPIAdapter.create();
    adapter.supportsJSONAPIFields = true;
    const snapshotStub = { adapterOptions: { fields: { post: 'name', comments: 'title' } }, include: 'comments' };

    const query = adapter.buildQuery(snapshotStub);

    assert.deepEqual(
      query,
      { fields: { post: 'name', comments: 'title' }, include: 'comments' },
      'query includes `fields` and `include`'
    );
  });

  test('buildQuery() returns query without `fields` from snapshot', function(assert) {
    const adapter = JSONAPIAdapter.create();
    const snapshotStub = { adapterOptions: { fields: { post: 'name', comments: 'title' } }, include: 'comments' };

    const query = adapter.buildQuery(snapshotStub);

    assert.deepEqual(query, { include: 'comments' }, 'query includes `fields` and `include`');
  });
});
