declare module '@tmcw/togeojson' {
  import { FeatureCollection, Geometry, Properties } from '@turf/helpers';

  export function kml(doc: Document): FeatureCollection;

  export function kml<TProperties extends Properties>(
    doc: Document,
  ): FeatureCollection<Geometry, TProperties>;

  // export function* kmlGen(doc: Document): Generator<Feature, void, boolean>;
  // export function* kmlGen<TProperties extends Properties>(
  //   doc: Document,
  // ): Generator<Feature<Geometry, TProperties>, void, boolean>;

  export function gpx(doc: Document): FeatureCollection;
  export function gpx<TProperties extends Geometry | null>(
    doc: Document,
  ): FeatureCollection<TProperties>;

  // export function* gpxGen(doc: Document): Generator<Feature, void, boolean>;
  // export function* gpxGen<TProperties extends Properties>(
  //   doc: Document,
  // ): Generator<Feature<Geometry, TProperties>, void, boolean>;

  export function tcx(doc: Document): FeatureCollection;
  export function tcx<TProperties extends Properties>(
    doc: Document,
  ): FeatureCollection<Geometry, Properties>;
}
