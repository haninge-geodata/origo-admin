export interface GetWMSCapabilitiesResponse {
  Layers: WMSLayerData[];
}

export interface WMSLayerData {
  Name: string;
  Title: string;
  Queryable: boolean;
  Attribution: string;
  Abstract: string;
  Format: string;
  Style: string;
  DataUrl: string;
}
