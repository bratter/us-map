import { Topology } from 'topojson-specification';
import { PremadeFeature, PropsSelection, UsAtlasObjects } from './types';
import { makeFeatureGeoJSON } from './make-geojson';
import { feature } from '../feature';
import { mergeFeatureProps } from '../../util';
import { scopes } from '../../projection';

/** Map object names to feature type values */
const typeMap = new Map([
  ['nation', 'nation'],
  ['states', 'state'],
  ['counties', 'county'],
]);

/**
 * Make a feature render function based on the object key.
 * 
 * For these render functions, there are three ways to join data into the feature's GeoJSON:
 * 
 * 1. Pre-merge data into the TopoJSON before passing to the factory function. This is the most
 *    efficient method but can only be done once - the data can't be changed on subsequent renders.
 * 2. Bind data to wrapping element as an array of Maps for each instance of the featureset.
 *    The premade feature will merge this data into the GeoJSON feature as part of it's join.
 *    This is the recommended method if data will change over the lifetime of the vizualization.
 * 3. Post-select the paths, then join on id using `g.selectAll('path').data(data, d => d.id)`.
 *    This is NOT recommended as it replaces that original data and requires care in merging.
 * 
 * @param object The type of feature to make
 */
function makePremadeFeature(
  object: 'nation'|'states'|'counties',
): (topology: Topology<UsAtlasObjects>, scope?: string[]) => PremadeFeature {
  return function premade(topology: Topology<UsAtlasObjects>, scope = scopes.all()): PremadeFeature {
    if (!topology?.objects?.[object])
      throw new TypeError(`The passed topology must have a '${object}' object.`);

    // Array of GeoJSON features to be merged into by each datum in the selection
    const geoJson = makeFeatureGeoJSON(topology, scope, object);
    const className = `${typeMap.get(object)}Merge`;
    const f = feature(typeMap.get(object));

    function premade(selection: PropsSelection) {
      const merge = selection
        .selectAll<SVGGElement, any>(`g.${className}`)
        // Merge geoJson data and rebind inside an array to make single merge group
        // Will merge on the id if available (which it should be) but uses index as a fallback
        .data(d => [mergeFeatureProps(geoJson, d)], (d, i) => d.id ?? i)
        .join('g')
        .classed(className, true);

      // Return the result of the of the feature call to stay consistent
      return f(merge);
    }

    return Object.assign(premade, f);
  }
}

/**
 * Create a nation feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * These features produce one `<path>` element per feature and are designed for interactivity
 * (event binding) and data display (data binding). See docs for ways to merge data into the
 * feature to cascade to child elements or access in the feature's fill and stroke accessors.
 * Features will be rendered as per the scope, or can be filtered mnually from the topology.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 */
export const nation = makePremadeFeature('nation');

/**
 * Create a states feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * These features produce one `<path>` element per feature and are designed for interactivity
 * (event binding) and data display (data binding). See docs for ways to merge data into the
 * feature to cascade to child elements or access in the feature's fill and stroke accessors.
 * Features will be rendered as per the scope, or can be filtered mnually from the topology.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 */
export const states = makePremadeFeature('states');

/**
 * Create a counties feature based on pre-projected and filtered UsAtlas Topology.
 * 
 * These features produce one `<path>` element per feature and are designed for interactivity
 * (event binding) and data display (data binding). See docs for ways to merge data into the
 * feature to cascade to child elements or access in the feature's fill and stroke accessors.
 * Features will be rendered as per the scope, or can be filtered mnually from the topology.
 * 
 * @param topology The topology object to build the feature from
 * @param scope Scope of features to render
 */
export const counties = makePremadeFeature('counties');
