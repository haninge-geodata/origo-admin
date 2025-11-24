import { ExtendedJSONSchema } from "@/shared/interfaces";
import { Column } from "@/interfaces/detailedDataTable";

export interface TableSpecification {
  specification: {
    columns: Column[];
  };
}

export function generateTableSpecification(
  schema: ExtendedJSONSchema
): TableSpecification {
  const columns: Column[] = [];

  if (!schema.properties) {
    return { specification: { columns: [] } };
  }

  columns.push({
    headerName: "Id",
    field: "id",
    fallbackField: "name",
    inputType: "textfield",
    readOnly: true,
  });

  Object.entries(schema.properties).forEach(([fieldName, fieldSchema]) => {
    const field = fieldSchema as ExtendedJSONSchema;

    const tableConfig = field["x-table"] || {};
    const uiConfig = field["x-ui"] || {};

    const isVisible = getFieldVisibility(fieldName, field, tableConfig);

    const column: Column = {
      headerName: tableConfig.headerName || field.title || fieldName,
      field: fieldName,
      hide: !isVisible,
      inputType: getInputType(field, uiConfig),
      readOnly: tableConfig.readOnly || false,
    };

    if (field.title && schema.required?.includes(fieldName)) {
      column.validation = {
        required: true,
        type: (field.type as string) || "string",
        message: `${field.title} är obligatorisk`,
      };
    }

    if (field.default !== undefined) {
      column.defaultValue = field.default as string | number | boolean | null;
    }

    columns.push(column);
  });

  return {
    specification: {
      columns: columns,
    },
  };
}

function getFieldVisibility(
  fieldName: string,
  field: ExtendedJSONSchema,
  tableConfig: any
): boolean {
  if (tableConfig.visible !== undefined) {
    return tableConfig.visible;
  }

  if (["name", "title"].includes(fieldName)) {
    return true;
  }

  return false;
}

function getInputType(field: ExtendedJSONSchema, uiConfig: any): string {
  if (uiConfig.component) {
    const componentMap: Record<string, string> = {
      text: "textfield",
      textarea: "textarea",
      number: "textfield",
      checkbox: "checkbox",
      select: "select",
      "api-select": "api-select",
      "json-editor": "json",
      "array-text": "textfield",
      "key-value": "keyvaluepair",
      "style-picker": "stylepicker",
    };
    return componentMap[uiConfig.component] || "textfield";
  }

  switch (field.type) {
    case "boolean":
      return "checkbox";
    case "number":
    case "integer":
      return "textfield";
    case "string":
      if (field.maxLength && field.maxLength > 200) {
        return "textarea";
      }
      return "textfield";
    case "array":
      return "json";
    case "object":
      return "json";
    default:
      return "textfield";
  }
}
