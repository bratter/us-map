import { projection } from './projection';
import { insetData } from './insets-data';
import { Point } from './types';

// Augment jest matchers for point specific match
// TODO: Move this to global bootstrap
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      pointToMatch(compare: Point, delta?: number): R;
    }
  }
}

expect.extend({
  pointToMatch(received: Point, compare: Point, delta = 1e-3) {
    const [x0, y0] = received,
      [x1, y1] = compare,
      pass = x0 - x1 <= delta && y0 - y1 <= delta,
      message = () => `expected [${x0.toFixed(2)}, ${y0.toFixed(2)}]${pass ? ' not' : ''} to equal [${x1.toFixed(2)}, ${y1.toFixed(2)}] with precision ${delta}`;

      return { pass, message };
  },
});

const insetFips = ['02', '15', '72', '78', '60', '66', '69'];

describe('projection()', () => {
  describe('projection() factory function', () => {
    it('should return a function when passed on arguments', () => {
      const proj = projection();
  
      expect(typeof proj).toEqual('function');
    });
  
    it('should have no insets when caled with no arguments', () => {
      const proj = projection();
  
      expect(proj.insets()).toHaveLength(0);
    });
  
    it('should have all insets when the full list of insettable states is passed', () => {
      const proj = projection(['02', '15', '72', '78', '60', '66', '69']);
  
      expect(proj.insets()).toHaveLength(5);
    });
  
    it('should filter the insets appropriately', () => {
      // Using objectContaining because the projection adds the point field
      // Could do this as a private symbol to avoid polluting the object, but this will also need
      // objectContaining because symbols are compared in jest's toEqual
      const exp = expect
        .arrayContaining(insetData.filter(d => d.id === 'AK' || d.id === 'GU-MP')
        .map(d => expect.objectContaining(d)));
      const proj = projection(['02', '66']);
  
      expect(proj.insets()).toHaveLength(2);
      expect(proj.insets()).toEqual(exp);
    });  
  });

  describe('projection(point) and projection.invert(point)', () => {
    // Members are name, coordinates, projected coordinates, scaled at 800 coordinates
    const data: [string, Point, Point, Point][] = [
      ['chicago',     [ -87.6298,  41.8781], [661.532, 210.249], [642.751, 220.454]],
      ['los angeles', [-118.2437,  34.0522], [194.956, 326.178], [303.423, 304.765]],
      ['honolulu',    [-157.8583,  21.3069], [303.389, 511.123], [382.283, 439.271]],
      ['anchorage',   [-149.9003,  61.2181], [161.504, 504.766], [279.094, 434.648]],
      ['san juan',    [ -66.1057,  18.4655], [895.074, 541.966], [812.599, 461.703]],
      ['pago pago',   [-170.7020, -14.2756], [ 32.256, 401.299], [185.095, 359.399]],
      ['hagatna',     [ 144.7502,  13.4791], [ 31.028, 363.854], [184.203, 332.166]],
    ];

    it.each(data)(
      'should return the expected coords for default projection with all insets (%s)', (name, coords, point) => {
      const proj = projection(insetFips);

      expect(proj(coords)).pointToMatch(point);
      expect(proj.invert(point)).pointToMatch(coords);
    });

    // Slice out chicago and los angeles, then all the remainder should be null when projected
    // The inverts should be from the lower 48 (but will just test that they don't match the expected)
    it.each(data.slice(2))('should return null for points when their inset is absent (%s)', (name, coords, point) => {
      const proj = projection();

      expect(proj(coords)).toBeNull();
      expect(proj.invert(point)).not.pointToMatch(coords);
    });

    it.each(data)('should return translated coordinates when the projection is translated (%s)', (names, coords, point) => {
      const tx = 1024 / 2, ty = 576 / 2, 
        dx = 20, dy = -10, 
        proj = projection(insetFips).translate([tx + dx, ty + dy]);

      expect(proj(coords)).pointToMatch([point[0] + dx, point[1] + dy]);
      expect(proj.invert([point[0] + dx, point[1] + dy])).pointToMatch(coords);
    });

    it.each(data)('should return scaled coordinates when the projection is scaled (%s)', (name, coords, point, scaled) => {
      const proj = projection(insetFips).scale(800);

      expect(proj(coords)).pointToMatch(scaled);
      expect(proj.invert(scaled)).pointToMatch(coords);
    });
  });
});
