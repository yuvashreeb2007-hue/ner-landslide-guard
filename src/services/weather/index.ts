import { WeatherProvider } from './WeatherProvider';
import { MockWeatherProvider } from './MockWeatherProvider';
import { WeatherAdapter } from './WeatherAdapter';
import { 
  NormalizedWeatherData, 
  DistrictWeatherSummary, 
  RawCurrentWeather, 
  RawRainfallData, 
  RawForecastData 
} from './types';
import { NER_DISTRICTS_METADATA } from './weatherData';

/**
 * WeatherService
 * Unified operational facade for meteorological and precipitation intelligence.
 * Decoupled from specific API providers via the WeatherProvider interface.
 */
class WeatherService {
  private provider: WeatherProvider;

  constructor(provider?: WeatherProvider) {
    this.provider = provider || new MockWeatherProvider();
  }

  /**
   * Allows hot-swapping or configuring a new meteorological data provider (e.g., IMD, OpenWeatherMap).
   */
  public setProvider(newProvider: WeatherProvider): void {
    this.provider = newProvider;
  }

  /**
   * Retrieves fully normalized and risk-evaluated weather data for a specific district.
   */
  public async getDistrictWeatherData(district: string): Promise<NormalizedWeatherData> {
    const [rawWeather, rawRainfall, rawForecast] = await Promise.all([
      this.provider.getCurrentWeather(district),
      this.provider.getRainfall(district),
      this.provider.getForecast(district),
    ]);

    return WeatherAdapter.normalize(rawWeather, rawRainfall, rawForecast);
  }

  /**
   * Retrieves summary records for all supported districts across Northeast India.
   */
  public async getAllDistrictsSummary(): Promise<DistrictWeatherSummary[]> {
    const summaries = await Promise.all(
      NER_DISTRICTS_METADATA.map(async (meta) => {
        const data = await this.getDistrictWeatherData(meta.district);
        return WeatherAdapter.toSummary(data);
      })
    );
    return summaries;
  }

  /**
   * Retrieves all normalized district weather datasets.
   */
  public async getAllDistrictsNormalized(): Promise<NormalizedWeatherData[]> {
    const datasets = await Promise.all(
      NER_DISTRICTS_METADATA.map((meta) => this.getDistrictWeatherData(meta.district))
    );
    return datasets;
  }
}

// Global Singleton Instance
export const weatherService = new WeatherService();

// Re-export types and classes for external consumers
export * from './types';
export * from './WeatherProvider';
export * from './MockWeatherProvider';
export * from './WeatherAdapter';
export * from './weatherRiskEngine';
export * from './weatherData';
