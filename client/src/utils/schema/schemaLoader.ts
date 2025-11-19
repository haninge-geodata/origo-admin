import { ExtendedJSONSchema } from "@/types/jsonSchema";
import { schemaService } from "@/api/schemaService";

export async function loadSchema(
  schemaPath: string
): Promise<ExtendedJSONSchema> {
  const schemaName = extractSchemaName(schemaPath);

  try {
    const schemaDto = await fetchSchemaFromAPI(schemaName);
    if (schemaDto) {
      return schemaDto.schemaContent as ExtendedJSONSchema;
    }
  } catch (apiError) {
    console.info(
      `[SchemaLoader] Schema "${schemaName}" not found in database, trying file system...`
    );
  }

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

function extractSchemaName(schemaPath: string): string {
  if (schemaPath.includes("/")) {
    return schemaPath.split("/")[0];
  }
  return schemaPath;
}

async function fetchSchemaFromAPI(schemaName: string): Promise<any> {
  try {
    const schema = await schemaService.fetchByName(schemaName);
    return schema;
  } catch (error) {
    return null;
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
