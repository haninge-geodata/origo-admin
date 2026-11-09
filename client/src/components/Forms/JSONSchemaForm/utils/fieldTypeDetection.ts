import { ExtendedJSONSchema } from "@/shared/interfaces";
import { FieldType, isValidFieldType } from "../fieldRegistry";

//Detects the appropriate field type from a JSON Schema
export function detectFieldType(schema: ExtendedJSONSchema): FieldType {
  const uiConfig = schema["x-ui"] || {};

  // Check for explicit x-ui component specification
  if (uiConfig.component) {
    const explicitType = uiConfig.component;

    switch (explicitType) {
      case "slider":
        return "slider";
      case "textarea":
        return "textarea";
      case "date":
        return "date";
      case "datetime":
        return "datetime";
      case "time":
        return "time";
      case "color":
        return "color";
      case "file":
        return "file";
      case "multi-select":
        return "multi-select";
      case "json-editor":
        return "json-editor";
      case "key-value":
        return "key-value";
      case "style-picker":
        return "style-picker";
      case "api-select":
        return "api-select";
      default:
        if (isValidFieldType(explicitType)) {
          return explicitType;
        }
    }
  }

  if (schema.type === "array") {
    if (
      schema.items &&
      typeof schema.items === "object" &&
      !Array.isArray(schema.items)
    ) {
      const itemType = schema.items.type;

      if (
        itemType === "number" ||
        itemType === "string" ||
        itemType === "boolean"
      ) {
        return "array-text";
      }

      if (itemType === "object" && schema.items.properties) {
        return "json-editor";
      }
    }

    return "json-editor";
  }

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return "enum";
  }

  if (schema.type === "boolean") {
    return "boolean";
  }

  if (schema.type === "number" || schema.type === "integer") {
    if (schema.minimum !== undefined && schema.maximum !== undefined) {
      const range = (schema.maximum as number) - (schema.minimum as number);
      if (range <= 100 && schema.minimum >= 0) {
      }
    }
    return "number";
  }

  if (schema.type === "object") {
    if (
      schema.additionalProperties === true ||
      (typeof schema.additionalProperties === "object" &&
        schema.additionalProperties.type === "string")
    ) {
      return "key-value";
    }
    return "json-editor";
  }

  if (Array.isArray(schema.type)) {
    if (schema.type.includes("boolean")) return "boolean";
    if (schema.type.includes("number") || schema.type.includes("integer"))
      return "number";
    if (schema.type.includes("string")) return "text";
    if (schema.type.includes("array")) return "json-editor";
    if (schema.type.includes("object")) return "json-editor";
    return "text";
  }

  if (schema.type === "string") {
    switch (schema.format) {
      case "email":
        return "email";
      case "uri":
      case "url":
        return "url";
      case "password":
        return "password";
      case "date":
        return "date";
      case "date-time":
      case "datetime":
        return "datetime";
      case "time":
        return "time";
      case "color":
        return "color";
      case "binary":
        return "file";
      default:
        return "text";
    }
  }

  if (
    schema.type &&
    !["string", "number", "integer", "boolean", "array", "object"].includes(
      String(schema.type)
    )
  ) {
    console.warn(
      `Unknown schema type: ${schema.type}, falling back to text field`
    );
  }
  return "text";
}

// Validates that a schema can be rendered with the detected field type
export function validateSchemaForFieldType(
  schema: ExtendedJSONSchema,
  fieldType: FieldType
): boolean {
  const typeMatches = (expectedType: string): boolean => {
    if (Array.isArray(schema.type)) {
      return schema.type.includes(expectedType as any);
    }
    return schema.type === expectedType;
  };

  switch (fieldType) {
    case "enum":
      return !!(
        schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0
      );

    case "slider":
      return typeMatches("number") || typeMatches("integer");

    case "boolean":
      return typeMatches("boolean");

    case "number":
      return typeMatches("number") || typeMatches("integer");

    case "text":
    case "email":
    case "url":
    case "password":
    case "textarea":
    case "date":
    case "datetime":
    case "time":
    case "color":
    case "file":
      return typeMatches("string");

    case "multi-select":
      return !!(
        (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) ||
        (typeMatches("array") &&
          schema.items &&
          typeof schema.items === "object" &&
          "enum" in schema.items &&
          Array.isArray(schema.items.enum))
      );

    case "json-editor":
      return typeMatches("object") || !schema.type;

    case "key-value":
      return !!(
        typeMatches("object") &&
        (schema.additionalProperties === true ||
          (typeof schema.additionalProperties === "object" &&
            schema.additionalProperties.type === "string"))
      );

    case "style-picker":
    case "api-select":
    case "array-text":
      return true;

    default:
      return true;
  }
}
