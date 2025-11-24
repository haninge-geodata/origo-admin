import { ExtendedJSONSchema } from "@/shared/interfaces";

export interface FieldGroup {
  type: 'single' | 'inline' | 'row';
  fields: Array<[string, ExtendedJSONSchema]>;
  priority: number;
}

const FULL_WIDTH_COMPONENTS = [
  'textarea',
  'json-editor',
  'key-value',
  'object'
] as const;

// Group fields based on their layout configuration and priority
export function createFieldGroups(fields: Array<[string, ExtendedJSONSchema]>): FieldGroup[] {
  // Sort fields by priority first
  const sortedFields = [...fields].sort(([nameA, schemaA], [nameB, schemaB]) => {
    const priorityA = (schemaA['x-ui']?.layout?.priority ?? 999);
    const priorityB = (schemaB['x-ui']?.layout?.priority ?? 999);
    return priorityA - priorityB;
  });

  const groups: FieldGroup[] = [];
  const processedFields = new Set<string>();

  // Collect fields that belong to named groups
  const namedGroups: Record<string, Array<[string, ExtendedJSONSchema]>> = {};

  sortedFields.forEach(([fieldName, fieldSchema]) => {
    if (processedFields.has(fieldName)) return;

    const layout = fieldSchema['x-ui']?.layout;
    const groupName = layout?.group;

    if (groupName) {
      if (!namedGroups[groupName]) {
        namedGroups[groupName] = [];
      }
      namedGroups[groupName].push([fieldName, fieldSchema]);
      processedFields.add(fieldName);
    }
  });

  // Convert named groups to field groups
  Object.entries(namedGroups).forEach(([groupName, groupFields]) => {
    const hasOnlyCheckboxes = groupFields.every(([, schema]) =>
      schema.type === 'boolean'
    );

    // Small checkbox groups get inline layout
    if (hasOnlyCheckboxes && groupFields.length <= 4) {
      groups.push({
        type: 'inline',
        fields: groupFields,
        priority: Math.min(...groupFields.map(([, s]) => s['x-ui']?.layout?.priority ?? 999))
      });
    } else {
      groups.push({
        type: 'row',
        fields: groupFields,
        priority: Math.min(...groupFields.map(([, s]) => s['x-ui']?.layout?.priority ?? 999))
      });
    }
  });

  // Add ungrouped fields as single groups
  sortedFields.forEach(([fieldName, fieldSchema]) => {
    if (processedFields.has(fieldName)) return;

    groups.push({
      type: 'single',
      fields: [[fieldName, fieldSchema]],
      priority: fieldSchema['x-ui']?.layout?.priority ?? 999
    });
    processedFields.add(fieldName);
  });

  return groups.sort((a, b) => a.priority - b.priority);
}

// Calculate Grid column size for a field based on its type and group context
export function getGroupFieldSize(
  fieldSchema: ExtendedJSONSchema,
  groupType: FieldGroup['type'],
  fieldsInGroup: number
): number {
  const layout = fieldSchema['x-ui']?.layout;

  // Check for explicit width setting first
  if (layout?.width) {
    switch (layout.width) {
      case 'full': return 12;
      case 'half': return 6;
      case 'third': return 4;
      case 'quarter': return 3;
      case 'auto': break;
    }
  }

  // Calculate size based on group type
  switch (groupType) {
    case 'inline':
      // Inline groups (like checkboxes) - distribute evenly, min 3 columns
      return Math.max(3, Math.floor(12 / Math.min(fieldsInGroup, 4)));

    case 'row':
      // Row groups - split based on number of fields
      if (fieldsInGroup === 1) return 12;
      if (fieldsInGroup === 2) return 6;
      if (fieldsInGroup === 3) return 4;
      return 3;

    case 'single':
      // Single fields - check for special component types that need full width
      const componentType = fieldSchema['x-ui']?.component;
      if (componentType && FULL_WIDTH_COMPONENTS.includes(componentType as any)) {
        return 12;
      }
      
      // Long text fields get full width
      if (fieldSchema.type === 'string' &&
        (fieldSchema.format === 'binary' || (fieldSchema.maxLength && fieldSchema.maxLength > 100))) {
        return 12;
      }
      
      // Objects and arrays get full width
      if (fieldSchema.type === 'object' || fieldSchema.type === 'array') {
        return 12;
      }
      
      // Default to half width for single fields
      return 6;
  }
}

