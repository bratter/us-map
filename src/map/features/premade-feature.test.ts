import { Selection, select } from 'd3-selection';
import { nation } from './premade-feature';
import { Topology } from 'topojson-specification';
import { PremadeFeature, UsAtlasObjects } from './types';
import { mergeTopoProps } from '../../util';

const topo: Topology<UsAtlasObjects> = {
  type: 'Topology',
  objects: { nation: { type: 'GeometryCollection' , geometries: [
    { type: 'LineString', id: 'US', properties: { name: 'USA' }, arcs: [0] },
  ] } },
  arcs: [[[0, 1]]],
};

describe('premade feature', () => {
  describe('nation() factory function', () => {
    it('should throw a type error if the passed topology does not contain a nations object', () => {
      const topology: any = { type: 'Topology', objects: {}, arcs: [] };
      expect(() => nation(topology)).toThrow(TypeError);
    });
  });

  describe('nation() render function', () => {
    let n: PremadeFeature;
    let g: Selection<SVGGElement, any, any, any>;

    beforeEach(() => {
      n = nation(topo);
      g = select(document.body).append('svg').append('g');
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should create and return a non-duplicating wrapper group classed nationWrapper, and also make its parent classed nationMerge.', () => {
      const wrap = n(g);

      expect(g.select('g.nationWrapper').node()).toBe(wrap.node());
      expect(g.select('g.nationWrapper').size()).toEqual(1);
      expect(g.select('g.nationMerge').size()).toEqual(1);
      expect(g.selectAll('g').size()).toEqual(2);
      expect(g.call(n).selectAll('g').size()).toEqual(2);
    });

    it('should create a single path element classed nation, and have a datum id of US', () => {
      const path = g.call(n).selectAll('path.nation');

      expect(path.size()).toEqual(1);
      expect((<any>path.datum()).id).toEqual('US');
    });

    it('should retain data on the properties key that is merged before being passed', () => {
      const newTopo = mergeTopoProps<UsAtlasObjects<{ test: string }>>(topo, 'nation', new Map([['US', { test: 'test' }]]));
      const n = nation(newTopo);
      const path = g.call(n).selectAll('path.nation');

      expect(path.size()).toEqual(1);
      expect((<any>path.datum()).properties).toEqual({ name: 'USA', test: 'test' });
    });

    // To work, the data bound to the selection for this and the next test should be arrays of Maps
    it('should merge data bound to the passed selection into the geojson\'s properties based on the id, but leave the passed selection unchanged', () => {
      const newTopo = mergeTopoProps<UsAtlasObjects>(topo, 'nation', new Map([['US', { test: 'test' }]]));
      const data = new Map([['US', { data: 42, test: 'overwrite' }]]);
      const path = g.datum(data).call(nation(newTopo)).selectAll('path');

      expect(path.size()).toEqual(1);
      expect(g.datum()).toEqual(data);
      expect((<any>path.datum()).properties).toEqual({ name: 'USA', test: 'overwrite', data: 42 });
    });

    it('should create multiple paths to match the incoming selection, merging data individually based on the id', () => {
      const data = [
        new Map([['US', { data: 42 }]]),
        new Map([['US', { data: 21 }]]),
      ];
      const parents = g.selectAll<SVGGElement, any>('g.parent').data(data).join('g').classed('parent', true);
      const wrappers = n(parents);

      expect(parents.size()).toEqual(2);
      expect(wrappers.size()).toEqual(2);
    });
  });
});
