import { UsMap } from '../map';
import { GeoSelection } from '../map/types';

/**
 * Zoomable addition to a UsMap container function.
 * 
 * This functional mixin adds `d3.zoom` features to a map instance. The call signature adds an
 * optional second argument *name*, which can be used to add a custom name to the zoom transitions.
 * If not provided (or the same name provided multiple times) subsequent calls will replace pre-
 * existing zoom handlers.
 */
export interface Zoomable extends UsMap {
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

  function zoomable(selection: GeoSelection<SVGSVGElement, any>) {
    return selection;
  }

  zoomable.sync = function (_?) { return _ === undefined ? sync : (sync = _, this) };

  return Object.assign(zoomable, map);
}
