import { GeoStream, geoAlbers} from 'd3-geo';
import { Point, PointStream, Projection, Inset } from './types';
import { getInsetStates, makeInsets, SCALE, VIEWBOX, EPSILON } from './util';
import { multiplex } from './mulitplex';
import { insetData, insetFips } from './insets-data';

/**
 * Create a customized Albers' (US-centered) equal area conic projection.
 * 
 * This constructor builds a projection with the continental US centered on a 1024×576
 * viewport (16:9 aspect ratio). By default it will include all insets (states & insular areas),
 * but by passing an empty array `[]` or an array of 2-digit State FIPS codes (as strings) the
 * projection can be cusotmized to include only the lower 48 states or any available combination
 * of appropriately scaled and positioned insets for all States and Insular Areas. Any array of
 * FIPS codes can be provided, but only those containing `'02'`, `'15'`, and any valid code
 * greater than or equal to `'60'` will modify the projection.
 * 
 * @param stateIdList Array of 2-digit string State FIPS codes
 */
export function projection(stateIdList: string[] = insetFips): Projection {
  const insets: Inset[] = makeInsets(insetData, getInsetStates(stateIdList)),
    lower48 = geoAlbers(),
    pointStream = { point: function(x, y) { point = [x, y]; } } as GeoStream,
    dx = 0.02,
    dy = -0.01;

  let cache: GeoStream | null,
    cacheStream: GeoStream | null,
    lower48Point: PointStream,
    point: Point;

  /**
   * Configurable usMap projection function.
   * 
   * @param coordinates The point to project
   */
  function projection(coordinates: Point): Point {
    const [x, y] = coordinates;
    
    point = null;
    lower48Point.point(x, y);
    
    return insets.reduce((acc, cur) => acc || (cur.point.point(x, y), point), point);
  }

  function reset() {
    cache = cacheStream = null;
    return projection;
  }

  projection.insets = () => [...insets];

  projection.invert = function (coordinates: Point) {
    // Offset the xy and y coordinates by the lower48 offset to ensure the insert boxes capture the correct coords
    const k = lower48.scale(),
      t = lower48.translate(),
      x = (coordinates[0] - t[0]) / k + dx,
      y = (coordinates[1] - t[1]) / k + dy;
    
    for (let i = 0; i < insets.length; ++i) {
      const p = insets[i].projection, [[x0, y0], [x1, y1]] = insets[i].extent;
      
      if (y >= y0 && y < y1 && x >= x0 && x < x1) return p.invert(coordinates);
    }

    return lower48.invert(coordinates);
  };

  projection.stream = function (stream: GeoStream) {
    return cache && cacheStream === stream
      ? cache
      : cache = multiplex([
        lower48.stream(cacheStream = stream),
        ...insets.map(inset => inset.projection.stream(stream)),
      ]);
  };

  projection.precision = function (_?: number) {
    if (!arguments.length) return lower48.precision();
    
    lower48.precision(_);
    insets.forEach(i => i.projection.precision(_));

    return reset();
  };

  // Allow any to avoid unecessary types as can't provide overload signatures inline
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projection.scale = function (_?: number): any {
    if (!arguments.length) return lower48.scale();

    lower48.scale(_);
    insets.forEach(i => i.projection.scale(_ * i.scale));

    return projection.translate(lower48.translate());
  };


  // TODO: Offset [tx, ty] should also be applied to clip extent?
  projection.translate = function (_?: Point) {
    // Set an offset on the lower48 to allow the states to move without affecting the overall projection
    const k = lower48.scale();

    if (!arguments.length) {
      const [tx, ty] = lower48.translate();
      return [tx - dx * k, ty - dy * k];
    }

    const x = +_[0], y = +_[1];
    lower48Point = lower48
      .translate([x + dx * k, y + dy * k])
      .clipExtent([[x - 0.4655 * k, y - 0.262 * k], [x + 0.4655 * k, y + 0.262 * k]])
      .stream(pointStream);

    for (let i = 0; i < insets.length; ++i) {
      const p = insets[i].projection,
        [[x0, y0], [x1, y1]] = insets[i].extent,
        [tx, ty] = insets[i].translate;
      
        insets[i].point = p
        .translate([x + tx * k, y + ty * k])
        .clipExtent([[x + x0 * k + EPSILON, y + y0 * k + EPSILON], [x + x1 * k - EPSILON, y + y1 * k - EPSILON]])
        .stream(pointStream);
    }

    return reset();
  };

  // Return the projection scaled and centered on the viewport
  return projection.scale(SCALE).translate(<Point>VIEWBOX.map(d => d / 2));
}
