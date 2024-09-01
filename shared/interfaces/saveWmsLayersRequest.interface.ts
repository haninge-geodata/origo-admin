import { LinkResource } from "./linkResource.interface";

interface SaveWMSLayersRequest {
  name: string;
  source: LinkResource;
  title: string;
  abstract: string;
  queryable: boolean;
  type: string;
  geometry: string;
  attribution: string;
  format: string;
  renderMode: string;
  //attributes
}

export type { SaveWMSLayersRequest };
