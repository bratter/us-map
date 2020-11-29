# d3ts US Map Tooling
Composable tooling for d3-based US maps. This repository builds on the custom Albers' projection in TopoJSON's [US Atlas](https://github.com/topojson/us-atlas) by providing a:

1. Flexible projection that can optionally include all US States and Insular Areas.
2. Set of composable tooling for adding advanced pan and zoom behaviors.
3. Quick method to bind data into the map features (at the Nation, State, or County level).

The API is documented in this readme, while live code examples are available in [this Observable notebook](https://observablehq.com/@bratter/us-map-examples).

*__Please note__ that the API is still under development and should be considered unstable while the major version is `< 1.0`. I am strongly considering removing TypeScript and changing the npm organization this is publisehd under.*


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

* [US Map](#us-map)
* [Zoomable](#zoomable)
* [Premade Features](#premade-features)
* [Features](#features)
* [Projection](#projection)


### US Map

Object that creates the main interface for US Maps.

<a href="#usmap" name="usmap">#</a> <b>usMap</b>(*scope*) [<>](https://github.com/bratter/us-map/blob/master/src/map/us-map.ts "Source")

Factory function that returns a configurable US-Map rendering function. The returned object is both a rendering function that produces a container for us map elements and an object containing several settings for the map.

It is called with a "scope" which is an array of strings indicating what insets will be built into the map's projection. See documentation for scopes in the [projection](#projection) section.

<a href="#_usmap" name="_usmap">#</a> <i>usMap</i>(<i>selection</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/map.ts "Source")

When passed a selection or a transition containing `<svg>` elements, builds a container into which usMap features can be rendered. The function appends or selects a `g.usMap` element that will be the host for adding features and providing zoom behavior as described later. The group can be grabbed as the return value or post-selected:

```javascript
const svg = d3.create('svg');
const map = usMap();

// These two are equivalent selections
const returnValue = map(svg);
const postSelect = svg.call(usMap).selectAll('g.usMap');
```

Features, or anything that should zoom or pan with the map should be added as a child of the returned group selection, while anything positioned statically should be added as a child of the svg selection. The map function will cascade any data bound to the input selection down to the output group for fruther use in features if desired. 

<a href="#usmap_projection" name="usmap_projection">#</a> <i>usMap</i>.<b>projection</b>() [<>](https://github.com/bratter/us-map/blob/master/src/map/map.ts "Source")

Retrieve the current custom projection from the `usMap` instance. This projection should be used to transform coordinates and GeoJSON objects into the map's domain. For instance, the projection can be:

* Passed to the [feature constructor](#_feature) to project a feature
* `projection.invert()` to transfom pointer coordinates to lat/lng pairs 

<a href="#usmap_scope" name="usmap_scope">#</a> <i>usMap</i>.<b>scope</b>() [<>](https://github.com/bratter/us-map/blob/master/src/map/map.ts "Source")

Retrieve the current scope array from the `usMap` instance. This will be a clone of the scope passed in through the constructor. Potentially useful for passing to [premade features](#premade-features).

<a href="#usmap_viewbox" name="usmap_viewbox">#</a> <i>usMap</i>.<b>viewBox</b>() [<>](https://github.com/bratter/us-map/blob/master/src/map/map.ts "Source")

Returns the bottom-right corner of the map's viewbox as `[x, y]`, asssuming the top-left is `[0, 0]`. This is independent of the size of the svg itself (see size below).

<a href="#usmap_size" name="usmap_size">#</a> <i>usMap</i>.<b>size</b>(<i>size</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/map.ts "Source")

When *size* is specified sets the current size by merging the passed object with the current size. The specified object has a `width` and a `height` member, both of which are optional. when provided the member will overwrite the current value. If *size* is not specified, returns a clone of the current *size*. The *size* will be set on the containing `<svg>` element.


### Zoomable

Mixin for the US Map object that add predefined pan and zoom functionality from [d3-zoom](https://github.com/d3/d3-zoom). It automatically manages attaching handlers to the appropriate elements and provides an option for zoom behavior to be synchronized across all svg elements in a selection.

The mixin inherits all members from [d3-zoom](https://github.com/d3/d3-zoom), so all settings available on the zoom object are available, except for the function call which is managed by the component.

<a href="#zoomable" name="zoomable">#</a> <b>zoomable</b>(<i>usMap</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/us-map.ts "Source")

Factory function to convert a *usMap* instance into a zoomable usMap. The returned object is an extension of the base *usMap* that mixes in all the members of *usMap* with additional members beow, and overrides the rendering function to set appropriate zoom event listeners. It is called with a *usMap* instance as follows:

```javascript
const map = usMap();
const zoomableMap = zoomable(map);

// The resulting object is the callable like the base map
d3.create('svg').call(zoomableMap);
```

<a href="#_zoomable" name="_zoomable">#</a> <i>zoomable</i>(<i>selection</i>) [<>](https://github.com/bratter/us-map/blob/master/src/zoomable/zoomable.ts "Source")

When passed a selection or a transition containing `<svg>` elements, builds the same container elements as the base [usMap](#_usmap). Additionally, the zoomable will add appropraite zoom event handlers to ensure correct zoom behavior and add a transparent underlay to avoid quirks with pointer events.

<a href="#zoomable_clear" name="zoomable_clear">#</a> <i>zoomable</i>.<b>clear</b>() [<>](https://github.com/bratter/us-map/blob/master/src/zoomable/zoomable.ts "Source")

Clears the zoomable behavior on the passed selection by removing the zoom event handlers and marking the map as unzoomed. The behavior can be re-added by passing the selection through the *zoomable* instance again. This method does not reset the zoom transform in case the user wishes to lock in the current transform, however a reset can be done manually before clearing if required. 

<a href="#zoomable_sync" name="zoomable_sync">#</a> <i>zoomable</i>.<b>sync</b>(<i>sync</i>) [<>](https://github.com/bratter/us-map/blob/master/src/zoomable/zoomable.ts "Source")

When *sync* is specified (as a boolean), sets the current sync setting. Defaults to `false`. If *sync* is not specified, will return the current sync setting. Sync settings work as follows:

* `true`: All elements in the selection have synchronized zoom transforms applied &ndash; zooming or panning one will automatically adjust the other elements in the selection.
* `false` (default): Each element in the selection is zoomed independently.


### Premade Features

The package provides functions to easily add a nation, state, and county features to the map instance. The premade features simplify several aspects of rendering features to the UsMap:

1. They use pre-projected TopoJSON available as part of the [US-Atlas package](https://github.com/bratter/us-atlas), so no overhead of projecting TopoJSON.
2. Features can be filtered based on a passed *scope* to ensure that only the appropriate entities are rendered.
3. Provides functions to create both *shapes* to get one path per state/county, and *meshes* to create a single path just with borders for non-interactive aestheic overlays (including a set of outlines for each inset). 
4. For shapes, data bound to the container is automatically merged with the GeoJSON feature and is therefore available for fill color or other uses.

To set up a feature, use the following:

```javascript
// Somewhere the topojson is loaded and parsed, then:
const scope = scopes.states();
const map = usMap(scope)
const feature = usMap.states(preProjectedTopoJSON, scope);
const svg = d3.create('svg');

// Here we use the return value from map(), but post selecting the g.usMap works also
map(svg).call(feature);
```

Data can be added to premade features in a number of ways. It can be pre-merged with the TopoJSON if rendering a single static layer. It can also be added through post-selection of the feature's paths. The preferred way, however, is to bind data to the parent `<svg>` element then cascade through using d3's joins. Data passed to premade features in this manner must be present as a `Map` that maps FIPS codes to an object containing data fields. As a simple example, to set the `answer` field on the CA GeoJSON `properties` key, you would do:

```javascript
// Keeping the scope and feature from the above
const data = new Map([['06', {answer: 42}]]);

map(svg.data([data])).call(feature);
```

Note that if (a) data is missing for a GeoJSON feature, the feature will be rendered but the additional properties will be `undefined`, and (b) data is provided for features that don't exist, it will be skipped.

A full example can be found in [this Observable notebook](https://observablehq.com/@bratter/us-map-examples).

Seven premade features are available. A *shape* feature for nation, states, and counties, and a *mesh* feature for nation, states, counties, and inset outlines. Except for state and county meshes, they all have the same call signature and inherit all methods from the base [feature](#feature).

<b>premadeFeature</b>(<i>topology</i>, <i>scope</i>)

The *topology* argument is required, and should be one of the pre-projected topologies from the [US-Atlas package](https://github.com/bratter/us-atlas). Use the file corresponding to the most granular feature in your visualization for nation, states, and coutnies. The outlines feature has its own standalone topology file.

The *scope* argument is optional and can be any array of FIPS codes, but recommend using the [scopes](#scopes) options. The lower 48 states will always be displayed, but AK, HI, and the insular areas will be rendered only if their FIPS code is present in the *scope* array.

The state and county meshes have other optional arguments described below.

<a href="#nation" name="nation">#</a> <b>nation</b>(<i>topology</i>, <i>scope</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-feature.ts "Source")

A premade nation feature. Renders a single closed path of the entire US, constrained by the optional *scope*.

<a href="#states" name="states">#</a> <b>states</b>(<i>topology</i>, <i>scope</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-feature.ts "Source")

A premade states feature. Renders one closed path for each state and insular area allowed by the optional *scope*.

<a href="#counties" name="counties">#</a> <b>counties</b>(<i>topology</i>, <i>scope</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-feature.ts "Source")

A premade nation feature. Renders ones closed path for each county within the states/insular area allowed by the optional *scope*.

<a href="#nationMesh" name="nationMesh">#</a> <b>nationMesh</b>(<i>topology</i>, <i>scope</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-mesh.ts "Source")

A premade nation outline. Renders a single path of the entire US, constrained by the optional *scope*. The nation mesh will be a closed path and can therefore be filled.

<a href="#stateMesh" name="stateMesh">#</a> <b>stateMesh</b>(<i>topology</i>, <i>scope</i>, <i>includeNation</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-mesh.ts "Source")

A premade states outline. Renders a single open path, constrained by the optional *scope*. The mesh is an open path, so cannot be filled.

The extra *includeNation* argument defaults to `false`, but should be set to `true` to also render the nation outline with the states. The default behavior only renders inner borders, which is usually desirable for overlays.

<a href="#countyMesh" name="countyMesh">#</a> <b>countyMesh</b>(<i>topology</i>, <i>scope</i>, <i>includeNation</i>, <i>includeStates</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-mesh.ts "Source")

A premade counties outline. Renders a single open path, constrained by the optional *scope*. The mesh is an open path, so cannot be filled.

The extra *includeNation* and *includeStates* arguments default to `false`, but should be set to `true` to also render the nation outline and states outlines respectively. The default behavior only renders inner borders that are not shared with either the containing state or the nation. The default behavior is often desirable for overlays.

<a href="#outlineMesh" name="outlineMesh">#</a> <b>outlineMesh</b>(<i>topology</i>, <i>scope</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/features/premade-mesh.ts "Source")

A premade mesh for outlining each inset area in the projection. Renders a single open path, constrained by the optional *scope*. The mesh is an open path, so cannot be filled. This requires the separate outlines topology.


### Features

UsMaps also supports features based on arbitrary GeoJSON. The feature API uses a d3 idiomatic data-driven approach &ndash; GeoJSON features should be merged with data being represented (if any) before being bound to the parent element that is then called with the *feature* renderer. This affords maximum flexibility in building data-driven maps.

<a href="#feature" name="feature">#</a> <b>feature</b>(<i>id</i>, <i>projection</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

Factory function for creating a feature for US Maps. This factory creates a render function that will render a collection of GeoJSON objects. The function is called with two arguments:

* *id*: A required string with the type/id of the feature to be rendered. Used in class names to ensure unique selection.
* *projection* (optional): If specified, uses the passed projection to render the GeoJSON objects. If not specified, assumes pre-projected GeoJSON. Generall you will want to pass the projection from the *usMap* instance to use the same projection.

<a href="#_feature" name="_feature">#</a> <i>feature</i>(<i>selection</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

When passed a selection or transition of svg `<g>` elements *with bound GeoJSON data* will render the GeoJSON features into the group(s). To use the *usMap* settings and faciliate zooming, the groups should be the returned groups from a call to `usMap(svg)`. The *feature* will generate multiple layers per map if a nested data structure is provided

The *datum* attached to each element in the selection must be a valid array of GeoJSON Features. The feature API can then use any part of the data to color the fill or stroke of the rendered paths based on data. In the GeoJSON spec, additional data beyond the id should be bound into a `properties` key on the GeoJSON. This data can be accessed with the *fill* and *stroke* accessors as described below.

<a href="#feature_id" name="feature_id">#</a> <i>feature</i>.<b>id</b>() [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

Return the id/type of the feature. Useful for selectors if you need to post-select the feature paths.

<a href="#feature_fill" name="feature_fill">#</a> <i>feature</i>.<b>fill</b>(<i>accessor</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

When *accessor* is specified, sets the feature's fill data accessor to the passed function. The accessor function receives the current datum (which will be the GeoJSON feature) and the index. If *accessor* is not specified, will return the current value, which defaults to a function that always returns `undefined`.

The result of calling this function with the passed datum will be provided to the fill color scale for evaluation.

<a href="#feature_fill_color" name="feature_fill_color">#</a> <i>feature</i>.<b>fillColor</b>(<i>scale</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

When *scale* is specified, sets the feature's fill scale to the provided value, which should be a *d3-scale* instance set up with a color range *or* an array of color strings. When a scale is passed it replaces the existing scale, when an array of colors is provided, it creates a new ordinal scale with the passed array as the range. If *scale* is not specified, returns the current fill color scale which defaults to a single light gray value in a `d3.scaleOrdinal` instance. This scale is modified in place, so it can be retrieved and modified if desired. When working with ordinal scales, watch out for implicit domain construction, which may not be the behavior you want. [See d3 docs for details](https://github.com/d3/d3-scale#ordinal-scales).

<a href="#feature_stroke" name="feature_stroke">#</a> <i>feature</i>.<b>stroke</b>(<i>accessor</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

When *accessor* is specified, sets the feature's stroke data accessor to the passed function. The accessor function receives the current datum (which will be the GeoJSON feature) and the index. If *accessor* is not specified, will return the current value, which defaults to a function that always returns `undefined`.

The result of calling this function with the passed datum will be provided to the stroke color scale for evaluation.

<a href="#feature_stroke_color" name="feature_stroke_color">#</a> <i>feature</i>.<b>strokeColor</b>(<i>scale</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

When *scale* is specified, sets the feature's stroke scale to the provided value, which should be a *d3-scale* instance set up with a color range *or* an array of color strings. When a scale is passed it replaces the existing scale, when an array of colors is provided, it creates a new ordinal scale with the passed array as the range. If *scale* is not specified, returns the current stroke color scale which defaults to white in a `d3.scaleOrdinal` instance. This scale is modified in place, so it can be retrieved and modified if desired. When working with ordinal scales, watch out for implicit domain construction, which may not be the behavior you want. [See d3 docs for details](https://github.com/d3/d3-scale#ordinal-scales).

<a href="#feature_width" name="feature_width">#</a> <i>feature</i>.<b>width</b>(<i>width</i>) [<>](https://github.com/bratter/us-map/blob/master/src/map/feature.ts "Source")

If *width* is specified as  anumber in px, set the stroke width to be applied to the feature. If *width* is not specified, returns the current stroke width.

Stroke width is applied to the group, not the individual path elements and is a fixed width. The scale stroke behavior can be used to adjust the strok width automatically when the map is zoomed.


### Projection

<a href="#usMapProjection" name="usMapProjection">#</a> <b>usMapProjection</b>(*scope*) [<>](https://github.com/bratter/us-map/blob/master/src/projection/projection.ts "Source")

Factory function that returns a non-standard customized Albers' projection.

By default, the projection places the lower-48 states centered in a 1024×576 (widescreen) viewport.

When called with no arguments, produces a projection that includes all states and insular areas, equivalent to passing the array below. This behavior can be customized by passing an array of two-digit strings as the *scope* argument. This array should contain a list of two-digit [FIPS State Codes](https://en.wikipedia.org/wiki/Federal_Information_Processing_Standard_state_code) *as strings*, or use the provided [scopes](#scopes) helper functions also exported from the package:

```javascript
const projectionWithArray = usMapProjection(['02', '15', '72', '78', '66', '69', '60']);
const projectionWithScopes = usMapProjection(scopes.all());
```

Depending on the elements included in the array, the resulting projection include insets as follows:
* `'02'`: Include an inset for Alaska using a conic equal area projection at the bottom left of the viewport. This inset is scaled to 0.35× its true relative area (as per [d3.**geoAlbersUsa**()](https://github.com/d3/d3-geo#geoAlbersUsa)).
* `'15'`: Include an inset for Hawaii using a conic equal area projection at the bottom of the viewport adjacent to Alaska.
* `'72'` and/or `'78'`: Include an inset for Puerto Rico and the US Virgin Islands using a conic equal area projection. Due to the clip extent of the provided inset, it is recommended to always render both PR and VI, although VI can be dropped with limited visual impact.
* `'66'` and/or `'69'`: Include an inset for Guam and the Northern Mariana Islands using an equirectangular projection. Due to the clip extent of the provided inset, it is recommended to always render both GU and MP.
* `'60'`: Include an inset for American Samoa using an equirectangular projection.

The size and positioning of the lower-48 states and each inset is designed to be independent of each other, look reasonable irrespective of the insets included, and provide room for addition of overlaid labels/controls.

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


#### Scopes

The package also exports a scopes constant that contains a number of helper methods to build common FIPS code strings to pass to both the projection and the usMap factory. Note that this only changes the insets rendered in the projection, it does not filter GeoJSON objects, and there is no way to remove the lower 48 states from the projection.

* *scopes*.**all**(): Includes all states and insular area insets.
* *scopes*.**states**(): Incudes the lower 48 states plus insets for AK and HI.
* *scopes*.**lower48**(): Includes only the main projection for the lower 48 states.
* *scopes*.**exclude**(*fipsArray*): Includes insets only for entities not explicitly excluded by the passed array.
* *scopes*.**include**(*fipsArray*): Includes insets only for entities specified in the passed array.


## Contributing

PRs and issues welcomed.

All production dependencies are peerDependencies, they are duplicated in devDependencies for testing.
