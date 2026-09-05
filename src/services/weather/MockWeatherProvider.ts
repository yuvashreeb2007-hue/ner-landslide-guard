import { WeatherProvider } from './WeatherProvider';
import { 
  RawCurrentWeather, 
  RawRainfallData, 
  RawForecastData 
} from './types';
import { 
  MOCK_RAW_CURRENT_WEATHER, 
  MOCK_RAW_RAINFALL, 
  MOCK_RAW_FORECAST 
} from './weatherData';

/**
 * MockWeatherProvider
 * Implements WeatherProvider to supply high-fidelity meteorological records
 * across Northeast India for immediate offline/production operation.
 */
export class MockWeatherProvider implements WeatherProvider {
  private defaultDistrict = 'Pakyong';

  async getCurrentWeather(district: string): Promise<RawCurrentWeather> {
    // Simulate slight asynchronous network latency
    await new Promise((res) => setTimeout(res, 20));
    const target = MOCK_RAW_CURRENT_WEATHER[district] || MOCK_RAW_CURRENT_WEATHER[this.defaultDistrict];
    return { ...target };
  }

  async getRainfall(district: string): Promise<RawRainfallData> {
    await new Promise((res) => setTimeout(res, 20));
    const target = MOCK_RAW_RAINFALL[district] || MOCK_RAW_RAINFALL[this.defaultDistrict];
    return { ...target };
  }

  async getForecast(district: string): Promise<RawForecastData> {
    await new Promise((res) => setTimeout(res, 20));
    const target = MOCK_RAW_FORECAST[district] || MOCK_RAW_FORECAST[this.defaultDistrict];
    return { ...target };
  }

  async getAllDistrictsWeather(): Promise<RawCurrentWeather[]> {
    await new Promise((res) => setTimeout(res, 20));
    return Object.values(MOCK_RAW_CURRENT_WEATHER).map((item) => ({ ...item }));
  }
}
