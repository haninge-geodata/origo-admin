import { KeyValuePair } from "./KeyValuePairDto";

export interface LinkResourceDto {
  id?: string;
  name: string;
  title: string;
  url: string;
  type: string;
  extendedAttributes?: KeyValuePair[];
}
