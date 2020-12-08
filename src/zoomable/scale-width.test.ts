import { select, Selection } from 'd3-selection';
import { scaleWidth } from './scale-width';
import { Zoomable, zoomable } from './zoomable';
import { Feature, feature, usMap } from '../map';

describe('scaleWidth() feature behavior', () => {
  let map: Zoomable;
  let testFeature: Feature;

  beforeEach(() => {
    map = zoomable(usMap());
    testFeature = feature();
  });

  it('should return a function that wraps the passed feature, with getter/setters returning the scalable when setting', () => {
    const scalable = scaleWidth(testFeature, map);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const accessor = () => {};
    
    expect(scalable.width(42)).toBe(scalable);
    expect(scalable.width()).toBe(42);
    expect(scalable.fill(accessor)).toBe(scalable);
    expect(scalable.fill()).toBe(accessor);
  });

  it('should throw on setup if the feature doesn\'t have a width method', () => {
    testFeature.width = undefined;
    
    expect(() => {
      scaleWidth(testFeature, map);
    }).toThrow(TypeError);
  });

  describe('when the passed map is a zoomable instance, the render function', () => {
    let svg: Selection<SVGSVGElement, any, any, any>;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      svg = select(document.body).append('svg');
      g = svg.append('g');
    });

    it('should call the feature renderer passed in and return the same selection as the original feature', () => {
      const scalable = scaleWidth(testFeature, map);
      const wrapper = scalable(g);
      
      expect(wrapper.node()).toBe(g.select('g').node());
      expect(+wrapper.attr('stroke-width')).toEqual(1);
    });

    it('should set the stroke width on the feature\'s container to the scaled stroke width on the initial render', () => {
      const g = map(svg);
      map.scaleTo(svg, 2);

      const scalable = scaleWidth(testFeature, map);
      const wrapper = scalable(g);

      expect(+wrapper.attr('stroke-width')).toEqual(0.5);
    });

    it('should linearly scale the stroke width on the feature\'s containing group when zoomed based on the curent zoomTransform', () => {
      const g = map(svg);
      const scalable = scaleWidth(testFeature, map);
      const wrapper = scalable(g);

      map.scaleTo(svg, 2);
      expect(+wrapper.attr('stroke-width')).toEqual(0.5);
      map.scaleTo(svg, 4);
      expect(+wrapper.attr('stroke-width')).toEqual(0.25);
    });
  });

  describe('when the passed map is not a zoomable instance, the render function', () => {
    let svg: Selection<SVGSVGElement, any, any, any>;

    beforeEach(() => {
      svg = select(document.body).append('svg');
    });

    it('should return the same selection as the original feature without error if the passed map isn\'t zoomable', () => {
      const nonZoomable = usMap();
      const scalable = scaleWidth(testFeature, nonZoomable as any);
      const g = nonZoomable(svg);
      const wrapper = scalable(g);

      expect(wrapper.node()).toBe(g.select('g').node());
    });  
  });
});
