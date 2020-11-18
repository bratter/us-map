# d3ts-us-map
Composable tooling for d3-based US maps.

The current realse versio ncontains a custom projection with the ability to selectively include the non-contiguous states and territories of the US.

The goal is to add more festures to replicate those drafted in this [Observable notebook](https://observablehq.com/@bratter/us-map).

## Installing

You can install via NPM `npm install --save @d3ts/us-map` or Yarn `yarn add @d3ts/us-map`.

Alternatively, both UMD and ES6 module flavors are available when required, e.g. for loading directly in the browser. To load the latest UMD release from unpkg for example:

```html
<script src="https://unpkg.com/@d3ts/us-map"></script>
<script>
  const projection = d3ts.usMapProjection();
</script>
```

## API Reference

* [Projection](#projection)

### Projection

<a href="#usMapProjection" name="usMapProjection">#</a> <b>usMapProjection</b>(*stateIdList*) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Factory function that returns a non-standard customized Albers' projection.

By default, the projection places the lower-48 states centered in a 1024×576 (widescreen) viewport.

When called with no arguments, produces a projection that includes the lower 48-states only. This behavior can be customized by passing an array of two-digit strings as the *stateIdList* argument. This array should contain a list of two-digit [FIPS State Codes](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standard_state_code) *as strings* as follows:

```javascript
const projection = usMapProjection(['02', '15', '72', '78', '66', '69', '60']);
```

Depending on the elements included in the array, the base projection will be extended to include insets as follows:
* `'02'`: Include an inset for Alaska using a conic equal area projection at the bottom left of the viewport. This inset is scaled to 0.35× its true relative area (as per [d3.**geoAlbersUsa**()](https://github.com/d3/d3-geo#geoAlbersUsa)).
* `'15'`: Include an inset for Hawaii using a conic equal area projection at the bottom of the viewport adjacent to Alaska.
* `'72'` and/or `'78'`: Include an inset for Puerto Rico and the US Virgin Islands using a conic equal area projection. Due to the clip extent of the provided inset, it is recommended to always render both PR and VI, although VI can be dropped with limited visual impact.
* `'66'` and/or `'69'`: Include an inset for Guam and the Northern Mariana Islands using an equirectangular projection. Due to the clip extent of the provided inset, it is recommended to always render both GU and MP.
* `'60'`: Include an inset for American Samoa using an equirectangular projection.

The size and positioning of the lower-48 states and each inset is designed to be independent of each other, look reasonable irrespective of the insets  included, and provide room for addition of overlaid labels/controls.

The API methods below are largely taken from the [d3-geo](https://github.com/d3/d3-geo#readme "d3-geo") repository. Note that not all methods from d3-geo's projection function are available on this composite projection.

<a href="#_projection" name="_projection">#</a> <i>projection</i>(<i>point</i>) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Returns a new array \[*x*, *y*\] (typically in pixels) representing the projected point of the given *point*. The point must be specified as a two-element array \[*longitude*, *latitude*\] in degrees. May return null if the specified *point* has no defined projected position, such as when the point is outside the clipping bounds of the projection.

<a href="#projection_invert" name="projection_invert">#</a> <i>projection</i>.<b>invert</b>(<i>point</i>) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Returns a new array \[*longitude*, *latitude*\] in degrees representing the unprojected point of the given projected *point*. The point must be specified as a two-element array \[*x*, *y*\] (typically in pixels). May return null if the specified *point* has no defined projected position, such as when the point is outside the clipping bounds of the projection.

<a href="#projection_insets" name="projection_insets">#</a> <i>projection</i>.<b>insets</b>() [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Returns a copy of the array of inset objects used in generating the compound projection.

<a href="#projection_stream" name="projection_stream">#</a> <i>projection</i>.<b>stream</b>(<i>stream</i>) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Returns a [projection stream](#streams) for the specified output *stream*. Any input geometry is projected before being streamed to the output stream. A typical projection involves several geometry transformations: the input geometry is first converted to radians, rotated on three axes, clipped to the small circle or cut along the antimeridian, and lastly projected to the plane with adaptive resampling, scale and translation.

<a href="#projection_precision" name="projection_precision">#</a> <i>projection</i>.<b>precision</b>([<i>precision</i>]) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

If *precision* is specified, sets the threshold for the projection’s [adaptive resampling](https://bl.ocks.org/mbostock/3795544) to the specified value in pixels and returns the projection. This value corresponds to the [Douglas–Peucker](https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm) distance. If *precision* is not specified, returns the projection’s current resampling precision which defaults to √0.5 ≅ 0.70710…


<a href="#projection_scale" name="projection_scale">#</a> <i>projection</i>.<b>scale</b>([<i>scale</i>]) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

If *scale* is specified, sets the projection’s scale factor to the specified value and returns the projection. If *scale* is not specified, returns the current scale factor; which defaults to 1100 for this projection. The scale factor corresponds linearly to the distance between projected points.

<a href="#projection_translate" name="projection_translate">#</a> <i>projection</i>.<b>translate</b>([<i>translate</i>]) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

If *translate* is specified, sets the projection’s translation offset to the specified two-element array [<i>t<sub>x</sub></i>, <i>t<sub>y</sub></i>] and returns the projection. If *translate* is not specified, returns the current translation offset which defaults to [512, 288]. The translation offset determines the pixel coordinates of the projection’s center, which for this projection places the lower 48 states roughly in the center of a 1024×576 viewport.
