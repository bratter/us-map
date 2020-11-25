import * as d3  from 'd3-selection';
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
const UNDERLAY_CLASS = 'usMapPointerUnderlay';

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
   * 
   */
  clear(selection: GeoSelection<SVGSVGElement, any>): void;
  
  /**
   * Sets whether the zooms applied to the same selection should by synced or run separately.
   * 
   * When true (default) zoom tranforms applied to a selection will be synchronized. When false,
   * each element in the selection is managed separately.
   */
  sync(): boolean;
  /** @param _ Boolean representing the sync state */
  sync(_: boolean): Zoomable;
} 

export function zoomable(map: UsMap): Zoomable {
  let sync = true;

  const zoomBehaviorAdded = Symbol('zoomBehaviorAdded');
  const zoomBehavior = zoom()
    .duration(ZOOM_DEFAULTS.duration)
    .extent(ZOOM_DEFAULTS.extent)
    .translateExtent(ZOOM_DEFAULTS.extent)
    .scaleExtent(ZOOM_DEFAULTS.scaleExtent);

  function zoomable(selection: GeoSelection<SVGSVGElement, any>) {
    const mapGroup = map(selection);

    // Create and replace the zoom transform each time because the sync value may change
    // overhead for doing so is minimal
    zoomBehavior.on(
      'zoom.usmap',
      sync ? syncZoomHandler(selection) : unsyncedZoomHandler,
    );

    // Add the zoom handler to each container in the passed selection only if not previously done
    // This allows the user to manually unset animations per the d3-zoom docs without re-adding
    // them on each call
    selection.each(function () {
      if (!this[zoomBehaviorAdded]) {
        d3.select(this)
          .call(zoomBehavior)
          .call(addPointerUnderlay);
        this[zoomBehaviorAdded] = true;
      }
    });

    return mapGroup;
  }

  zoomable.clear = function (selection) {
    selection.on('.zoom', null);
    selection.each(function () {
      this[zoomBehaviorAdded] = undefined;
    });
  }

  zoomable.sync = function (_?) { return _ === undefined ? sync : (sync = _, zoomable) };

  conditionalFluentAssign(zoomable, zoomBehavior);
  return Object.assign(zoomable, map) as any;
}

function unsyncedZoomHandler() {
  d3.select(this)
    .select('g.usMap')
    .attr('transform', d3.event.transform);
}

function syncZoomHandler(selection: GeoSelection<any, any>) {
  return function syncZoomHandler() {
    const {transform} = d3.event;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const el = this;

    // Applying the transofrm to all usMap groups defines which elements are zoomed
    selection.selectAll('g.usMap').attr('transform', transform);

    // Manually adjusting the zoom transform is required to avoid jumping on the next event
    // The this.__zoom "escape hatch" is required to avoid infinite looping
    selection.each(function () {
      if (this !== el)
        this.__zoom = transform;
    });
  };
}

function addPointerUnderlay(selection: GeoSelection<any, any>) {
  selection
    .selectAll(`rect.${UNDERLAY_CLASS}`)
    .data([null])
    .join('rect')
    .attr('class', UNDERLAY_CLASS)
    .attr('width', VIEWBOX[0])
    .attr('height', VIEWBOX[1])
    .attr('fill', 'none')
    .attr('pointer-events', 'visible')
    .lower();
}
