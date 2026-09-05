export type BaseTileKey = 'dark' | 'satellite' | 'terrain' | 'streets';

export interface BaseTileConfig {
  key: BaseTileKey;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

export const BASE_TILES: Record<BaseTileKey, BaseTileConfig> = {
  dark: {
    key: 'dark',
    name: 'EOC Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap &copy; NER LandslideGuard EOC',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  satellite: {
    key: 'satellite',
    name: 'Esri Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Earthstar Geographics &copy; Maxar',
    maxZoom: 19,
  },
  terrain: {
    key: 'terrain',
    name: 'Topographic Contours',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap &copy; OpenStreetMap contributors',
    maxZoom: 17,
  },
  streets: {
    key: 'streets',
    name: 'Carto Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: 'abcd',
  },
};
