interface Permission {
  id: string;
  type: string;
}

interface Resource {
  type: string;
  id: string;
  name: string;
  sourceId: string;
  source: string;
  sourceUrl: string;
}
class OptimizedPermissionCache {
  private layerPermissions: Map<string, Set<string>> = new Map();

  constructor(resources: any[], roles: any[]) {
    this.buildCache(resources, roles);
  }

  private buildCache(resources: any[], roles: any[]) {
    const permissionToActors = new Map<string, Set<string>>();
    roles.forEach((role) => {
      role.permissions.forEach((perm: any) => {
        if (!permissionToActors.has(perm.id)) {
          permissionToActors.set(perm.id, new Set());
        }
        role.actors.forEach((actor: any) => {
          permissionToActors.get(perm.id)!.add(actor.name);
        });
      });
    });

    resources.forEach((resource) => {
      const key = `${resource.source}:${resource.name}`;
      const resourcePermissionActors = permissionToActors.get(resource.id);

      if (resourcePermissionActors) {
        if (!this.layerPermissions.has(key)) {
          this.layerPermissions.set(key, new Set());
        }
        resourcePermissionActors.forEach((actorName) => {
          this.layerPermissions.get(key)!.add(actorName);
        });
      }
    });
  }

  hasLayerPermission(source: string, layerName: string, actors: string[]): boolean {
    const key = `${source}:${layerName}`;
    const allowedActors = this.layerPermissions.get(key);
    if (!allowedActors) return false;

    return actors.some((actor) => allowedActors.has(actor));
  }
}
class ResourcesCache {
  private resources: any[];
  private resourcesById: Map<string, Resource> = new Map();
  private resourcesByName: Map<string, Resource[]> = new Map();
  private resourcesBySourceId: Map<string, Resource[]> = new Map();
  private sourceUrlByName: Map<string, string> = new Map();
  private sourceNameByUrl: Map<string, string> = new Map();

  constructor(resources: any[]) {
    this.resources = resources;
    this.buildCache(resources);
    console.info(`[${Date.now()}] Resources cache initialized`);
  }

  private buildCache(resources: Resource[]) {
    console.info(`[${Date.now()}] Building resources cache`);
    resources.forEach((resource) => {
      this.resourcesById.set(resource.id, resource);

      if (!this.resourcesByName.has(resource.name)) {
        this.resourcesByName.set(resource.name, []);
      }
      this.resourcesByName.get(resource.name)!.push(resource);

      if (!this.resourcesBySourceId.has(resource.sourceId)) {
        this.resourcesBySourceId.set(resource.sourceId, []);
      }
      this.resourcesBySourceId.get(resource.sourceId)!.push(resource);
      if (resource?.type === "source") {
        this.sourceUrlByName.set(resource.name, resource.sourceUrl);
        this.sourceNameByUrl.set(resource.sourceUrl, resource.name);
      }
    });
  }

  getResourceById(id: string): Resource | undefined {
    return this.resourcesById.get(id);
  }

  getResourcesByName(name: string): Resource[] {
    return this.resourcesByName.get(name) || [];
  }

  getResourcesBySourceId(sourceId: string): Resource[] {
    return this.resourcesBySourceId.get(sourceId) || [];
  }

  getSourceUrlByName(id: string): string | undefined {
    return this.sourceUrlByName.get(id);
  }

  getSourceByUrl(url: string): string | undefined {
    return this.sourceNameByUrl.get(url);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resourcesById.values());
  }

  getResources(): any[] {
    return this.resources;
  }
}

class PermissionCache {
  private roles: any[];
  private actorPermissions: Map<string, Set<string>> = new Map();
  private permissionDetails: Map<string, Permission> = new Map();

  constructor(rolesData: any[]) {
    this.roles = rolesData;
    this.buildCache(rolesData);
  }

  private buildCache(rolesData: any[]) {
    rolesData.forEach((role) => {
      role.actors.forEach((actor: { name: string; type: string }) => {
        const actorKey = `${actor.name.toLowerCase()}`;
        if (!this.actorPermissions.has(actorKey)) {
          this.actorPermissions.set(actorKey, new Set());
        }

        role.permissions.forEach((permission: Permission) => {
          this.actorPermissions.get(actorKey)!.add(permission.id);
          this.permissionDetails.set(permission.id, permission);
        });
      });
    });
  }

  hasPermission(actorName: string, permissionId: string): boolean {
    const actorKey = `${actorName.toLowerCase()}`;
    return this.actorPermissions.get(actorKey)?.has(permissionId) || false;
  }

  getPermissionDetails(permissionId: string): Permission | undefined {
    return this.permissionDetails.get(permissionId);
  }

  getRoles(): any[] {
    return this.roles;
  }
}
export class CacheManager {
  private lastUpdated: Date | null = null;
  private permissionCache: PermissionCache | null = null;
  private resourcesCache: ResourcesCache | null = null;
  private optimizedPermissionCache: OptimizedPermissionCache | null = null;
  private rolesEndpoint: string;
  private resourcesEndpoint: string;
  private apiAccessToken: string;

