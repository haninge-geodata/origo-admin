import { CacheManager } from "../cacheManager";
import { UserInfo } from "./auth/userInfoCache";

export class FilterJsonService {
  public async filterJson(json: any, proxyUrl: string, userInfo: UserInfo, cacheManager: CacheManager): Promise<any> {
    if (json.source) {
      for (const key in json.source) {
        if (json.source[key].url) {
          const url = cacheManager.getSourceUrlByName(key);
          if (url) {
            json.source[key].url = `${proxyUrl}gis/${key}`;
          }
        }
      }
    }
    let permissions = userInfo.claims.split(",");
    permissions.push(userInfo.username);
    if (json.layers) {
      json.layers = json.layers.filter((layer: any) => {
        const p = permissions.some((p: any) => cacheManager.hasPermission(p, layer.id));
        return p;
      });
    }

    const remainingGroups = new Set(json.layers.map((layer: any) => layer.group));

    const filterGroups = (groups: any[]): any[] => {
      return groups.filter((group) => {
        if (group.groups) {
          group.groups = filterGroups(group.groups);
        }
        return remainingGroups.has(group.name) || (group.groups && group.groups.length > 0);
      });
    };

    if (json.groups) {
      json.groups = filterGroups(json.groups);
    }
    if (json.layers) {
      json.layers = json.layers.map((layer: any) => {
        const { id, layer_id, ...rest } = layer;

        if (layer_id !== null && layer_id !== undefined && layer_id !== "") {
          return { ...rest, Id: layer_id };
        } else {
          return rest;
        }
      });
    }
    return json;
  }
}
