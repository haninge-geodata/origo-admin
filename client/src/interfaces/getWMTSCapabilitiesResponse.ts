export interface GetWMTSCapabilitiesResponse {
  Layers: WMTSLayerData[];
}

export interface WMTSLayerData {
  Name: string;
  Title: string;
  Abstract: string;
  Format: string;
}
