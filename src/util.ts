import {
  Topology,
  Objects,
  Properties,
  GeometryCollection,
  GeometryObject,
  GeometryObjectA,
  NullObject,
} from 'topojson-specification';

/**
 * Modified TopoJSON GeometryCollection interface that ensures the members of a collection are
 * not `NullObject` therefore ensuring they have the properties keynot equal to `{}`.
 * 
 * TODO: Should this change, or allowing passing the prop type to NullObjcet be pushed into DT? 
 */
export interface GeometryCollectionNonNull<
  P extends Properties = Record<string, unknown>
> extends GeometryObjectA<P> {
  type: 'GeometryCollection';
  geometries: Array<Exclude<GeometryObject<P>, NullObject>>;
}

/**
 * Type guard to check if a GeometryObject is a GeometryCollection.
 *
 * @param object The GeometryObject to test
 */
export function isGeoCollection<T>(object: GeometryObject<T>): object is GeometryCollection<T> {
  return object.type === 'GeometryCollection';
}

/**
 * Merge a Map of properties key by GeoJSON Feature id into an array of GeoJSON Features.
 * 
 * Creates a clone of the passed array, merging properties in the process. Will behave as follows:
 * - Requires an id on the GeoJSON. If not present will match `undefined` as a key in the Map.
 * - Map properties will overwrite existing GeoJSON properties.
 * - If the `propsMap` parameter is passed as `null` or not provided, a copy of the original
 *   properties is returned.
 * - If the Feature's id is not in the Map, the GeoJson properties are merged with `{}`.
 * - For TypeScript the above two points mean that the merged properties are `Partial<Type>`.
 *  
 * @param featureSet Array of GeoJSON features into which to merge the new properties
 * @param propsMap A Map of GeoJSON feature id's to new properties to merge
 * 
 * TODO: Consider the partial beavior for TypeScript - is a less flexible version that errors better?
 */
export function mergeFeatureProps<P = GeoJSON.GeoJsonProperties, U = GeoJSON.GeoJsonProperties>(
  featureSet: GeoJSON.Feature<GeoJSON.Geometry, P>[],
  propsMap?: Map<string|number, U>,
): GeoJSON.Feature<GeoJSON.Geometry, P & Partial<U>>[] {
  return featureSet.map(feature => ({
    ...feature,
    properties: {
      ...feature.properties,
      ...(propsMap?.get(feature.id) ?? {}),
    },
  }));
}

/**
 * Merge a Map of properties keyed by TopoJSON Feature id into a TopoJSON object.
 * 
 * Creates a clone of the passed topology, merging properties into the passed object in the
 * process. Will behave as follows:
 * - Requires an id on the GeoJSON. If not present will match `undefined` as a key in the Map.
 * - Map properties will overwrite existing GeoJSON properties.
 * - If the `propsMap` parameter is passed as `null` or not provided, a copy of the original
 *   properties is returned.
 * - If the Feature's id is not in the Map, the GeoJson properties are merged with `{}`.
 * - For TypeScript the above two points mean that the merged properties are `Partial<Type>`.
 *   To get accurate types on the returned value, you must pass the output type to the generic
 *   or cast afterwards. Type inference may improve in the future.
 *  
 * @param topology The topology to modify
 * @param objectKey The object key on the topology to merge props with
 * @param propsMap Map of additional properties keyed by id to merge
 * 
 * TODO: How to improve typing?
 */
export function mergeTopoProps<O extends Objects = Objects>(
  topology: Topology,
  objectKey: string,
  propsMap?: Map<string|number, Record<string, unknown>>
): Topology<O> {
  const object = topology.objects[objectKey];
  
  if (!object || !isGeoCollection(object))
    throw new TypeError('The Geometry Object must be of type "GeometryCollection".');

  return {
    ...topology,
    // Allowing explicit declaration of return topology requires ignoring errors here
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    objects: {
      ...topology.objects,
      [objectKey]: {
        ...object,
        geometries: object.geometries.map(geom => {
          const newProps = propsMap?.get(geom.id) ?? {};
          return { ...geom, properties: { ...geom.properties, ...newProps } };
        }),
      },
    },
  };
}
