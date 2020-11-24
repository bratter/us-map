import { Selection } from 'd3-selection';
import { GeoPermissibleObjects, geoPath } from 'd3-geo';
import { scaleOrdinal } from 'd3-scale';
import { AccessorFunction, MinimalScale } from './types';
import { Projection } from '../projection';

/**
 * UsMap feature function.
 * 
 * Call with a selection of group elements to add a feature to a usMap instance. To make best use
 * of the preconfigured usMap settings, the groups should be the returned groups from a call to
 * `usMap(svg)`. The datum attached to each item in the selection must be a valid array of GeoJSON
 * Features that has been pre-projected into the appropriate geometry. Data added to the
 * `properties` key of each feature can be accessed by the `fill()` and `stroke()` accessor
 * functions to color the featureset based on data (e.g. choropleths).
 * 
 * For usMap, pre-built features have been prepared for nation, states, and counties based on the
 * [@d3ts/us-atlas](https://github.com/bratter/us-atlas).
 * 
 * @param selection The selection of svg g elements being called
 */
export interface Feature {
  <GeoDatum extends GeoPermissibleObjects>(selection: Selection<SVGGElement, GeoDatum[], any, any>): Selection<SVGGElement, GeoDatum[], any, any>;

  /** Return the type of the features. Useful for selectors. */
  type(): string;

  /**
   * Get or set the current fill data accessor. The return value will be passed to the color scale for mapping.
   */
  fill(): AccessorFunction;
  /**
   * @param _ The accessor function
   */
  fill(_: AccessorFunction): this;

  /**
   * Get or set the fill color scale.
   * 
   * Defaults to a single light grey value in an ordinal scale. To set a new scale either:
   * Retrieve the existing ordinal scale and modify, create a new scale (of any type) and pass in,
   * or pass an array of strings representing a new range for an ordinal scale. The return value
   * from the fill accessor will be passed to the scale for evaluation.
   */
  fillColor<ScaleType extends MinimalScale = any>(): ScaleType;
  /**
   * @param _ Color scale or range array
   */
  fillColor<ScaleType extends MinimalScale = any>(_: ScaleType|string[]): this;

  /**
   * Get or set the current stroke data accessor. The return value will be passed to the color scale for mapping.
   */
  stroke(): AccessorFunction;
  /**
   * @param _ The accessor function
   */
  stroke(_: AccessorFunction): this;

  /**
   * Get or set the stroke color scale.
   * 
   * Defaults to a single white value in an ordinal scale. To set a new scale either:
   * Retrieve the existing ordinal scale and modify, create a new scale (of any type) and pass in,
   * or pass an array of strings representing a new range for an ordinal scale. The return value
   * from the stroke accessor will be passed to the scale for evaluation.
   */
  strokeColor<ScaleType extends MinimalScale = any>(): ScaleType;
  /**
   * @param _ Color scale or range array
   */
  strokeColor<ScaleType extends MinimalScale = any>(_: ScaleType|string[]): this;

  /**
   * Get or set the stroke-width of the feature.
   * 
   * Stroke width is applied to the group, not the individual path elements and is a fixed width.
   */
  width(): number;
  /**
   * @param _ The stroke width to set
   */
  width(_: number): this;
}

/**
 * Factory function for creating a feature for US Maps.
 * 
 * Renders a collection of pre-projected GeoJSON objects.
 * 
 * For UsMap, pre-built features have been prepared for nation, states, and counties based on the
 * [@d3ts/us-atlas](https://github.com/bratter/us-atlas).
 * 
 * @param type The type of feature to be used in the class name
 */
export function feature(type = 'feature', projection?: Projection): Feature {
  // Using unprojected path only, feature can only be ,used for pre-projected GeoJSON
  const path = geoPath<any, any>(projection);

  let fill: AccessorFunction = d => d?.id;
  let fillColor: MinimalScale = scaleOrdinal(['#e5e5e5']);
  let stroke: AccessorFunction = d => d?.id;
  let strokeColor: MinimalScale = scaleOrdinal(['#ffffff']);
  let width = 1;

  function feature<GeoDatum>(selection: Selection<SVGGElement, GeoDatum[], any, any>): Selection<SVGGElement, GeoDatum[], any, any> {
    const wrapper = selection
      .selectAll<SVGGElement, GeoPermissibleObjects[]>(`g.${type}Wrapper`)
      // Double array if data is falsy means this does not error even if there is no bound data
      .data(d => d ? [d] : [[]])
      .join(enter => enter
        .append('g')
        .classed(`${type}Wrapper`, true)
        .attr('stroke-linejoin', 'round')
        // Pointer-events="visible" means that unfilled paths will still capture events
        // as long as the element is not hidden
        .attr('pointer-events', 'visible')
      )
      .attr('stroke-width', width);
    
    wrapper
      .selectAll(`path.${type}`)
      // Join on the id if it is present, the index otherwise using nullish coalescing 
      .data(d => d, (d: any, i) => d.id ?? i)
      // Calculate path on enter for performance, therefore path data cannot change on re-render
      .join(enter => enter.append('path').classed(type, true).attr('d', path))
      .attr('fill', (d, i) => fillColor(fill(d, i)))
      .attr('stroke', (d, i) => strokeColor(stroke(d, i)));

    return wrapper;
  }

  feature.type = () => type;
  feature.fill = function (_?) { return _ === undefined ? fill : (fill = _, this) };
  feature.fillColor = function (_?) {
    return _ === undefined
      ? fillColor
      : (fillColor = Array.isArray(_) ? scaleOrdinal(_.slice()) : _, this);
  };
  feature.stroke = function (_?) { return _ === undefined ? stroke : (stroke = _, this) };
  feature.strokeColor = function (_?) {
    return _ === undefined
      ? strokeColor
      : (strokeColor = Array.isArray(_) ? scaleOrdinal(_.slice()) : _, this);
  };
  feature.width = function (_?) { return _ === undefined ? width : (width = _, this) };

  return feature;
}
