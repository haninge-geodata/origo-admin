export interface GetWFSDescribeFeatureTypesResponse {
  Layers: WFSLayerData[];
}

export interface WFSLayerData {
  Name: string;
  Title: string;
  Abstract: string;
}
