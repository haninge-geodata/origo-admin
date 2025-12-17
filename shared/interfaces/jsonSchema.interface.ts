import { JSONSchema7 } from "../../server/node_modules/@types/json-schema";

// Extended JSON Schema with our custom properties
export interface ExtendedJSONSchema extends JSONSchema7 {
  "x-ui"?: {
    component?:
      | "slider"
      | "textarea"
      | "key-value-pairs"
      | "radio-group"
      | "multi-select"
      | "searchable-select"
      | "extent-picker"
      | "fieldset"
      | "date"
      | "datetime"
      | "time"
      | "color"
      | "file"
      | "json-editor"
      | "key-value"
      | "style-picker"
      | "api-select";
    placeholder?: string;
    helperText?: string;
    readonly?: boolean;
    hide?: boolean;
    rows?: number;
    step?: number;
    marks?: boolean;
    addButtonText?: string;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    sections?: FormSection[] | Record<string, FormSection>;
    options?: Array<{ value: any; label: string }>;
    accept?: string;
    multiple?: boolean;
    layout?: {
      groupWith?: string[];
      priority?: number;
      inline?: boolean;
      width?: "auto" | "full" | "half" | "third" | "quarter";
      group?: string;
    };
  };
  "x-datasource"?: {
    type: "api" | "dependent";
    url?: string;
    valueField: string;
    labelField: string;
    cache?: boolean;
    dependsOn?: string;
  };
  "x-validation"?: {
    requiredIf?: {
      field: string;
      value: any;
    };
  };
  "x-table"?: {
    headerName?: string;
    visible?: boolean;
    hide?: boolean;
    readOnly?: boolean;
  };
  properties?: {
    [key: string]: ExtendedJSONSchema;
  };
  items?: ExtendedJSONSchema | ExtendedJSONSchema[];
  oneOf?: ExtendedJSONSchema[];
  anyOf?: ExtendedJSONSchema[];
  allOf?: ExtendedJSONSchema[];
  patternProperties?: {
    [pattern: string]: ExtendedJSONSchema;
  };
}

export interface FormSection {
  name?: string;
  title: string;
  description?: string;
  fields?: string[];
  order?: number;
  required?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface DataSourceConfig {
  type: "api" | "dependent";
  url?: string;
  valueField: string;
  labelField: string;
  cache?: boolean;
  allowCustom?: boolean;
  dependsOn?: string;
}

export interface DataSourceOption {
  value: any;
  label: string;
}

export interface SchemaFormProps {
  schema: ExtendedJSONSchema;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
}


