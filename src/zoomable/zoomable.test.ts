import { Selection, select } from 'd3-selection';
import { usMap } from '../map';
import { zoomable, Zoomable } from './zoomable';

describe('The zoomable() mixin', () => {
  const map = usMap();
  let svg: Selection<SVGSVGElement, any, any, any>;
  let zoom: Zoomable;

  beforeEach(() => {
    zoom = zoomable(map);
    svg = select(document.body).append('svg');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should assign the elements from a UsMap instance to the zoomable', () => {
    expect(zoom.projection).toEqual(map.projection);
    expect(zoom.viewBox).toEqual(map.viewBox);
    expect(zoom.size).toEqual(map.size);
  });

  it('should have members derived from `d3.zoom` that return the zoomable, rather than the `d3.zoom` instance', () => {
    expect(typeof zoom.transform).toEqual('function');
    expect(typeof zoom.translateBy).toEqual('function');
    expect(typeof zoom.translateTo).toEqual('function');
    expect(typeof zoom.scaleBy).toEqual('function');
    expect(typeof zoom.scaleTo).toEqual('function');

    expect(zoom.constrain((() => 0) as any)).toBe(zoom);
    expect(zoom.filter((() => 0) as any)).toBe(zoom);
    // etc...
  });

  it('should set defaults on `d3.zoom` members duration, extent, and scaleExtent', () => {
    const defaults = {
      duration: 250,
      extent: [[0, 0], [1024, 576]],
      scaleExtent: [1, 10],
    };

    expect(zoom.duration()).toEqual(defaults.duration);
    expect((zoom.extent() as any)(null, null, null)).toEqual(defaults.extent);
    expect(zoom.translateExtent()).toEqual(defaults.extent);
    expect(zoom.scaleExtent()).toEqual(defaults.scaleExtent);
  });

  it('should return the `g.usMap` element created by the underlying usMap', () => {
    const g = zoom(svg);
    expect(g.node().tagName).toEqual('g');
    expect(g.classed('usMap')).toEqual(true);
    expect(g.size()).toEqual(1);
  });

  describe('adds zoom behavior to selections that', () => {
    it('should add the zoom behavior once to each item in the passed selection, calling it on zoom', () => {
      const sel: any = select(document.body)
        .selectAll('svg')
        .data([null, null])
        .join('svg');
      sel.call(zoom).call(zoom);

      expect.assertions(2);
      zoom.on('zoom.test', function (event) {
        expect(event.type).toEqual('zoom');
      });
      zoom.translateBy(sel, 1, 1);
    });

    it('should be cleared and re-added by calling clear (which returns undefined) followed by calling zoom again', () => {
      const sel: any = select(document.body)
        .selectAll('svg')
        .data([null, null])
        .join('svg')
        .call(zoom);

      expect.assertions(15);

      // 6 assertions
      for (const n of sel.nodes()) 
        for (const e of n.__on)
          expect(e.name).toEqual('zoom');
      
      // 1 assertion
      expect(zoom.clear(sel)).toBeUndefined();

      // 2 assertions
      for (const n of sel.nodes()) 
        expect(n.__on).toBeUndefined();

      sel.call(zoom);

      // 6 assertions
      for (const n of sel.nodes()) 
        for (const e of n.__on)
          expect(e.name).toEqual('zoom');
    });

    it('should only clear from the selection passed to clear', () => {
      const sel: any = select(document.body)
        .selectAll('svg')
        .data([null, null])
        .join('svg')
        .call(zoom);
      const [n1, n2]: any[] = sel.nodes();
      
      zoom.clear(select(n2));
      expect(n1.__on).toHaveLength(3);
      expect(n2.__on).toBeUndefined();
    });

    it('should idempotently add a rectangular underlay as the first child of the svg to manage mouse events', () => {
      svg.append('g')
      // Clearing is requied to fail the idempotence test if the rect is appended not joined
      svg.call(zoom).call(zoom.clear).call(zoom);
      const underlay = svg.selectAll(`rect.usMapPointerUnderlay`);

      expect(underlay.size()).toEqual(1);
      expect(+underlay.attr('width')).toEqual(1024);
      expect(+underlay.attr('height')).toEqual(576);
      expect(underlay.attr('fill')).toEqual('none');
      expect(underlay.attr('pointer-events')).toEqual('visible');
      expect(svg.node().firstChild).toBe(underlay.node());
    });
  });
  
  describe('can zoom in a synchoronized or unsynchronized manner', () => {
    it('should have a sync standard getter/setter that defaults to false', () => {
      expect(zoom.sync()).toEqual(false);
      expect(zoom.sync(true)).toEqual(zoom);
      expect(zoom.sync()).toEqual(true);
    });

    it('should set the transform only on the triggered element when in unsynced mode', () => {
      const sel: any = select(document.body)
        .selectAll('svg')
        .data([null, null])
        .join('svg')
        .call(zoom.sync(false));
      
      zoom.translateBy(select(sel.nodes()[0]), 1, 1);

      const [g1Transform, g2Transform]: any[] = sel.selectAll('g').nodes().map(n => select(n).attr('transform'));
      expect(g1Transform).toMatch(/translate.*scale/);
      expect(g2Transform).toBeNull();
    });
  });

    it('should set the transform on all elements in the selection when in sync mode', () => {
      // The mapGroup closure is necessary to define what will be syned
      // The each is required to update the transforms on all elements such that they don't jerk

      const sel: any = select(document.body)
        .selectAll('svg')
        .data([null, null])
        .join('svg')
        .call(zoom.sync(true));
      
      zoom.translateBy(select(sel.nodes()[0]), 1, 1);

      const [g1Transform, g2Transform]: any[] = sel.selectAll('g').nodes().map(n => select(n).attr('transform'));
      expect(g1Transform).toMatch(/translate.*scale/);
      expect(g2Transform).toMatch(/translate.*scale/);
    });
});
