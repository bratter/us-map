import { Topology, GeometryObject } from 'topojson-specification';
import { feature, merge, mesh, mergeArcs } from 'topojson-client';
import { scopes } from '../../projection';
import { UsAtlasObjects } from './types';
import { filterTopoObject } from '../../util';

export function makeFeatureGeoJSON(
  topology: Topology<UsAtlasObjects>,
  scope: string[],
  object: 'nation'|'states'|'counties',
): any {
  // Nation guard: special condition required because the nation feature is merged from states
  if (object === 'nation' && !topology?.objects?.states)
    throw new TypeError(`The Nation feature requires both the 'nation' and 'states' object in the TopoJSON.`);
  
  const filteredTopology = filterTopoObject(
    topology,
    object === 'nation' ? 'states' : object,
    fipsLookupFn(scope),
  );

  return object === 'nation'
    ? processNationGeoJSON(filteredTopology)
    : processOtherGeoJSON(filteredTopology, object);
}

export function makeMeshGeoJSON(
  topology: Topology<UsAtlasObjects>,
  scope: string[],
  object: 'nation'|'states'|'counties'|'outlines',
  filter?: (a: GeometryObject, b: GeometryObject) => boolean,
): any {
  // Nation guard: special condition required because the nation feature is merged from states
  if (object === 'nation' && !topology?.objects?.states)
    throw new TypeError(`The NationMesh feature requires both the 'nation' and 'states' object in the TopoJSON.`);

  const filteredTopology = filterTopoObject(
    topology,
    object === 'nation' ? 'states' : object,
    fipsLookupFn(scope),
  );
  const topoObject = object === 'nation'
    ? mergeArcs(filteredTopology, filteredTopology.objects.states.geometries as any) as any
    : filteredTopology.objects[object];

  return mesh(filteredTopology, topoObject, filter);
}

/**
 * Utility function to filter FIPS codes based on the scope.
 * 
 * This is a highly permissive function - it assumes the incoming fips codes are valid, then
 * excludes selectively.
 * 
 * Also note that it must adjust for ids that are an amalgamation of FIPS codes (such as the
 * outlines).
 */
function fipsLookupFn(scope: string[]) {
  const lookup = Object.fromEntries(
    scopes.all().map(fips => [fips, scope.includes(fips)])
  );

  return (geom: GeoJSON.Feature) => {
    // Some incoming ids might be comma separated lists of strings,
    // we want to keep the geometry if any are true
    const ids = String(geom.id).split(',');
    return ids.some(id => lookup[id.slice(0, 2)] ?? true);
    // return lookup[String(geom.id).slice(0, 2)] ?? true};
  }
}

function processOtherGeoJSON(topology: Topology<UsAtlasObjects>, object: string) {
  const geoJSON = feature(topology, topology.objects[object]) as any;
  return geoJSON.features;
}

function processNationGeoJSON(topology: Topology<UsAtlasObjects>) {
  const geometry = merge(topology, topology.objects.states.geometries as any);
  const {id, properties} = topology.objects.nation.geometries[0];

  // Building GeoJSON feature by hand to avoid doubling up on creation
  return [
    {type: 'Feature', id, properties, geometry},
  ];
}
