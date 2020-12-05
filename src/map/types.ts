import { Selection, ArrayLike } from 'd3-selection';
import { GeoPermissibleObjects } from 'd3-geo';

export type AccessorFunction = (d?: any, i?: number, group?: ArrayLike<any>|any[]) => any;

export type GeoSelection<Element extends SVGElement, GeoDatum extends GeoPermissibleObjects>
  = Selection<Element, GeoDatum[], any, any>;

export interface Size {
  width: number|null;
  height: number|null;
}

export interface MinimalScale {
  (value: any): any;
  domain(): any[];
  domain(_): this;
}
