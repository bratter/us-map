import {
  mergeFeatureProps,
  mergeTopoProps,
  filterTopoObject,
  GeometryCollectionNonNull,
  fluentAssign,
  conditionalFluentAssign,
} from './util';
import { Topology } from 'topojson-specification';

const geoJSONFeatures: GeoJSON.Feature<GeoJSON.Geometry, { prop1: number }>[] = [
  { type: 'Feature', id: 1, properties: { prop1: 1 }, geometry: { type: 'Point', coordinates: [] } },
  { type: 'Feature', id: 2, properties: { prop1: 2 }, geometry: { type: 'Point', coordinates: [] } },
];

const topology: Topology<{
  nation: GeometryCollectionNonNull<{ prop1: number }>,
  states: GeometryCollectionNonNull<{ prop1: number }>,
  other: any,
}> = {
  type: 'Topology',
  arcs: [],
  objects: {
    nation: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'LineString', id: 1, arcs: [], properties: { prop1: 1 } },
        { type: 'LineString', id: 2, arcs: [], properties: { prop1: 2 } },
      ],
    },
    states: {
      type: 'GeometryCollection',
      geometries: [
        { type: 'LineString', id: 1, arcs: [], properties: { prop1: 1 } },
        { type: 'LineString', id: 2, arcs: [], properties: { prop1: 2 } },
      ],
    },
    other: {
      type: 'Point',
      coordinates:[0, 0],
    }
  },
}

describe('mergeFeatureProps() function', () => {
  it('should return a deep-equal copy of the object if no propsMap is passed, or passed as null', () => {
    expect(mergeFeatureProps(geoJSONFeatures)).toEqual(geoJSONFeatures);
    expect(mergeFeatureProps(geoJSONFeatures)).not.toBe(geoJSONFeatures);
    expect(mergeFeatureProps(geoJSONFeatures, null)).toEqual(geoJSONFeatures);
  });
  
  it('should merge properties passed in on the map where id matches, skipping where it doesn\'t', () => {
    const map = new Map([[2, { prop2: 2 }]]);
    const props = mergeFeatureProps(geoJSONFeatures, map).map(d => d.properties);

    expect(props[0].prop1).toEqual(1);
    expect(props[0].prop2).toBeUndefined();
    expect(props[1].prop1).toEqual(2);
    expect(props[1].prop2).toEqual(2);
  });

  it('should overwrite properties when the passed data has the same key as the existing data', () => {
    const map = new Map([[1, { prop1: 42 }]]);
    const props = mergeFeatureProps(geoJSONFeatures, map).map(d => d.properties);

    expect(props[0].prop1).toEqual(42);
    expect(props[1].prop1).toEqual(2);
  });
});

describe('mergeTopoProps() function', () => {
  it('should return a deep equal copy of the topology if no propsMap passed or passed as null', () => {
    expect(mergeTopoProps(topology, 'nation')).toEqual(topology);
    expect(mergeTopoProps(topology, 'nation')).not.toBe(topology);
    expect(mergeTopoProps(topology, 'nation', null)).toEqual(topology);
  });

  // Note the forced type assertion - its either that or explicitly defining the returned type with merged data
  it('should merge properties paased in on the map where id matches, skipping where it doesn\'t', () => {
    const map = new Map([[2, { prop2: 2 }]]);
    const n = mergeTopoProps(topology, 'nation', map).objects.nation as GeometryCollectionNonNull;
    const props = n.geometries.map(d => d.properties);
    
    expect(n.geometries).toHaveLength(2);
    expect(props[0].prop1).toEqual(1);
    expect(props[0].prop2).toBeUndefined();
    expect(props[1].prop1).toEqual(2);
    expect(props[1].prop2).toEqual(2);
  });

  it('should overwrite properties when the passed data has the same key as the existing data', () => {
    const map = new Map([[1, { prop1: 42 }]]);
    const merged = mergeTopoProps<typeof topology.objects>(topology, 'nation', map);
    const props = merged.objects.nation.geometries.map(d => d.properties);

    expect(props[0].prop1).toEqual(42);
    expect(props[1].prop1).toEqual(2);
  });
});

