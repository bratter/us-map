import { mergeFeatureProps, mergeTopoProps, GeometryCollectionNonNull } from './util';
import { Topology } from 'topojson-specification';

const geoJSONFeatures: GeoJSON.Feature<GeoJSON.Geometry, { prop1: number }>[] = [
  { type: 'Feature', id: 1, properties: { prop1: 1 }, geometry: { type: 'Point', coordinates: [] } },
  { type: 'Feature', id: 2, properties: { prop1: 2 }, geometry: { type: 'Point', coordinates: [] } },
];

const topology: Topology<{ nation: GeometryCollectionNonNull<{ prop1: number }> }> = {
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
