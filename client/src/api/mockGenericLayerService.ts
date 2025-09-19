import { BaseLayerDto } from "@/shared/interfaces/dtos";

/**
 * Mock data for testing generic layer functionality
 */
const mockGeoJSONLayers: BaseLayerDto[] = [
  {
    id: "1",
    name: "buildings_residential",
    title: "Residential Buildings",
    type: "GEOJSON",
    source: "https://example.com/data/buildings.geojson",
    queryable: true,
    visible: false,
    opacity: 1,
    group: "Buildings",
    projection: "EPSG:4326",
    style: "building-style-1",
    abstract: "Layer containing residential buildings in the area",
    attribution: "© City Planning Department 2024"
  },
  {
    id: "2",
    name: "parks_green_areas",
    title: "Parks and Green Areas",
    type: "GEOJSON",
    source: "https://example.com/data/parks.geojson",
    queryable: true,
    visible: true,
    opacity: 0.8,
    group: "Environment",
    projection: "EPSG:4326",
    style: "park-style-1",
    abstract: "Public parks and green recreational areas",
    attribution: "© Parks Department 2024"
  },
  {
    id: "3",
    name: "roads_main",
    title: "Main Roads",
    type: "GEOJSON",
    source: "https://example.com/data/roads.geojson",
    queryable: false,
    visible: true,
    opacity: 1,
    group: "Infrastructure",
    projection: "EPSG:4326",
    style: "road-style-1",
    abstract: "Main road network for the municipality",
    attribution: "© Traffic Department 2024"
  }
];

const mockGPXLayers: BaseLayerDto[] = [
  {
    id: "4",
    name: "hiking_trail_north",
    title: "North Hiking Trail",
    type: "GPX",
    source: "https://example.com/data/north-trail.gpx",
    queryable: true,
    visible: false,
    opacity: 1,
    group: "Recreation",
    projection: "EPSG:4326",
    style: "trail-style-1"
  }
];

const mockTopoJSONLayers: BaseLayerDto[] = [
  {
    id: "5",
    name: "administrative_boundaries",
    title: "Administrative Boundaries",
    type: "TOPOJSON",
    source: "https://example.com/data/boundaries.topojson",
    queryable: true,
    visible: false,
    opacity: 1,
    group: "Administration",
    projection: "EPSG:4326",
    style: "boundary-style-1"
  }
];

/**
 * Mock implementation of generic layer service for testing
 */
export class MockGenericLayerService {
  private schemaType: string;
  private mockData: BaseLayerDto[];

  constructor(schemaType: string) {
    this.schemaType = schemaType.toLowerCase();

    // Select appropriate mock data based on schema type
    switch(this.schemaType) {
      case 'geojson':
        this.mockData = [...mockGeoJSONLayers];
        break;
      case 'gpx':
        this.mockData = [...mockGPXLayers];
        break;
      case 'topojson':
        this.mockData = [...mockTopoJSONLayers];
        break;
      default:
        this.mockData = [];
    }
  }

  async fetchAll(): Promise<BaseLayerDto[]> {
    // Simulate API delay
    await this.delay(300);
    console.log(`🔧 Mock: Fetching all ${this.schemaType} layers`, this.mockData);
    return [...this.mockData];
  }

  async fetch(id: string): Promise<BaseLayerDto> {
    await this.delay(200);
    const layer = this.mockData.find(l => l.id === id);
    if (!layer) {
      throw new Error(`Layer with id ${id} not found`);
    }
    console.log(`🔧 Mock: Fetching ${this.schemaType} layer ${id}`, layer);
    return { ...layer };
  }

  async add(resource: BaseLayerDto): Promise<BaseLayerDto> {
    await this.delay(500);
    const newLayer = {
      ...resource,
      id: String(Date.now()), // Generate simple ID
      type: this.schemaType.toUpperCase()
    };
    this.mockData.push(newLayer);
    console.log(`🔧 Mock: Created new ${this.schemaType} layer`, newLayer);
    return { ...newLayer };
  }

  async update(id: string, resource: any): Promise<BaseLayerDto> {
    await this.delay(400);
    const index = this.mockData.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Layer with id ${id} not found`);
    }

    const updatedLayer = {
      ...resource,
      id,
      type: this.schemaType.toUpperCase()
    };
    this.mockData[index] = updatedLayer;
    console.log(`🔧 Mock: Updated ${this.schemaType} layer ${id}`, updatedLayer);
    return { ...updatedLayer };
  }

  async delete(id: string): Promise<void> {
    await this.delay(300);
    const index = this.mockData.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Layer with id ${id} not found`);
    }

    const deletedLayer = this.mockData[index];
    this.mockData.splice(index, 1);
    console.log(`🔧 Mock: Deleted ${this.schemaType} layer ${id}`, deletedLayer);
  }

  async duplicate(id: string): Promise<BaseLayerDto> {
    await this.delay(400);
    const originalLayer = this.mockData.find(l => l.id === id);
    if (!originalLayer) {
      throw new Error(`Layer with id ${id} not found`);
    }

    const duplicatedLayer = {
      ...originalLayer,
      id: String(Date.now()),
      name: `${originalLayer.name}_copy`,
      title: `${originalLayer.title} (Copy)`
    };

    this.mockData.push(duplicatedLayer);
    console.log(`🔧 Mock: Duplicated ${this.schemaType} layer ${id}`, duplicatedLayer);
    return { ...duplicatedLayer };
  }

  getSchemaType(): string {
    return this.schemaType;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create mock services for different schema types
 */
export const createMockGenericLayerService = (schemaType: string): MockGenericLayerService => {
  return new MockGenericLayerService(schemaType);
};

// Pre-created mock services for common schema types
export const MockGeoJSONLayerService = createMockGenericLayerService('geojson');
export const MockGPXLayerService = createMockGenericLayerService('gpx');
export const MockTopoJSONLayerService = createMockGenericLayerService('topojson');