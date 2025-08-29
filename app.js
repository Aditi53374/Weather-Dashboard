// ========== CONFIGURATION ==========
const OPENWEATHER_API_KEY = 'cca4636adada16b19237e357654a1661'; // <-- Replace with your API key
const CURRENT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

// ========== DOM ELEMENTS ==========
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const mapDiv = document.getElementById('map');

// ========== DEBOUNCE FUNCTION ==========
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ========== MAP INITIALIZATION ==========
let map, marker;
function initMap(lat = 40.7128, lon = -74.0060) { // Default: New York
  if (!map) {
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
  } else {
    map.setView([lat, lon], 10);
    marker.setLatLng([lat, lon]);
  }
}

// ========== FETCH WEATHER DATA ==========
async function fetchCurrentWeather(lat, lon) {
  const url = `${CURRENT_WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Current Weather API error:', res.status, url);
    throw new Error('Current weather data not found.');
  }
  return res.json();
}

async function fetchForecast(lat, lon) {
  const url = `${FORECAST_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Forecast API error:', res.status, url);
    throw new Error('Forecast data not found.');
  }
  return res.json();
}

async function fetchCityCoords(city) {
  // If user enters only city, try with city and then with city + ',country code' (default to US, GB, IN, etc.)
  let url = `${GEO_API_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  let res = await fetch(url);
  let data = await res.json();
  if (!res.ok || !data.length) {
    // Try with common country codes if not found
    const countryCodes = ["US", "GB", "IN", "CA", "AU"];
    for (const code of countryCodes) {
      url = `${GEO_API_URL}?q=${encodeURIComponent(city)},${code}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      res = await fetch(url);
      data = await res.json();
      if (res.ok && data.length) break;
    }
  }
  if (!data.length) throw new Error('City not found. Try "City, CountryCode" (e.g., London, GB)');
  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
}

// ========== RENDER FUNCTIONS ==========
function renderCurrentWeather(data, cityName, country) {
  if (!data || !data.main || !data.weather || !data.weather[0]) {
    throw new Error('Invalid weather data received');
  }
  
  const { temp, humidity } = data.main;
  const { icon, description } = data.weather[0];
  const windSpeed = data.wind ? data.wind.speed : 'N/A';
  
  currentWeatherDiv.innerHTML = `
    <h2>${cityName}, ${country}</h2>
    <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" loading="lazy">
    <div class="temp">${Math.round(temp)}°C</div>
    <div class="desc">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
    <div class="details">
      <span>💧 ${humidity}%</span>
      <span>💨 ${windSpeed} m/s</span>
    </div>
  `;
}

function renderForecast(data) {
  if (!data || !data.list || !Array.isArray(data.list)) {
    throw new Error('Invalid forecast data received');
  }
  
  forecastDiv.innerHTML = '';
  // Group forecast data by day and get daily averages
  const dailyData = {};
  
  data.list.forEach(item => {
    if (!item || !item.main || !item.weather || !item.weather[0]) {
      return; // Skip invalid items
    }
    
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        date: date,
        temps: [],
        icons: [],
        descriptions: []
      };
    }
    
    dailyData[dayKey].temps.push(item.main.temp);
    dailyData[dayKey].icons.push(item.weather[0].icon);
    dailyData[dayKey].descriptions.push(item.weather[0].description);
  });
  
  // Get next 7 days (skip today)
  const today = new Date().toDateString();
  const next7Days = Object.values(dailyData)
    .filter(day => day.date.toDateString() !== today)
    .slice(0, 7);
  
  next7Days.forEach(day => {
    if (day.temps.length === 0) return; // Skip days with no data
    
    const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
    const mostCommonIcon = day.icons[Math.floor(day.icons.length / 2)] || '01d'; // Use middle icon or default
    const desc = day.descriptions[0] || 'Clear sky';
    
    forecastDiv.innerHTML += `
      <div class="forecast-day">
        <div>${day.date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
        <img src="https://openweathermap.org/img/wn/${mostCommonIcon}@2x.png" alt="${desc}" loading="lazy">
        <div>${avgTemp}°C</div>
        <div class="desc">${desc.charAt(0).toUpperCase() + desc.slice(1)}</div>
      </div>
    `;
  });
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}
function clearError() {
  errorMessage.textContent = '';
  errorMessage.style.display = 'none';
}

// ========== MAIN SEARCH FUNCTION ==========
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    showError('Please enter a city name.');
    return;
  }
  clearError();
  currentWeatherDiv.innerHTML = '';
  forecastDiv.innerHTML = '';
  try {
    const { lat, lon, name, country } = await fetchCityCoords(city);
    const [currentWeatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchForecast(lat, lon)
    ]);
    renderCurrentWeather(currentWeatherData, name, country);
    renderForecast(forecastData);
    initMap(lat, lon);
  } catch (err) {
    showError(err.message);
  }
}

// ========== EVENT LISTENERS ==========
const debouncedSearch = debounce(handleSearch, 600);
searchBtn.addEventListener('click', debouncedSearch);
cityInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') debouncedSearch();
});

// ========== INITIAL LOAD ==========
window.addEventListener('DOMContentLoaded', () => {
  initMap();
}); 