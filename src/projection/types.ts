import { GeoProjection } from 'd3-geo';

export type Point = [number, number];

export type PointStream = { point: (x: number, y: number) => void};

/**
 * A customized Albers' (US-centered) equal area conic projection.
 * 
 * The projection places the continental US centered on a 1024×576
 * viewport (16:9 aspect ratio).By default it only includes the lower-48 states, but by passing
 * an array of 2-digit State FIPS codes (as strings) the projection can be cusotmized to include
 * appropriately scaled and positioned insets for all States and Insular Areas. Any array of FIPS
 * codes can be provided, but only those containing `'02'`, `'15'`, and any valid code greater
 * than or equal to `'60'` will modify the projection.
 */
export interface UsMapProjection extends Required<Pick<GeoProjection, 'invert'|'stream'|'precision'|'scale'>> {
  /**
   * Returns a new array [x, y] (typically in pixels) representing the projected point of the given
   * point. The point must be specified as a two-element array [longitude, latitude] in degrees.
   * May return null if the specified point has no defined projected position, such as when the
   * point is outside the clipping bounds of the projection.
   * 
   * @param point A point specified as a two-dimensional array [longitude, latitude] in degrees.
   */
  (coordinates: Point): Point;
  /**
   * Return a copy of the inset data being used in this projection.
   */
  insets(): Inset[];

  /**
   * Sets the projection’s translation offset to the specified two-element array [tx, ty] and
   * returns the projection. The translation offset determines the pixel coordinates of the
   * projection’s center. The default translation offset places ⟨0°,0°⟩ at the center of a
   * 1024×576 area.
   * 
   * @param point A two-element array [tx, ty] specifying the translation offset. The default
   *              translation offset of defaults to [512, 288], placing the lower 48 states
   *              approximately at the center of a 1024×576 area.
   */
  translate(): Point;
  translate(point: Point): UsMapProjection;
}

export interface Inset {
  id: string;
  name: string;
  type: string;
  fips: string[];
  codes: string[];
  projection: GeoProjection;
  translate: Point;
  extent: [Point, Point];
  scale: number;
  point?: PointStream;
}
