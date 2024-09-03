import { DataRow } from "@/interfaces";
import { LinkResourceDto, WMTSLayerDto } from "@/shared/interfaces/dtos";

export function DataRowToWMTSLayerDto(
  rows: DataRow[],
  source: LinkResourceDto
): WMTSLayerDto[] {
  return rows.map((row) => {
    return {
      id: row.id || "",
      name: row.name,
      layer_id: row.layer_id,
      source: source,
      title: row.title,
      abstract: row.abstract,
      queryable: row.queryable,
      type: "WMTS",
      visible: row.visible,
      attribution: row.attribution,
      format: row.format,
      style: row.style,
      maxScale: row.maxscale ? Number(row.maxscale) || 0 : undefined,
      extendedAttributes: row.extendedAttributes,
    };
  });
}
