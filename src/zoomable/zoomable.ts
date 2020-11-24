import { ZoomBehavior, zoom } from 'd3-zoom';
import { UsMap } from '../map';
import { GeoSelection } from '../map/types';
import { VIEWBOX } from '../projection/util';
import { conditionalFluentAssign } from '../util';

const ZOOM_DEFAULTS = {
  duration: 250,
  extent: [[0, 0], VIEWBOX] as any,
  scaleExtent: [1, 10] as any,
};

/**
 * Zoomable addition to a UsMap container function.
 * 
 * This functional mixin adds `d3.zoom` features to a map instance. The call signature adds an
 * optional second argument *name*, which can be used to add a custom name to the zoom transitions.
 * If not provided (or the same name provided multiple times) subsequent calls will replace pre-
 * existing zoom handlers.
 */
export interface Zoomable
  extends UsMap,
    Pick<
      ZoomBehavior<any, any>,
      | 'transform'
      | 'translateBy'
      | 'translateTo'
      | 'scaleBy'
      | 'scaleTo'
      | 'constrain'
      | 'filter'
      | 'touchable'
      | 'wheelDelta'
      | 'extent'
      | 'scaleExtent'
      | 'translateExtent'
      | 'clickDistance'
      | 'duration'
      | 'interpolate'
      | 'on'
    > {
  /**
   * Sets whether the zooms applied to the same selection should by synced or run separately.
   * 
   * When true (default) zoom tranforms applied to a selection will be synchronized. When false,
   * each element in the selection is managed separately.
   */
  sync(): boolean;
  /** @param _ Boolean representing the sync state */
  sync(_: boolean): this;
} 

export function zoomable(map: UsMap): Zoomable {
  let sync = true;

  const zoomBehavior = zoom()
    .duration(ZOOM_DEFAULTS.duration)
    .extent(ZOOM_DEFAULTS.extent)
    .translateExtent(ZOOM_DEFAULTS.extent)
    .scaleExtent(ZOOM_DEFAULTS.scaleExtent);

  function zoomable(selection: GeoSelection<SVGSVGElement, any>) {
    return map(selection);
  }

  zoomable.sync = function (_?) { return _ === undefined ? sync : (sync = _, this) };

  conditionalFluentAssign(zoomable, zoomBehavior);
  return Object.assign(zoomable, map) as any;
}
