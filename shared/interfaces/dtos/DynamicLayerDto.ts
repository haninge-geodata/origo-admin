import { LinkResourceDto, StyleSchemaDto, KeyValuePair } from ".";

/**
 * Generic DTO for any dynamic, JSON Schema-driven layer type.
 * Required: name (unique), title (display), type (discriminator: e.g. GEOJSON, GPX, etc).
 * All other properties are optional, top-level, and type-dependent per schema.
 * id is optional, set by backend on stored layers.
 */
export interface DynamicLayerDto {
  // Required fields across ALL layer types
  id?: string;
  name: string;
  title: string;
  type: string;

  // Common optional fields that MIGHT be used (but aren't required for all types)
  source?: LinkResourceDto | any;
  style?: StyleSchemaDto | any;
  layer_id?: string;
  abstract?: string;
  extendedAttributes?: KeyValuePair[];

  // Allows additional properties for dynamic layer attributes
  [key: string]: any;
}
