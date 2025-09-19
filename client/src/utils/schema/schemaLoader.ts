import { ExtendedJSONSchema } from "@/types/jsonSchema";

export async function loadSchema(
  schemaPath: string
): Promise<ExtendedJSONSchema> {
  try {
    const schema = await fetchSchemaFromPublic(schemaPath);

    if (!schema || typeof schema !== "object") {
      throw new Error(`Invalid schema format: ${schemaPath}`);
    }

    if (!schema.$schema) {
      throw new Error(`Schema missing $schema property: ${schemaPath}`);
    }

    return schema as ExtendedJSONSchema;
  } catch (error) {
    console.error(`Failed to load schema: ${schemaPath}`, error);
    throw new Error(`Schema not found or invalid: ${schemaPath}`);
  }
}

async function fetchSchemaFromPublic(schemaPath: string): Promise<any> {
  const url = `/schemas/${schemaPath}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Schema file not found: ${schemaPath}. Make sure the file exists in /public/schemas/${schemaPath}`
      );
    }
    throw new Error(
      `Failed to load schema: ${response.status} ${response.statusText}`
    );
  }

  try {
    const schema = await response.json();
    return schema;
  } catch (parseError) {
    throw new Error(
      `Invalid JSON in schema file: ${schemaPath}. ${parseError}`
    );
  }
}

export function validateSchema(schema: any): schema is ExtendedJSONSchema {
  if (!schema || typeof schema !== "object") {
    return false;
  }

  if (!schema.$schema || typeof schema.$schema !== "string") {
    return false;
  }

  if (!schema.type && !schema.oneOf && !schema.anyOf && !schema.allOf) {
    return false;
  }

  return true;
}
