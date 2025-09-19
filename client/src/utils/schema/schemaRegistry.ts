import { z } from "zod";
import { ExtendedJSONSchema } from "@/types/jsonSchema";
import { loadSchema } from "./schemaLoader";
import { jsonSchemaToZod } from "./jsonSchemaToZod";

interface CachedSchema {
  jsonSchema: ExtendedJSONSchema;
  zodSchema: z.ZodSchema<any>;
  timestamp: number;
}

class SchemaRegistry {
  private cache = new Map<string, CachedSchema>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getSchema(schemaPath: string): Promise<{
    jsonSchema: ExtendedJSONSchema;
    zodSchema: z.ZodSchema<any>;
  }> {
    const cached = this.cache.get(schemaPath);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return {
        jsonSchema: cached.jsonSchema,
        zodSchema: cached.zodSchema,
      };
    }

    try {
      const jsonSchema = await loadSchema(schemaPath);
      const zodSchema = jsonSchemaToZod(jsonSchema);

      this.cache.set(schemaPath, {
        jsonSchema,
        zodSchema,
        timestamp: Date.now(),
      });

      return { jsonSchema, zodSchema };
    } catch (error) {
      console.error(`Failed to load schema: ${schemaPath}`, error);
      throw error;
    }
  }

  async getJSONSchema(schemaPath: string): Promise<ExtendedJSONSchema> {
    const { jsonSchema } = await this.getSchema(schemaPath);
    return jsonSchema;
  }

  async getZodSchema(schemaPath: string): Promise<z.ZodSchema<any>> {
    const { zodSchema } = await this.getSchema(schemaPath);
    return zodSchema;
  }

  clearCache(schemaPath?: string): void {
    if (schemaPath) {
      this.cache.delete(schemaPath);
    } else {
      this.cache.clear();
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }
}

export const schemaRegistry = new SchemaRegistry();

export const getJSONSchema = (schemaPath: string) =>
  schemaRegistry.getJSONSchema(schemaPath);
export const getZodSchema = (schemaPath: string) =>
  schemaRegistry.getZodSchema(schemaPath);
export const clearSchemaCache = (schemaPath?: string) =>
  schemaRegistry.clearCache(schemaPath);
