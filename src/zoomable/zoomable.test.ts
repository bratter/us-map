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

  it('should set defaults on `d3.zoom` members duration, ease, extent, and scaleExtent', () => {
    const defaults = {
      duration: 250,
      extent: [[0, 0], [1024, 576]],
      scaleExtent: [1, 10],
    };

    expect(zoom.duration()).toEqual(defaults.duration);
    expect(zoom.extent()(null, null, null)).toEqual(defaults.extent);
    expect(zoom.translateExtent()).toEqual(defaults.extent);
    expect(zoom.scaleExtent()).toEqual(defaults.scaleExtent);
  });

  it('should return the `g.usMap` element created by the underlying usMap', () => {
    const g = zoom(svg);
    expect(g.node().tagName).toEqual('g');
    expect(g.classed('usMap')).toEqual(true);
    expect(g.size()).toEqual(1);
  });
});
