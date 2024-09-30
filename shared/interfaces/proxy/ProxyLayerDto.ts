export type ProxyResourceDto = {
  type: "layer" | "source" | "control" | "map";
  id: string;
  name: string;
  sourceId?: string;
  source?: string;
  sourceUrl?: string;
};
