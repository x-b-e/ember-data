import { DEBUG } from '@glimmer/env';

import { singularize } from 'ember-inflector';

import { normalizeModelName } from '@ember-data/store/-private';
import type Store from '@ember-data/store/-private/system/store';
import type { RelationshipSchema } from '@ember-data/store/-private/ts-interfaces/record-data-schemas';
import { RecordField, RecordType, RegistryMap, ResolvedRegistry } from '@ember-data/types';

/**
  @module @ember-data/store
*/

function typeForRelationshipMeta(meta) {
  let modelName = normalizeModelName(meta.type || meta.key);

  if (meta.kind === 'hasMany') {
    modelName = singularize(modelName);
  }

  return modelName;
}

function shouldFindInverse(relationshipMeta) {
  let options = relationshipMeta.options;
  return !(options && options.inverse === null);
}

export class RelationshipDefinition<
  R extends ResolvedRegistry<RegistryMap>,
  OT extends RecordType<R>,
  K extends RecordField<R, OT>,
  RT extends RecordType<R> = RecordType<R>
> implements RelationshipSchema<R, OT, K, RT>
{
  declare _type: RT | '';
  declare __inverseKey: string;
  declare __inverseIsAsync: boolean;
  declare __hasCalculatedInverse: boolean;
  declare parentModelName: OT;
  declare inverseIsAsync: string | null;
  declare meta: RelationshipSchema<R, OT, K, RT>;

  constructor(meta: RelationshipSchema<R, OT, K, RT>) {
    this._type = '';
    this.__inverseKey = '';
    this.__inverseIsAsync = true;
    this.__hasCalculatedInverse = false;
    this.parentModelName = meta.parentModelName;
    this.meta = meta;
  }

  /**
   * @internal
   * @deprecated use name
   */
  get key(): K {
    return this.meta.key;
  }
  get kind(): 'belongsTo' | 'hasMany' {
    return this.meta.kind;
  }
  /**
   * The related type
   * @internal
   */
  get type(): RT {
    if (this._type) {
      return this._type;
    }
    this._type = typeForRelationshipMeta(this.meta) as RT;
    return this._type;
  }
  get options(): { [key: string]: any } {
    return this.meta.options;
  }
  get name(): K {
    return this.meta.name;
  }

  _inverseKey(store: Store<R>, modelClass): string {
    if (this.__hasCalculatedInverse === false) {
      this._calculateInverse(store, modelClass);
    }
    return this.__inverseKey;
  }

  _inverseIsAsync(store: Store<R>, modelClass): boolean {
    if (this.__hasCalculatedInverse === false) {
      this._calculateInverse(store, modelClass);
    }
    return this.__inverseIsAsync;
  }

  _calculateInverse(store: Store<R>, modelClass): void {
    this.__hasCalculatedInverse = true;
    let inverseKey, inverseIsAsync;
    let inverse: any = null;

    if (shouldFindInverse(this.meta)) {
      inverse = modelClass.inverseFor(this.key, store);
    } else if (DEBUG) {
      modelClass.typeForRelationship(this.key, store);
    }

    if (inverse) {
      inverseKey = inverse.name;
      inverseIsAsync = isRelationshipAsync(inverse);
    } else {
      inverseKey = null;
      inverseIsAsync = false;
    }
    this.__inverseKey = inverseKey;
    this.__inverseIsAsync = inverseIsAsync;
  }
}

function isRelationshipAsync<
  R extends ResolvedRegistry<RegistryMap>,
  OT extends RecordType<R>,
  K extends RecordField<R, OT>,
  RT extends RecordType<R>
>(meta: RelationshipSchema<R, OT, K, RT>): boolean {
  let inverseAsync = meta.options && meta.options.async;
  return typeof inverseAsync === 'undefined' ? true : inverseAsync;
}

export function relationshipFromMeta<
  R extends ResolvedRegistry<RegistryMap>,
  OT extends RecordType<R>,
  K extends RecordField<R, OT>,
  RT extends RecordType<R> = RecordType<R>
>(meta: RelationshipSchema<R, OT, K, RT>): RelationshipDefinition<R, OT, K, RT> {
  return new RelationshipDefinition(meta);
}
