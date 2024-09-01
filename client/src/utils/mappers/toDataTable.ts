import { Column, DataRow, TableData } from "@/interfaces";

export type Specification = {
  columns: Column[];
};

export function mapDataToTableFormat(incomingData: any[], specification: Specification): TableData {
  const rows: DataRow[] = incomingData.map((item) => mapRowToTableFormat(item, specification));

  return {
    columns: specification.columns,
    rows: rows,
  };
}

export function mapRowToTableFormat(item: any, specification: Specification): DataRow {
  const row: DataRow = { id: item.id || "" };
  specification.columns.forEach((column) => {
    let value = column.hasOwnProperty("defaultValue") ? column.defaultValue : "";

    let key = findKeyIgnoreCase(item, column.field);

    if (!key && column.fallbackField) {
      key = findKeyIgnoreCase(item, column.fallbackField);
    }

    if (key !== null) {
      value = item[key];
    }

    if (column.inputType === "json" && (value !== null || value !== undefined || value !== "")) {
      value = JSON.stringify(value, null, 2);
    }

    row[column.field] = value;
  });

  return row;
}

function findKeyIgnoreCase(item: any, keyToFind: string): string | null {
  const lowerKeyToFind = keyToFind.toLowerCase();
  const keys = Object.keys(item);
  for (const key of keys) {
    if (key.toLowerCase() === lowerKeyToFind) {
      return key;
    }
  }
  return null;
}
