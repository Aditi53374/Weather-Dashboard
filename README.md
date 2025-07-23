# Weather Dashboard 🌦️

A real-time, city-based Weather Dashboard with a 7-day forecast, interactive map, error handling, search debounce, responsive UI, and lazy-loading graphics.

## Features
- **City Search with Debounce**: Prevents excessive API calls while typing.
- **Current Weather & 7-Day Forecast**: Powered by OpenWeatherMap.
- **Interactive Map**: Centers on the searched city (Leaflet + OpenStreetMap).
- **Error Handling**: User-friendly messages for invalid input or API issues.
- **Responsive UI**: Mobile-friendly, modern design.
- **Lazy-Loading Graphics**: Weather icons load efficiently.

## Technologies Used
- HTML, CSS, JavaScript (Vanilla)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Leaflet.js](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)

## Setup & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Get an OpenWeatherMap API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api).
   - Go to your [API keys page](https://home.openweathermap.org/api_keys) and copy your key.

3. **Configure the API Key**
   - Open `app.js` in a text editor.
   - Replace the placeholder with your API key:
     ```js
     const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';
     ```

4. **Run the App**
   - Open `index.html` in your browser.
   - Search for any city (e.g., `London`, `Delhi, IN`, `New York, US`).

## Example
![Weather Dashboard Screenshot](assets/screenshot.png)

## Notes
- If a city is not found, try using the format `City, CountryCode` (e.g., `Paris, FR`).
- If you see "Weather data not found" or "Unauthorized", check your API key.
- The app is fully client-side and requires no backend.

## License
[MIT](LICENSE) 