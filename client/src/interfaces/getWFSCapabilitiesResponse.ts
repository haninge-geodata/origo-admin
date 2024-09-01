export interface GetWFSCapabilitiesResponse {
  Layers: WFSLayerData[];
}

export interface WFSLayerData {
  Name: string;
  Title: string;
  Abstract: string;
}
