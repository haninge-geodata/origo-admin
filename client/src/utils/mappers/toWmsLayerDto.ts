import { DataRow } from "@/interfaces";
import { LinkResourceDto, WMSLayerDto } from "@/shared/interfaces/dtos";

export function DataRowToWMSLayerDto(rows: DataRow[], source: LinkResourceDto): WMSLayerDto[] {
  return rows.map((row) => {
    let attributesObject: Record<string, any> = parseJson(row.attributes, {});
    return {
      id: row.id || "",
      name: row.name,
      origoId: row.origoId,
      source: source,
      title: row.title,
      abstract: row.abstract,
      queryable: row.queryable,
      type: "WMS",
      visible: row.visible,
      geometryName: row.geometryName,
      attribution: row.attribution,
      format: row.format,
      renderMode: "image",
      style: row.style,
      dataurl: row.dataurl,
      attributes: attributesObject,
      extendedAttributes: row.extendedAttributes,
    };
  });
}

function parseJson<T>(jsonString: string | undefined, defaultValue: T): T {
  if (!jsonString || jsonString.trim() === "") {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}
