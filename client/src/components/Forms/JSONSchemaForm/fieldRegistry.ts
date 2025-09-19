import React from "react";
import {
  TextField,
  Switch,
  Slider,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";
import { ExtendedJSONSchema } from "@/types/jsonSchema";
import JSONEditor from "@/components/Editors/JSONEditor";
import KeyValuePairEditor from "@/components/Editors/KeyValuePairEditor";
import StylePicker from "@/components/AutoComplete/StylePicker";
import ApiSelect from "./components/ApiSelect";

// Helper to create enhanced text field with help tooltip integration
const createEnhancedTextField = (type: string = "text") => ({
  component: TextField,
  transformProps: (props: any, schema: ExtendedJSONSchema) => {
    const hasHelp =
      schema.description ||
      schema.examples ||
      schema.pattern ||
      schema.minimum !== undefined ||
      schema.maximum !== undefined ||
      schema.minLength !== undefined ||
      schema.maxLength !== undefined;

    const isReadonly = schema["x-ui"]?.readonly || schema.const !== undefined;

    return {
      type,
      value: props.value ?? "",
      onChange: (e: any) => props.onChange(e.target.value),
      onBlur: props.onBlur,
      disabled: props.disabled || isReadonly,
      fullWidth: true,
      margin: "normal",
      error: !!props.error,
      helperText:
        props.helperText ||
        (hasHelp ? "Click the help icon for more info" : "") ||
        (isReadonly ? "This field is read-only" : ""),
      InputLabelProps:
        type.includes("date") || type.includes("time") ? { shrink: true } : {},
      InputProps: isReadonly ? { readOnly: true } : {},
      ...(type === "number" && {
        inputProps: {
          min: schema.minimum,
          max: schema.maximum,
          step: schema.type === "integer" ? 1 : "any",
        },
      }),
    };
  },
});

export type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "enum"
  | "slider"
  | "textarea"
  | "array-text"
  | "password"
  | "email"
  | "url"
  | "date"
  | "datetime"
  | "time"
  | "color"
  | "file"
  | "multi-select"
  | "json-editor"
  | "key-value"
  | "style-picker"
  | "api-select";

export interface FieldConfig {
  component: React.ComponentType<any>;
  wrapper?: React.ComponentType<any>;
  transformProps?: (props: any, schema: ExtendedJSONSchema) => any;
}

export const FIELD_REGISTRY: Record<FieldType, FieldConfig> = {
  text: createEnhancedTextField("text"),
  number: createEnhancedTextField("number"),
  email: createEnhancedTextField("email"),
  url: createEnhancedTextField("url"),
  password: createEnhancedTextField("password"),

  textarea: {
    component: TextField,
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      multiline: true,
      rows: schema["x-ui"]?.rows || 4,
      value: props.value ?? "",
      onChange: (e: any) => props.onChange(e.target.value),
      onBlur: props.onBlur,
      disabled: props.disabled,
      fullWidth: true,
      margin: "normal",
      error: !!props.error,
      helperText: props.helperText || schema.description || "",
    }),
  },

  boolean: {
    component: Switch,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        Box,
        { sx: { mt: 2, mb: 1 } },
        [
          React.createElement(FormControlLabel, {
            key: "control",
            control: children,
            label: fieldMeta.title,
          }),
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any) => ({
      checked: props.value ?? false,
      onChange: props.onChange,
      onBlur: props.onBlur,
      disabled: props.disabled,
    }),
  },

  enum: {
    component: Select,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        FormControl,
        { fullWidth: true, margin: "normal", error: commonProps.error },
        [
          React.createElement(InputLabel, { key: "label" }, fieldMeta.title),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      value: props.value ?? "",
      onChange: props.onChange,
      onBlur: props.onBlur,
      label: schema.title,
      disabled: props.disabled,
    }),
  },

  slider: {
    component: Slider,
    wrapper: ({ children, fieldMeta, commonProps, schema }: any) =>
      React.createElement(
        Box,
        { sx: { mt: 2, mb: 1 } },
        [
          React.createElement(
            Typography,
            { key: "title", gutterBottom: true },
            fieldMeta.title
          ),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => {
      // Get min/max from schema or use defaults
      const min = (schema.minimum as number) ?? 0;
      const max = (schema.maximum as number) ?? 1;
      const step =
        schema["x-ui"]?.step ?? (schema.type === "integer" ? 1 : 0.1);
      const marks = schema["x-ui"]?.marks ?? false;

      return {
        value: props.value ?? min, // Use minimum as default, not 0
        min: min,
        max: max,
        step: step,
        marks: marks,
        valueLabelDisplay: "auto",
        onChange: (_, newValue) => props.onChange(newValue),
        onBlur: props.onBlur,
        disabled: props.disabled,
      };
    },
  },

  date: createEnhancedTextField("date"),
  datetime: createEnhancedTextField("datetime-local"),
  time: createEnhancedTextField("time"),

  color: {
    component: TextField,
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      type: "color",
      value: props.value ?? "#000000",
      onChange: (e: any) => props.onChange(e.target.value),
      onBlur: props.onBlur,
      disabled: props.disabled,
      fullWidth: true,
      margin: "normal",
      error: !!props.error,
      helperText: props.helperText || schema.description || "Choose a color",
      sx: { "& input": { height: "56px", padding: "8px" } },
    }),
  },

  file: {
    component: TextField,
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      type: "file",
      onChange: (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          props.onChange({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            file: file, // Store file object for potential upload
          });
        } else {
          props.onChange(null);
        }
      },
      onBlur: props.onBlur,
      disabled: props.disabled,
      fullWidth: true,
      margin: "normal",
      error: !!props.error,
      helperText:
        props.helperText ||
        (props.value
          ? `Selected: ${props.value.name} (${Math.round(
              props.value.size / 1024
            )}KB)`
          : schema.description || "No file selected"),
      InputLabelProps: { shrink: true },
      inputProps: {
        accept: schema["x-ui"]?.accept || "*/*",
        multiple: schema["x-ui"]?.multiple || false,
      },
    }),
  },

  "multi-select": {
    component: Select,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        FormControl,
        { fullWidth: true, margin: "normal", error: commonProps.error },
        [
          React.createElement(InputLabel, { key: "label" }, fieldMeta.title),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      multiple: true,
      value: Array.isArray(props.value) ? props.value : [],
      onChange: (e: any) => props.onChange(e.target.value),
      onBlur: props.onBlur,
      label: schema.title,
      disabled: props.disabled,
      renderValue: (selected: string[]) => selected.join(", "),
    }),
  },

  "json-editor": {
    component: JSONEditor,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        Box,
        { sx: { mt: 2, mb: 1 } },
        [
          React.createElement(
            Typography,
            { key: "title", variant: "subtitle1", gutterBottom: true },
            fieldMeta.title
          ),
          fieldMeta.description &&
            React.createElement(
              Typography,
              {
                key: "description",
                variant: "body2",
                color: "text.secondary",
                sx: { mb: 1 },
              },
              fieldMeta.description
            ),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
                sx: { mt: 1 },
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      value: props.value || {},
      onChange: props.onChange,
      onBlur: props.onBlur,
      disabled: props.disabled,
    }),
  },

  "key-value": {
    component: KeyValuePairEditor,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        Box,
        { sx: { mt: 2, mb: 1 } },
        [
          React.createElement(
            Typography,
            { key: "title", variant: "subtitle1", gutterBottom: true },
            fieldMeta.title
          ),
          fieldMeta.description &&
            React.createElement(
              Typography,
              {
                key: "description",
                variant: "body2",
                color: "text.secondary",
                sx: { mb: 1 },
              },
              fieldMeta.description
            ),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
                sx: { mt: 1 },
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => {
      // Convert object to key-value pairs
      const objectValue = props.value || {};
      const keyValuePairs = Object.entries(objectValue).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      return {
        value: keyValuePairs,
        onChange: (newPairs: { key: string; value: string }[]) => {
          // Convert key-value pairs back to object
          const newObject = newPairs.reduce((obj, pair) => {
            obj[pair.key] = pair.value;
            return obj;
          }, {} as Record<string, string>);
          props.onChange(newObject);
        },
        onBlur: props.onBlur,
        disabled: props.disabled,
      };
    },
  },

  "style-picker": {
    component: StylePicker,
    wrapper: ({ children, fieldMeta, commonProps }: any) =>
      React.createElement(
        Box,
        { sx: { mt: 2, mb: 1 } },
        [
          React.createElement(
            Typography,
            { key: "title", variant: "subtitle1", gutterBottom: true },
            fieldMeta.title
          ),
          fieldMeta.description &&
            React.createElement(
              Typography,
              {
                key: "description",
                variant: "body2",
                color: "text.secondary",
                sx: { mb: 1 },
              },
              fieldMeta.description
            ),
          children,
          commonProps.helperText &&
            React.createElement(
              Typography,
              {
                key: "helper",
                variant: "caption",
                display: "block",
                color: commonProps.error ? "error" : "text.secondary",
                sx: { mt: 1 },
              },
              commonProps.helperText
            ),
        ].filter(Boolean)
      ),
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      value: props.value || {
        id: "default",
        name: "Välj stilschema för lagret",
      },
      onChange: props.onChange,
      onBlur: props.onBlur,
      disabled: props.disabled,
      error: !!props.error,
      helperText: props.helperText,
    }),
  },

  "api-select": {
    component: ApiSelect,
    transformProps: (props: any, schema: ExtendedJSONSchema) => ({
      value: props.value,
      onChange: props.onChange,
      onBlur: props.onBlur,
      disabled: props.disabled,
      error: !!props.error,
      helperText:
        props.error || schema.description || schema["x-ui"]?.helperText,
      schema: schema,
      label: props.label, // Will be set by Field.tsx
      placeholder: schema["x-ui"]?.placeholder,
    }),
  },

  "array-text": {
    component: TextField,
    transformProps: (props: any, schema: ExtendedJSONSchema) => {
      const getDisplayValue = (value: any) => {
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        if (typeof value === "string") {
          return value;
        }
        return "";
      };

      const itemType =
        schema.items && typeof schema.items === "object"
          ? schema.items.type
          : "string";

      return {
        type: "text",
        value: getDisplayValue(props.value),
        onChange: (e: any) => {
          props.onChange(e.target.value);
        },
        onBlur: (e: any) => {
          const value = e.target.value.trim();
          if (value === "") {
            props.onChange(null);
          } else {
            const items = value.split(",").map((s: string) => s.trim());

            if (itemType === "number") {
              const numbers = items.map((s) => parseFloat(s));
              if (numbers.every((n) => !isNaN(n))) {
                props.onChange(numbers);
                return;
              }
            } else if (itemType === "boolean") {
              const booleans = items.map((s) => s.toLowerCase() === "true");
              props.onChange(booleans);
              return;
            } else {
              props.onChange(items);
              return;
            }
          }

          if (props.onBlur) {
            props.onBlur();
          }
        },
        disabled: props.disabled,
        fullWidth: true,
        margin: "normal",
        error: !!props.error,
        helperText:
          props.helperText ||
          `Enter ${itemType}s separated by commas (e.g., ${
            itemType === "number"
              ? "1, 2, 3, 4"
              : itemType === "boolean"
              ? "true, false, true"
              : "item1, item2, item3"
          })`,
        placeholder:
          schema["x-ui"]?.placeholder ||
          `Enter ${itemType}s separated by commas`,
      };
    },
  },
};

export function getFieldConfig(fieldType: FieldType): FieldConfig {
  const config = FIELD_REGISTRY[fieldType];
  if (!config) {
    console.warn(`Unknown field type: ${fieldType}, falling back to text`);
    return FIELD_REGISTRY.text;
  }
  return config;
}

export function isValidFieldType(fieldType: string): fieldType is FieldType {
  return fieldType in FIELD_REGISTRY;
}

export function renderEnumOptions(enumValues: string[]) {
  return enumValues.map((value) =>
    React.createElement(MenuItem, { key: value, value: value }, value)
  );
}
