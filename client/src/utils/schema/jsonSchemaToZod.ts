import { z } from "zod";
import { ExtendedJSONSchema } from "@/types/jsonSchema";

export function jsonSchemaToZod(schema: ExtendedJSONSchema): z.ZodSchema<any> {
  return convertSchemaProperty(schema);
}

function convertSchemaProperty(property: ExtendedJSONSchema): z.ZodSchema<any> {
  if (property.oneOf) {
    const schemas = property.oneOf.map((schema) =>
      convertSchemaProperty(schema)
    );
    return z.union(schemas as [z.ZodSchema, z.ZodSchema, ...z.ZodSchema[]]);
  }

  if (property.anyOf) {
    const schemas = property.anyOf.map((schema) =>
      convertSchemaProperty(schema)
    );
    return z.union(schemas as [z.ZodSchema, z.ZodSchema, ...z.ZodSchema[]]);
  }

  switch (property.type) {
    case "string":
      return convertStringSchema(property);

    case "number":
    case "integer":
      return convertNumberSchema(property);

    case "boolean":
      return z.boolean();

    case "array":
      return convertArraySchema(property);

    case "object":
      return convertObjectSchema(property);

    default:
      return z.any();
  }
}

function convertStringSchema(property: ExtendedJSONSchema): z.ZodTypeAny {
  let schema = z.string();

  if (typeof property.minLength === "number") {
    schema = schema.min(property.minLength);
  }

  if (typeof property.maxLength === "number") {
    schema = schema.max(property.maxLength);
  }

  if (property.pattern) {
    schema = schema.regex(new RegExp(property.pattern));
  }

  if (property.format) {
    switch (property.format) {
      case "email":
        schema = schema.email();
        break;
      case "uri":
      case "url":
        schema = schema.url();
        break;
      case "date":
        schema = schema.datetime();
        break;
    }
  }

  if (property.enum && Array.isArray(property.enum)) {
    const enumValues = property.enum as string[];
    if (enumValues.length > 0) {
      return z.enum(enumValues as [string, ...string[]]);
    }
  }

  if (property.const !== undefined) {
    return z.literal(property.const as string);
  }

  return schema;
}

function convertNumberSchema(property: ExtendedJSONSchema): z.ZodNumber {
  let schema = z.coerce.number();

  if (typeof property.minimum === "number") {
    schema = schema.min(property.minimum);
  }

  if (typeof property.maximum === "number") {
    schema = schema.max(property.maximum);
  }

  if (property.type === "integer") {
    schema = schema.int();
  }

  return schema;
}

function convertArraySchema(property: ExtendedJSONSchema): z.ZodArray<any> {
  let itemSchema: z.ZodSchema<any>;

  if (property.items) {
    if (Array.isArray(property.items)) {
      itemSchema = z.any();
    } else {
      itemSchema = convertSchemaProperty(property.items);
    }
  } else {
    itemSchema = z.any();
  }

  let schema = z.array(itemSchema);

  if (typeof property.minItems === "number") {
    schema = schema.min(property.minItems);
  }

  if (typeof property.maxItems === "number") {
    schema = schema.max(property.maxItems);
  }

  return schema;
}

function convertObjectSchema(property: ExtendedJSONSchema): z.ZodObject<any> {
  const shape: Record<string, z.ZodSchema<any>> = {};

  if (property.properties) {
    Object.entries(property.properties).forEach(([key, propSchema]) => {
      let fieldSchema = convertSchemaProperty(propSchema);

      const isRequired = property.required?.includes(key) ?? false;

      if (propSchema["x-validation"]?.requiredIf && !isRequired) {
        fieldSchema = fieldSchema.optional();
      } else if (!isRequired) {
        fieldSchema = fieldSchema.optional();
      }

      if (propSchema.default !== undefined) {
        fieldSchema = fieldSchema.default(propSchema.default);
      }

      shape[key] = fieldSchema;
    });
  }

  return z.object(shape);
}

export function formatZodError(error: z.ZodError): Record<string, string> {
  const errorMap: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    errorMap[path] = err.message;
  });

  return errorMap;
}
