import { 
  RawCurrentWeather, 
  RawRainfallData, 
  RawForecastData 
} from './types';

/**
 * Core interface for meteorological data providers.
 * Allows seamless swapping of data providers (e.g. MockWeatherProvider,
 * IMDWeatherProvider, OpenWeatherProvider, ECMWFProvider) without modifying
 * the adapter or frontend consumers.
 */
export interface WeatherProvider {
  /**
   * Fetches current real-time meteorological conditions for a specific district.
   */
  getCurrentWeather(district: string): Promise<RawCurrentWeather>;

  /**
   * Fetches real-time and antecedent rainfall observations (24h, 7d, hourly) for a district.
   */
  getRainfall(district: string): Promise<RawRainfallData>;

  /**
   * Fetches multi-day precipitation and hazard forecast data for a district.
   */
  getForecast(district: string): Promise<RawForecastData>;

  /**
   * Fetches all current weather observations across Northeast India districts.
   */
  getAllDistrictsWeather(): Promise<RawCurrentWeather[]>;
}
