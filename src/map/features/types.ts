import { Selection } from 'd3-selection';
import { GeometryCollection, Properties } from 'topojson-specification';
import { GeoPermissibleObjects } from 'd3-geo';
import { Feature } from '../feature';

/**
 * A Selection type representing a Map of properties.
 */
export type PropsSelection<Props extends Properties = Properties> = Selection<
  SVGGElement,
  Map<string | number, Props>|undefined,
  any,
  any
>;

/**
 * Specialized Feature interface with pre-built GeoJSON to merge with bound properties,
 * rather than binding in the GeoJSON as with Feature.
 */
export interface PremadeFeature extends Feature {
  <Props extends Properties, GeoDatum extends GeoPermissibleObjects = GeoPermissibleObjects>(
    selection: PropsSelection<Props>
  ): Selection<SVGGElement, GeoDatum[], any, any>;
}

export interface NationProperties {
  /** The string "United States". */
  name: string;
}

export interface StateProperties {
  /** Full name of the state. */
  name: string;
  /** Two letter code for the state. */
  code: string;
  /** AP abbreivation for the state. */
  abbrev: string;
  /** Legal type of the entity: "state", "federal district", or "insular area". */
  type: string;
}

export interface CountyProperties {
  /**
   * The name of the county.
   * For disambiguation recommend labelling counties using name and state `${name}, ${state}`. 
   */
  name: string;
  /** Two letter code for the state containing the county. */
  state: string;
}

/** Objects available on the US Atlas TopoJSON. */
export interface UsAtlasObjects<
  N extends Properties = Record<string, unknown>,
  S extends Properties = Record<string, unknown>,
  C extends Properties = Record<string, unknown>,
  O extends Properties = Record<string, unknown>,
> {
  nation?: GeometryCollection<NationProperties & N>,
  states?: GeometryCollection<StateProperties & S>,
  counties?: GeometryCollection<CountyProperties & C>,
  outlines?: GeometryCollection<O>,
  [key: string]: any,
}
