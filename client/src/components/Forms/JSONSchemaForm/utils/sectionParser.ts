import { ExtendedJSONSchema } from "@/shared/interfaces";
import { DEFAULT_SECTION_NAME } from "../constants/fieldTypes";

export interface ParsedFormSection {
  title: string;
  description: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
  required?: boolean;
  fields: Array<[string, ExtendedJSONSchema]>;
}

// Group fields by their x-ui.section property (defaults to DEFAULT_SECTION_NAME if not set)
function assignFieldsToSections(
  fields: Array<[string, ExtendedJSONSchema]>
): Record<string, Array<[string, ExtendedJSONSchema]>> {
  const fieldSectionAssignments: Record<string, Array<[string, ExtendedJSONSchema]>> = {};

  fields.forEach(([name, fieldSchema]) => {
    const fieldSection = (fieldSchema as any)['x-ui']?.section || DEFAULT_SECTION_NAME;

    if (!fieldSectionAssignments[fieldSection]) {
      fieldSectionAssignments[fieldSection] = [];
    }
    fieldSectionAssignments[fieldSection].push([name, fieldSchema]);
  });

  return fieldSectionAssignments;
}

// Convert sections (array or object format) to normalized structure with fields
function parseSchemaSections(
  schemaSections: any,
  fieldSectionAssignments: Record<string, Array<[string, ExtendedJSONSchema]>>
): ParsedFormSection[] {
  // Normalize to array format
  const sectionsToProcess = Array.isArray(schemaSections)
    ? schemaSections.map(section => [section.name, section] as [string, any])
    : Object.entries(schemaSections);

  // Sort by order, map to final structure
  const orderedSections = sectionsToProcess
    .sort(([, a], [, b]) => (a.order || 999) - (b.order || 999))
    .map(([sectionName, sectionConfig]) => {
      const sectionFields = fieldSectionAssignments[sectionName] || [];

      if (sectionFields.length === 0) return null;

      return {
        title: sectionConfig.title || sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        description: sectionConfig.description || `${sectionName} configuration`,
        collapsible: sectionConfig.collapsible ?? false,
        defaultCollapsed: sectionConfig.defaultCollapsed ?? false,
        required: sectionConfig.required,
        fields: sectionFields
      };
    })
    .filter(Boolean) as ParsedFormSection[];

  return orderedSections;
}

// Create "Additional Fields" section for any fields not assigned to a section
function createAdditionalFieldsSection(
  allFields: Array<[string, ExtendedJSONSchema]>,
  assignedFields: string[]
): ParsedFormSection | null {
  const remainingFields = allFields.filter(([name]) => !assignedFields.includes(name));

  if (remainingFields.length === 0) return null;

  return {
    title: 'Additional Fields',
    description: 'Other configuration options',
    collapsible: true,
    defaultCollapsed: true,
    required: false,
    fields: remainingFields
  };
}

// Parse schema into organized sections with their fields
export function parseFieldSections(schema: ExtendedJSONSchema): ParsedFormSection[] {
  if (!schema.properties) return [];

  const fields = Object.entries(schema.properties);

  // Use defined sections if available
  if (schema['x-ui']?.sections) {
    const schemaSections = schema['x-ui'].sections;

    const fieldSectionAssignments = assignFieldsToSections(fields);
    const orderedSections = parseSchemaSections(schemaSections, fieldSectionAssignments);

    // Add any leftover fields to "Additional Fields" section
    const assignedFields = orderedSections.flatMap(s => s.fields.map(f => f[0]));
    const additionalSection = createAdditionalFieldsSection(fields, assignedFields);

    if (additionalSection) {
      orderedSections.push(additionalSection);
    }

    return orderedSections;
  }

  // Fallback: no sections defined
  console.warn('Schema missing required x-ui.sections definition:', {
    schema: schema.title || 'Unknown Schema',
    fieldCount: fields.length,
    message: 'All schemas must define sections explicitly in x-ui.sections'
  });

  return [{
    title: 'Configuration',
    description: 'Schema configuration (sections not defined)',
    collapsible: false,
    defaultCollapsed: false,
    fields: fields
  }];
}

