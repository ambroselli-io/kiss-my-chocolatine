import type { Feature, FeatureCollection, Point } from "geojson";

// Define your custom properties
interface CustomProperties {
  id: string;
  is_active_shop: number;
  is_included_by_filters: number;
  sort_key: number;
  has_review: boolean;
}

// Define a feature with your custom properties
type CustomFeature = Feature<Point, CustomProperties>;

// Define a feature collection of your custom features
type CustomFeatureCollection = FeatureCollection<Point, CustomProperties>;

// Export these types, so you can import them in the file where you are defining the loader
export type { CustomProperties, CustomFeature, CustomFeatureCollection };