  constructor(rolesEndpoint: string, resourcesEndpoint: string, apiAccessToken: string) {
    this.rolesEndpoint = rolesEndpoint;
    this.resourcesEndpoint = resourcesEndpoint;
    this.apiAccessToken = apiAccessToken;
  }

  async initializeCache(): Promise<void> {
    await this.refreshCache();
  }

  async refreshCache(): Promise<void> {
    try {
      console.info(`[${Date.now()}] Refreshing cache`);

      const headers = {
        Authorization: `Bearer ${this.apiAccessToken}`,
        "Content-Type": "application/json",
      };

      // Fetch roles and resources concurrently
      const [rolesResponse, resourcesResponse] = await Promise.all([fetch(this.rolesEndpoint, { headers }), fetch(this.resourcesEndpoint, { headers })]);

      if (!rolesResponse.ok || !resourcesResponse.ok) {
        throw new Error(`HTTP error! Roles status: ${rolesResponse.status}, Resources status: ${resourcesResponse.status}`);
      }

      const [roles, resources] = await Promise.all([rolesResponse.json(), resourcesResponse.json()]);

      // Update all caches
      this.permissionCache = new PermissionCache(roles);
      this.resourcesCache = new ResourcesCache(resources);
      this.optimizedPermissionCache = new OptimizedPermissionCache(resources, roles);
      this.lastUpdated = new Date();

      console.info(`[${Date.now()}] Cache refresh completed`);
    } catch (error) {
      console.error(`[${Date.now()}] Error refreshing cache:`, error);
      console.error(`[${Date.now()}] Cache will not be updated, please check access token and urls for roles and resources i .env`);
    }
  }

  getResourceById(id: string): Resource | undefined {
    if (!this.resourcesCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.resourcesCache.getResourceById(id);
  }

  getResourcesByName(name: string): Resource[] {
    if (!this.resourcesCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.resourcesCache.getResourcesByName(name);
  }

  getSourceUrlByName(name: string): string | undefined {
    if (!this.resourcesCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.resourcesCache.getSourceUrlByName(name);
  }

  getSourceByUrl(url: string): string | undefined {
    if (!this.resourcesCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.resourcesCache.getSourceByUrl(url);
  }

  hasPermission(actorName: string, permissionId: string): boolean {
    if (!this.permissionCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.permissionCache.hasPermission(actorName, permissionId);
  }

  hasLayerPermission(source: string, layerName: string, actors: string[]): boolean {
    if (!this.optimizedPermissionCache) {
      throw new Error("Optimized permission cache is not initialized");
    }
    return this.optimizedPermissionCache.hasLayerPermission(source, layerName, actors);
  }
  hasSourcePermission(source: string, actors: string[]): boolean {
    if (!this.permissionCache) {
      throw new Error("Optimized permission cache is not initialized");
    }

    const permissionId = this.resourcesCache
      ?.getResources()
      .filter((r) => r.type === "source" && r.name === source)
      .map((r) => r.id);

    if (permissionId && permissionId.length === 1) {
      for (const actor of actors) {
        if (this.permissionCache.hasPermission(actor, permissionId[0])) {
          return true;
        }
      }
    }

    return false;
  }

  hasControlPermission(actors: string, control: string): boolean {
    if (!this.permissionCache) {
      throw new Error("Optimized permission cache is not initialized");
    }

    const permissionId = this.resourcesCache
      ?.getResources()
      .filter((r) => r.type === "control" && r.name === control)
      .map((r) => r.id);
    if (permissionId && permissionId.length === 1) {
      return this.permissionCache.hasPermission(actors, permissionId[0]);
    }
    return false;
  }

  getPermissionDetails(permissionId: string): Permission | undefined {
    if (!this.permissionCache) {
      this.initializeCache();
      throw new Error("Resources cache is not initialized, trying to initialize it now");
    }
    return this.permissionCache.getPermissionDetails(permissionId);
  }

  isCacheInitialized(): boolean {
    return this.permissionCache !== null && this.resourcesCache !== null;
  }

  async healthCheck(): Promise<{
    status: string;
    message: string;
    lastUpdated?: string;
  }> {
    if (!this.isCacheInitialized()) {
      try {
        await this.initializeCache();
        return {
          status: "recovered",
          message: "Cache was empty and has been initialized.",
        };
      } catch (error) {
        return {
          status: "error",
          message: "Failed to initialize cache.",
          lastUpdated: this.lastUpdated ? this.formatDateToStockholmTime(this.lastUpdated) : undefined,
        };
      }
    }
    return {
      status: "healthy",
      message: "Cache is initialized and ready.",
      lastUpdated: this.lastUpdated ? this.formatDateToStockholmTime(this.lastUpdated) : undefined,
    };
  }

  private formatDateToStockholmTime(date: Date): string {
    const stockholmFormatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = stockholmFormatter.formatToParts(date);
    const dateTimeMap: { [key: string]: string } = {};
    parts.forEach(({ type, value }) => {
      dateTimeMap[type] = value;
    });

    return `${dateTimeMap.year}-${dateTimeMap.month}-${dateTimeMap.day} ${dateTimeMap.hour}:${dateTimeMap.minute}:${dateTimeMap.second}`;
  }
}
