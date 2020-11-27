import { Selection, select } from 'd3-selection';
import { usMap } from './us-map';
import { usMapProjection } from '../projection';

describe('usMap', () => {
  let map = usMap();

  beforeEach(() => {
    map = usMap();
  });

  describe('usMap() factory function', () => {
    it('should return a function', () => {
      expect(typeof usMap()).toEqual('function');
    });

    it('should build a projection that has all five insets by default', () => {
      expect(usMap().projection().insets()).toHaveLength(5);
    });

    it('should filter the insets based on the passed scope', () => {
      expect(usMap(['02', '15']).projection().insets().map(d => d.id)).toEqual(['02', '15']);
    });
  });

  describe('usMap() inner function', () => {
    let svg: Selection<SVGSVGElement, any, any, any>;

    beforeEach(() => {
      svg = select(document.body).append('svg');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create and return a child `g.usMap` element that is only added on enter', () => {
      const first = map(svg);
      expect(first.node().tagName).toEqual('g');
      expect(first.size()).toEqual(1);
      expect(first.classed('usMap')).toBe(true);
      map(svg);
      expect(svg.selectAll('g').size()).toEqual(1);
    });

    it('should set the class and viewBox on the passed svg, but not set width and height by default', () => {
      svg.call(map);
      expect(svg.attr('viewBox')).toEqual('0,0,1024,576');
      expect(svg.classed('usMap')).toBe(true);
      expect(svg.attr('width')).toBeNull();
      expect(svg.attr('height')).toBeNull();
    });

    it('should upate the width and height when set with size', () => {
      map.size({ width: 200, height: 100 })(svg);
      expect(+svg.attr('width')).toEqual(200);
      expect(+svg.attr('height')).toEqual(100);
    });
  });

  describe('projection() method', () => {
    it('should return a usMapProjection', () => {
      expect(map.projection()([ -87.6298,  41.8781])).toEqual(usMapProjection()([ -87.6298,  41.8781]));
    });
  });

  describe('viewBox() method', () => {
    it('should return an array containing [1024, 576]', () => {
      expect(map.viewBox()).toEqual([1024, 576]);
    });
  });
  
  describe('size() method', () => {
    it('should return { width: null, height: null } by default', () => {
      expect(map.size()).toEqual({ width: null, height: null});
    });

    it('should replace width and/or height when passed and return the usMap object', () => {
      expect(map.size({ width: 1 })).toBe(map);
      expect(map.size()).toEqual({ width: 1, height: null});
      expect(map.size({ height: 2 }).size()).toEqual({ width: 1, height: 2});
    });

    it('should not modify a returned object', () => {
      const returned = map.size();
      const passed = { width: 1, height: 2 };

      map.size(passed);
      expect(returned).toEqual({ width: null, height: null });
      expect(map.size()).not.toBe(passed);
    });
  });
});