describe('filterTopoObject() function', () => {
  it('should return a deep equal copy of the topology if an identity filter is passed', () => {
    const filtered = filterTopoObject(topology, 'nation', () => true);
    expect(filtered).toEqual(topology);
  });

  it('should filter the array corresponding to the feature being modified, but leave other features intact', () => {
    const filtered = filterTopoObject(topology, 'nation', d => d.id !== 1);
    expect(filtered.objects.nation.geometries).toHaveLength(1);
    expect(filtered.objects.nation.geometries[0]).toBe(topology.objects.nation.geometries[1]);

    expect(filtered.objects.states.geometries).toHaveLength(2);
    expect(filtered.objects.states).toBe(topology.objects.states);
    expect(filtered.objects.other).toBe(topology.objects.other);
  });

  it('should not modify any ancestor keys, but replace them when filtering a topology, but keeps the same sibling objects', () => {
    const filtered = filterTopoObject(topology, 'nation', d => d.id !== 1);
    
    expect(filtered.objects.nation).not.toBe(topology.objects.nation);
    expect(filtered.objects.states).toBe(topology.objects.states);

    expect(filtered.objects).not.toBe(topology.objects);
    expect(filtered.arcs).toBe(topology.arcs);
  });

  it('should throw an error if the object type does no exist or is not a GeometryCollection', () => {
    expect(() => filterTopoObject(topology, 'other', d => d.id !== 1)).toThrow(TypeError);
    expect(() => filterTopoObject(topology, 'nothing', d => d.id !== 1)).toThrow(TypeError);
  });
});

describe('the fluentAssign() function', () => {
  it('should not alter keys in the target that do not overlap, but overwrite those that do', () => {
    const target = { a: 42, c: () => 3 };
    const source = { a: () => 1, b: () => 2 };
    const result = fluentAssign(target, source);

    expect(result.a()).toBe(target);
    expect(result.c()).toEqual(3);
  });

  it('should assign members from source to target as-is if members are not functions', () => {
    const target = {};
    const source = { a: 1, b: {} };
    const result = fluentAssign(target, source);

    expect(result.a).toEqual(1);
    expect(result.b).toEqual({});
  });

  it('should assign members from source to target and return target if they are functions', () => {
    const target = {};
    const source = { a: () => 1, b: () => 2 };
    const result = fluentAssign(target, source);

    expect(result.a()).toBe(target);
    expect(result.b()).toBe(target);
  });

  it('should execute the method from the underlying object, passing all arguments', () => {
    const target = {};
    const source = { a: jest.fn() };
    const result = fluentAssign(target, source);

    expect(result.a(1, 2, 3)).toEqual(target);
    expect(source.a).toHaveBeenCalledTimes(1);
    expect(source.a).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should only assign methods listed in the keys array if one is provided', () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = fluentAssign(target, source, ['a']);

    expect(result.a).toEqual(1);
    expect(result.b).toBeUndefined();
  });

  it('should skip missing keys in the keys array', () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = fluentAssign(target, source, ['a', 'c']);

    expect(result.a).toEqual(1);
    expect(result.c).toBeUndefined();
  });
});

describe('conditionalFluentAssign() function', () => {
  it('should not alter keys in the target that do not overlap, but overwrite those that do', () => {
    const target = { a: 42, c: () => 3 };
    const source = { a: () => 1, b: () => 2 };
    const result = conditionalFluentAssign(target, source);

    expect(result.a()).toEqual(1);
    expect(result.c()).toEqual(3);
  });

  it('should assign members from source to target as-is if members are not functions', () => {
    const target = {};
    const source = { a: 1, b: {} };
    const result = conditionalFluentAssign(target, source);

    expect(result.a).toEqual(1);
    expect(result.b).toEqual({});
  });

  it('should assign members from source to target and return target when the method returns source, but the actual return value otherwise', () => {
    const target = { x: 1 };
    const source = {};
    Object.assign(source, {
      a: (_) => (_ === undefined ? 1 : source),
    });
    const result = conditionalFluentAssign(target, source);

    expect(result.a()).toEqual(1);
    expect(result.a(42)).toBe(target);
  });

  it('should execute the method from the underlying object, passing all arguments', () => {
    const target = {};
    const source = {} as any;
    Object.assign(source, { a: jest.fn().mockReturnValue(source) });
    const result = conditionalFluentAssign(target, source);

    expect(result.a(1, 2, 3)).toEqual(target);
    expect(source.a).toHaveBeenCalledTimes(1);
    expect(source.a).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should only assign methods listed in the keys array if one is provided', () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = conditionalFluentAssign(target, source, ['a']);

    expect(result.a).toEqual(1);
    expect(result.b).toBeUndefined();
  });

  it('should skip missing keys in the keys array', () => {
    const target = {};
    const source = { a: 1, b: 2 };
    const result = conditionalFluentAssign(target, source, ['a', 'c']);

    expect(result.a).toEqual(1);
    expect(result.c).toBeUndefined();
  });
});
