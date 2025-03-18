import { DataRow } from "@/interfaces";
import { LinkResourceDto, WFSLayerDto } from "@/shared/interfaces/dtos";

export function DataRowToWFSLayerDto(
  rows: DataRow[],
  source: LinkResourceDto
): WFSLayerDto[] {
  return rows.map((row) => {
    let attributesObject: Record<string, any> = parseJson(row.attributes, {});
    let clusterOptionsObject: Record<string, any> = parseJson(
      row.clusteroptions,
      {}
    );
    return {
      id: row.id || "",
      name: row.name,
      layer_id: row.layer_id,
      source: source,
      title: row.title,
      abstract: row.abstract,
      queryable: row.queryable,
      type: "WFS",
      geometryName: row.geometryName,
      visible: row.visible,
      opacity: row.opacity != null ? parseFloat(row.opacity) : undefined,
      attribution: row.attribution,
      format: row.format,
      style: row.style,
      clusterStyle: row.clusterstyle,
      attributes: attributesObject,
      clusterOptions: clusterOptionsObject,
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
    console.error(`[${Date.now()}] Error parsing JSON: ${error}`);
    return defaultValue;
  }
}
