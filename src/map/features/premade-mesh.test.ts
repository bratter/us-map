import { Selection, select } from 'd3-selection';
import { Topology } from 'topojson-specification';
import { outlineMesh, nationMesh, stateMesh, countyMesh } from './premade-mesh';
import { PremadeFeature, UsAtlasObjects } from './types';

const topo: Topology<UsAtlasObjects> = {
  type: 'Topology',
  objects: {
    outlines: { type: 'GeometryCollection', geometries: [
      { type: 'LineString', arcs: [0] },
      { type: 'LineString', arcs: [0] },
    ] },
    nation: { type: 'GeometryCollection', geometries: [
      { type: 'LineString', arcs: [0] },
      { type: 'LineString', arcs: [0] },
    ] },
    states: { type: 'GeometryCollection', geometries: [
      { type: 'LineString', arcs: [0] },
      { type: 'LineString', arcs: [0] },
    ] },
    counties: { type: 'GeometryCollection', geometries: [
      { type: 'LineString', arcs: [0] },
      { type: 'LineString', arcs: [0] },
    ] },
  },
  arcs: [[[0, 1], [1, 2]]],
};

describe('premade mesh', () => {
  describe('outlineMesh factory function', () => {
    it('should throw an error if the passed topology does not contain an outlines object', () => {
      const topology: any  = { type: 'Topology', objects: {}, arcs: [] };
      expect(() => outlineMesh(topology)).toThrow(TypeError);
    });
  });

  // TODO: Test that the fipsLookupFn works for outline mesh's ids, maybe just as a test for the fips fn itself
  describe('outlineMesh() render function', () => {
    let f: PremadeFeature;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      f = outlineMesh(topo);
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create and return a non-duplicating wrapper group classed outlineMesh, and also make its parent classed outlineMeshMerge', () => {
      const wrap = f(g);

      expect(g.select('g.outlineMeshWrapper').node()).toBe(wrap.node());
      expect(g.select('g.outlineMeshWrapper').size()).toEqual(1);
      expect(g.select('g.outlineMeshMerge').size()).toEqual(1);
      expect(g.selectAll('g').size()).toEqual(2);
      expect(g.call(f).selectAll('g').size()).toEqual(2);
    });

    it('should create a single path element classed outlineMesh even when there are multiple features', () => {
      const path = g.call(f).selectAll('path.outlineMesh');

      expect(path.size()).toEqual(1);
    });

    it('should set accessors/attributes: width 0.5, fill none, stroke pale grey, pointer-events none', () => {
      const wrap = f(g);
      const path = wrap.select('path');

      // Stroke-width and pointer-events on the group, fill and stroke colors on the path
      expect(+wrap.attr('stroke-width')).toEqual(0.5);
      expect(wrap.attr('pointer-events')).toEqual('none');
      expect(path.attr('stroke')).toEqual('#777777');
      expect(path.attr('fill')).toEqual('none');
    });
  });

  describe('nationMesh factory function and render function', () => {
    let f: PremadeFeature;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      f = nationMesh(topo);
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should throw an error if the topology object does not include a nation object', () => {
      const topology: any  = { type: 'Topology', objects: {states: {}}, arcs: [] };
      expect(() => nationMesh(topology)).toThrow(TypeError);
    });

    it('should throw an error if the topology object does not include a states object', () => {
      const topology: any  = { type: 'Topology', objects: {nation: {}}, arcs: [] };
      expect(() => nationMesh(topology)).toThrow(TypeError);
    });

    it('should create a groups and set accessors/attributes: width 1, fill none, stroke dark grey, pointer events none', () => {
      const wrap = f(g);
      const path = wrap.select('path');

      // Stroke-width and pointer-events on the group, fill and stroke colors on the path
      expect(wrap.classed('nationMeshWrapper')).toBe(true);
      expect(+wrap.attr('stroke-width')).toEqual(1);
      expect(wrap.attr('pointer-events')).toEqual('none');
      expect(path.attr('stroke')).toEqual('#202020');
      expect(path.attr('fill')).toEqual('none');
    });
  });

  describe('stateMesh factory function and render function', () => {
    let f: PremadeFeature;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      f = stateMesh(topo);
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should throw an error if the topology object does not include a states object', () => {
      const topology: any  = { type: 'Topology', objects: {}, arcs: [] };
      expect(() => stateMesh(topology)).toThrow(TypeError);
    });

    it('should create a groups and set accessors/attributes: width 0.5, fill none, stroke dark grey, pointer events none', () => {
      const wrap = f(g);
      const path = wrap.select('path');

      // Stroke-width and pointer-events on the group, fill and stroke colors on the path
      expect(wrap.classed('stateMeshWrapper')).toBe(true);
      expect(+wrap.attr('stroke-width')).toEqual(0.5);
      expect(wrap.attr('pointer-events')).toEqual('none');
      expect(path.attr('stroke')).toEqual('#202020');
      expect(path.attr('fill')).toEqual('none');
    });
  });

  describe('countyMesh factory function and render function', () => {
    let f: PremadeFeature;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      f = countyMesh(topo);
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should throw an error if the topology object does not include a states object', () => {
      const topology: any  = { type: 'Topology', objects: {}, arcs: [] };
      expect(() => countyMesh(topology)).toThrow(TypeError);
    });

    it('should create a groups and set accessors/attributes: width 0.5, fill none, stroke mid grey, pointer events none', () => {
      const wrap = f(g);
      const path = wrap.select('path');

      // Stroke-width and pointer-events on the group, fill and stroke colors on the path
      expect(wrap.classed('countyMeshWrapper')).toBe(true);
      expect(+wrap.attr('stroke-width')).toEqual(0.5);
      expect(wrap.attr('pointer-events')).toEqual('none');
      expect(path.attr('stroke')).toEqual('#aaaaaa');
      expect(path.attr('fill')).toEqual('none');
    });
  });
});
