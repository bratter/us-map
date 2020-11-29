import { Topology, GeometryObject } from 'topojson-specification';
import { makeMeshGeoJSON } from './make-geojson';
import { UsAtlasObjects, PremadeFeature, PropsSelection } from './types';
import { feature, Feature } from '../feature';
import { scopes } from '../../projection';

/** Map object names to feature type values */
const typeMap = new Map([
  ['nation', 'nationMesh'],
  ['states', 'stateMesh'],
  ['counties', 'countyMesh'],
  ['outlines', 'outlineMesh'],
]);

/**
 * Make a mesh render function based on the object key.
 * 
 * These functions use topojson mesh to create a single path merging together and de-duplicating
 * the feature set. While it uses the full feature factory function for simplicity, these meshes,
 * unlike the other premade features, should not have data bound to them. The typings allow it but
 * the data will be ignored.
 * 
 * @param object The tyoe of feature to make
 * @param featureCb Callback to edit the feature's settings
 * @param filter TopoJSON mesh filter to apply to the feature
 */
function makePremadeMesh(
  object: 'nation'|'states'|'counties'|'outlines',
  featureCb?: (feature: Feature) => void,
  filter?: (a: GeometryObject, b: GeometryObject) => boolean,
): (topology: Topology<UsAtlasObjects>, scope?: string[]) => PremadeFeature {
  return function premadeMesh(topology: Topology<UsAtlasObjects>, scope = scopes.all()): PremadeFeature {
    if (!topology?.objects?.[object])
      throw new TypeError(`The passed topology must have a ${object} object.`);
    
    const geoJson = makeMeshGeoJSON(topology, scope, object, filter);
    const className = `${typeMap.get(object)}Merge`;
    const f = feature(typeMap.get(object));
    // Set any settings on the feature if passed
    if (featureCb) featureCb(f);

    function premadeMesh(selection: PropsSelection) {
      const merge = selection
        .selectAll<SVGGElement, any>(`g.${className}`)
        .data([[geoJson]])
        .join('g')
        .classed(className, true);
      
      return f(merge)
        .attr('pointer-events', 'none');
    }

    return Object.assign(premadeMesh, f);
  }
}

/**
 * Create an outline mesh feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * This mesh produces a pre-projected set of boundaries for the inset areas in the provided
 * topology. It produces a single path element meshed using TopoJSON mesh. The topology should
 * be pre-filtered to remove any features you don't want.
 * 
 * Meshes are not designed for interactivity - their rendering runs only on *enter*, and they
 * set `pointer-events: none` on the containing group so they are transparent to interactions.
 * Meshes should also not be filled, but stroke weight and color can be set using the `width()`
 * and `strokeColor()` methods.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 */
export const outlineMesh = makePremadeMesh('outlines', f => {
  f.width(0.5).strokeColor().range(['#777777']);
  f.fillColor().range(['none']);
});

/**
 * Create a nation mesh feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * This mesh produces a pre-projected boundary around the nation object. It produces a single
 * path element meshed using TopoJSON mesh. The topology should be pre-filtered to remove any
 * features you don't want.
 * 
 * Meshes are not designed for interactivity - their rendering runs only on *enter*, and they
 * set `pointer-events: none` on the containing group so they are transparent to interactions.
 * Meshes should also not be filled in general, however this mesh is an exception. Stroke weight
 * and color can be set using the `width()` and `strokeColor()` methods.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 */
export const nationMesh = makePremadeMesh('nation', f => {
  f.strokeColor().range(['#202020']);
  f.fillColor().range(['none']);
});

/**
 * Create a state mesh feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * This mesh produces a pre-projected boundary around the states object. It produces a single
 * path element meshed using TopoJSON mesh. The topology should be pre-filtered to remove any
 * features you don't want.
 * 
 * Meshes are not designed for interactivity - their rendering runs only on *enter*, and they
 * set `pointer-events: none` on the containing group so they are transparent to interactions.
 * Meshes should also not be filled, but stroke weight and color can be set using the `width()`
 * and `strokeColor()` methods.
 * 
 * The `includeNation` parameter should be passed as true when you want to include the nation's
 * border in the output. It is false by default which only includes *inner* borders, which is
 * most useful when the mesh is being used as an overlay.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 * @param includeNation Flag to indicate whether the nation border should also be included
 */
export const stateMesh = (
  topology: Topology<UsAtlasObjects>,
  scope = scopes.all(),
  includeNation = false,
): PremadeFeature => makePremadeMesh(
  'states',
  f => {
    f.width(0.5).strokeColor().range(['#202020']);
    f.fillColor().range(['none']);
  },
  includeNation ? undefined: (a, b) => (a !== b),
)(topology, scope);

/**
 * Create a county mesh feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * This mesh produces a pre-projected boundary around the counties object. It produces a single
 * path element meshed using TopoJSON mesh. The topology should be pre-filtered to remove any
 * features you don't want.
 * 
 * Meshes are not designed for interactivity - their rendering runs only on *enter*, and they
 * set `pointer-events: none` on the containing group so they are transparent to interactions.
 * Meshes should also not be filled, but stroke weight and color can be set using the `width()`
 * and `strokeColor()` methods.
 * 
 * The `includeNation` and/or the `includeState` parameter should be passed as true when you want
 * to include the respective feature's border in the output. It is false by default which only
 * includes *inner* borders, which is most useful when the mesh is being used as an overlay.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 * @param includeNation Flag to indicate whether the nation border should also be included
 * @param includeStates Flag to indicate whether the state border should also be included
 */
export const countyMesh = (
  topology: Topology<UsAtlasObjects>,
  scope = scopes.all(),
  includeNation = false,
  includeStates = false,
): PremadeFeature => {
  const meshCondition = (a: GeometryObject, b: GeometryObject) => 
    (includeNation || a !== b)
    && (includeStates || (+a.id / 1000 | 0) === (+b.id / 1000 | 0));

  return makePremadeMesh(
    'counties',
    f => {
      f.width(0.5).strokeColor().range(['#aaaaaa']);
      f.fillColor().range(['none']);
    },
    meshCondition,
  )(topology, scope)
};
