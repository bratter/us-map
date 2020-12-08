import { select, Selection } from 'd3-selection';
import { zoomTransform } from 'd3-zoom';
import { Zoomable } from './zoomable';
import { Feature } from '../map';

/**
 * Width scaling mixin for a feature.
 * 
 * The mixed feature will scale its stroke width linearly with the current zoom scale. This ensures
 * that the stroke has the same visual appearance irrepsective of the zoom level.
 * 
 * The returned render function is a no-op if the map instance is not zoomable.
 * 
 * @param feature A feature to scale the width for
 * @param map A zoomable map instance
 */
export function scaleWidth(feature: Feature, map: Zoomable): Feature {
  if (typeof feature.width !== 'function')
    throw new TypeError('The feature to be wrapped must have a width method.');
  
  return Object.assign((selection: Selection<SVGGElement, any, any, any>) => {
    const strokeWidth = function () {
      return feature.width() / zoomTransform(this).k;
    };
    const wrappers = feature(selection).attr('stroke-width', strokeWidth);

    if (typeof map.on === 'function') {
      map.on('zoom.usMap-scaleStroke', () => {
        wrappers.each(function () {
          select(this).attr('stroke-width', strokeWidth);
        });
      });
    }
  
    return wrappers;
  }, feature);
}
