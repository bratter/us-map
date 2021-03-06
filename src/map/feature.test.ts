import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Selection, select } from 'd3-selection';
import { scaleQuantile, scaleOrdinal } from 'd3-scale';
import { geoPath } from 'd3-geo';
import { feature, Feature } from './feature';
import { usMapProjection } from '../projection';

// Load the outlines converted to GeoJSON as some simple data to test
const outlines = JSON.parse(readFileSync(resolve(__dirname, '..', '..', 'test', 'outlines.json')).toString('utf-8')).features;

describe('feature', () => {
  let f: Feature;

  beforeEach(() => {
    f = feature();
  });

  describe('feature() factory function', () => {
    it('should return a function', () => {
      expect(typeof feature()).toEqual('function');
    });
  });

  describe('feature() render function', () => {
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create and return a (non-duplicating) wrapper group that sets linejoin, poiner-events, and stroke-width', () => {
      const wrap = f(g);
      
      expect(g.select('g').node()).toBe(wrap.node());
      expect(+wrap.attr('stroke-width')).toEqual(1);
      expect(wrap.attr('stroke-linejoin')).toEqual('round');
      expect(wrap.attr('pointer-events')).toEqual('visible');

      // Check not duplicating
      expect(g.call(f).selectAll('g').size()).toEqual(1);
    });

    it('should set a class of featureWrapper on the group by default, but use the passed type if one provided', () => {
      const wrap = g.call(f).select('g');
      expect(wrap.classed('featureWrapper')).toEqual(true);
      expect(wrap.classed('stateWrapper')).toEqual(false);

      expect(g.call(feature('state')).select('g.stateWrapper').size()).toEqual(1);
    });

    it('should create a path classed with the type for each element in the data array that does not duplicate', () => {
      const paths = f(g.datum(outlines)).selectAll('path.feature');
      expect(paths.size()).toEqual(5);
      expect(g.selectAll('path').size()).toEqual(5);

      expect(f(g).selectAll('path').size()).toEqual(5);
    });

    it('should set the path d attr with no transform when no projection is passed to the feature', () => {
      const data = outlines[0];
      const dAttr = g.datum([data]).call(f).select('path.feature').attr('d');
      expect(dAttr).toEqual(geoPath()(data));
    });

    // eslint-disable-next-line jest/expect-expect
    it('should set the path d attr to a projected path when a projection is passed to the feature constructor', () => {
      const proj = usMapProjection();
      const f = feature(undefined, proj);

      const data = outlines[0];
      const dAttr = g.datum([data]).call(f).select('path.feature').attr('d');

      expect(dAttr).toEqual(geoPath(proj)(data));
    });

    it('should set the stroke and fill on the path to enable coloring', () => {
      const data = outlines.slice(0, 2);
      const range = ['#000000', '#ffffff']
      const scale = scaleOrdinal(range);
      // Set the fill and stroke accessors to id to get implicit domain construction on the scale
      f
        .fill(d => d.id)
        .stroke(d => d.id)
        .fillColor(scale)
        .strokeColor(scale);
      const path = g.datum<any>(data).call(f).selectAll('path');

      expect.assertions(4);
      path.each(function (d, i) {
        expect(select(this).attr('fill')).toEqual(range[i]);
        expect(select(this).attr('stroke')).toEqual(range[i]);
      });
    });

    it('should pass through d, i, and nodes arguments to the fill and stroke callbacks', () => {
      const fillCallback = jest.fn().mockReturnValue('a');
      const strokeCallback = jest.fn().mockReturnValue('b');
      const f = feature()
        .fill(fillCallback)
        .stroke(strokeCallback);
      const data = ['a', 'b'];

      const pathNodes = g.datum<any>(data).call(f).selectAll('path').nodes();

      expect(fillCallback).toHaveBeenCalledTimes(2);
      expect(fillCallback).toHaveBeenNthCalledWith(1, 'a', 0, pathNodes);
      expect(strokeCallback).toHaveBeenCalledTimes(2);
      expect(strokeCallback).toHaveBeenNthCalledWith(2, 'b', 1, pathNodes);
    });

    it('should make `this` available as the current node in fill and stroke callbacks', () => {
      let fillThis, strokeThis;
      const fillCallback = function () { fillThis = this; };
      const strokeCallback = function () { strokeThis = this; };
      const f = feature()
        .fill(fillCallback)
        .stroke(strokeCallback);

      const pathNode = g.datum([outlines[0]]).call(f).selectAll('path').node();

      expect(fillThis).toBe(pathNode);
      expect(strokeThis).toBe(pathNode);
    });

    it('should create multiple wrappers and elements if multiple data is passed', () => {
      const data = [outlines, outlines];
      const parents = g.selectAll<SVGGElement, any>('g.parent').data(data).join('g').classed('parent', true);
      const wrappers = f(parents);

      expect(wrappers.size()).toEqual(2);
      expect(wrappers.selectAll('path.feature').size()).toEqual(10);
    });
  });

  describe('id() method', () => {
    it('should return feature by default', () => {
      expect(f.id()).toEqual('feature');
    });

    it('should return the value passed in the factory function', () => {
      expect(feature('test').id()).toEqual('test');
    });
  });

  describe('fill() method', () => {
    it('should return a function that returns undefined by default', () => {
      expect(f.fill()({ id: 1 })).toBeUndefined();
    });

    it('should set the fill accessor to the passed function and return this', () => {
      const fn = d => d;
      expect(f.fill(fn)).toBe(f);
      expect(f.fill()).toBe(fn);
    });
  });

  describe('fillColor() method', () => {
    it('should return a scale with a single element grey range', () => {
      expect(f.fillColor().range()).toEqual(['#e5e5e5']);
    });

    it('should set the scale to the passed scale and return this', () => {
      const scale = scaleQuantile();
      expect(f.fillColor(scale)).toBe(f);
      expect(f.fillColor()).toBe(scale);
    });

    it('should set the scale to the passed array (cloning it) if provided as an array', () => {
      const scale = ['#000000'];
      expect(f.fillColor(scale)).toBe(f);
      expect(f.fillColor().range()).not.toBe(scale);
      expect(f.fillColor().range()).toEqual(scale);
    });
  });

  describe('stroke() method', () => {
    it('should return a function that accesses the id by default', () => {
      expect(f.stroke()({ id: 1 })).toBeUndefined();
    });

    it('should set the fill accessor to the passed function and return this', () => {
      const fn = d => d;
      expect(f.stroke(fn)).toBe(f);
      expect(f.stroke()).toBe(fn);
    });
  });

  describe('strokeColor() method', () => {
    it('should return a scale with a single element white range', () => {
      expect(f.strokeColor().range()).toEqual(['#ffffff']);
    });

    it('should set the scale to the passed scale and return this', () => {
      const scale = scaleQuantile();
      expect(f.strokeColor(scale)).toBe(f);
      expect(f.strokeColor()).toBe(scale);
    });

    it('should set the scale to the passed array (cloning it) if provided as an array', () => {
      const scale = ['#000000'];
      expect(f.strokeColor(scale)).toBe(f);
      expect(f.strokeColor().range()).not.toBe(scale);
      expect(f.strokeColor().range()).toEqual(scale);
    });
  });

  describe('width() method', () => {
    it('should return a width of 1 by default', () => {
      expect(f.width()).toEqual(1);
    });

    it('should set the width to the passed number and return this', () => {
      expect(f.width(2)).toBe(f);
      expect(f.width()).toEqual(2);
    });
  });
});
