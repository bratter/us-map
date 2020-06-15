import { Selection } from 'd3-selection';
import { GeoPermissibleObjects } from 'd3-geo';
import { projection as proj, Projection } from '../projection';
import { VIEWBOX } from '../projection/util';
import { scopes } from './scopes';

type GeoSelection<Element extends SVGElement, GeoDatum extends GeoPermissibleObjects>
  = Selection<Element, GeoDatum, any, any>;

interface Size {
  width: number|null;
  height: number|null;
}

/**
 * usMap container function.
 */
export interface UsMap {
  <GeoDatum extends GeoPermissibleObjects>(selection: GeoSelection<SVGSVGElement, GeoDatum>): GeoSelection<SVGGElement, GeoDatum>;

  /**
   * Returns the usMapProjection for this instance. Should be considered readonly.
   */
  projection(): Projection;

  /**
   * Returns the bottom-right corner of the map's viewbox as `[x, y]`,
   * assuming the top left is `[0, 0]`.
   */
  viewBox(): [number, number];

  /**
   * Get or set the dimensions of the svg element.
   * 
   * When called with no arguments returns the current width and height on an object.
   * When called with an argument, merges the argument with the curret size and returns `this`.
   * The argument should be an object that contains one or both of a `width` and `height` member.
   */
  size(): Size;
  /**
   * @param _ A partial object containing the width and/or height
   */
  size(_: Partial<Size>): this;
}

/**
 * Factory function for creating a container for a US Maps.
 * 
 * @param scope Array of string FIPS codes to for inset inclusion
 */
export function usMap(scope: string[] = scopes.all): UsMap {
  const projection = proj(scope);
  const size: Size = { width: null, height: null };

  function usMap(selection: GeoSelection<SVGSVGElement, any>) {
    return selection
      .classed('usMap', true)
      .attr('viewBox', [0, 0].concat(VIEWBOX).join(','))
      .attr('width', size.width)
      .attr('height', size.height)
      .selectAll<SVGGElement, any>('g.usMap')
      .data([null])
      .join(enter => enter.append('g').classed('usMap', true));
  }

  usMap.projection = () => projection;
  usMap.viewBox = () => [...VIEWBOX] as [number, number];
  usMap.size = function (_?) {
    return _ === undefined ? { ...size } : (Object.assign(size, _), this);
  };

  return usMap;
}
