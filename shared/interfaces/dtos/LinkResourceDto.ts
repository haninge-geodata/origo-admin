import { KeyValuePair } from "./KeyValuePairDto";
import { LinkResourceAuthDto } from "./LinkResourceAuthDto";

export interface LinkResourceDto {
  id?: string;
  name: string;
  title: string;
  url: string;
  type: string;
  auth?: LinkResourceAuthDto;
  extendedAttributes?: KeyValuePair[];
}
