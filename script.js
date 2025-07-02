const API_KEY = "48a8b8b27c7bf5a2332b70eafbd64e8c";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const forecastResult = document.getElementById("forecastResult");
const forecastCards = document.getElementById("forecastCards");
const recentDropdown = document.getElementById("recentDropdown");

// city name
async function getWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();

    // weather result
    weatherResult.innerHTML = `
      <h2 class="text-xl font-semibold mb-2">${data.name}, ${data.sys.country}</h2>
      <p>🌡️ Temperature: ${data.main.temp}°C</p>
      <p>🌥️ Weather: ${data.weather[0].main}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬️ Wind: ${data.wind.speed} m/s</p>
    `;
    weatherResult.classList.remove("hidden");

    //fetch 5-day forecast
    get5DayForecast(city);
  } catch (error) {
    weatherResult.innerHTML = `<p class="text-red-500">⚠️ ${error.message}</p>`;
    weatherResult.classList.remove("hidden");
  }
}


async function get5DayForecast(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Forecast not available");
    }

    const data = await response.json();
    const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    forecastCards.innerHTML = "";
    dailyForecast.forEach(day => {
      const date = new Date(day.dt_txt).toDateString();
      const icon = day.weather[0].icon;
      const temp = day.main.temp;
      const wind = day.wind.speed;
      const humidity = day.main.humidity;

      forecastCards.innerHTML += `
        <div class="bg-white p-4 rounded-lg shadow-md">
          <h4 class="font-semibold">${date}</h4>
          <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" class="w-16 h-16">
          <p>🌡️ Temp: ${temp}°C</p>
          <p>💧 Humidity: ${humidity}%</p>
          <p>🌬️ Wind: ${wind} m/s</p>
        </div>
      `;
    });

    forecastResult.classList.remove("hidden");
  } catch (error) {
    forecastResult.innerHTML = `<p class="text-red-500">⚠️ ${error.message}</p>`;
    forecastResult.classList.remove("hidden");
  }
}

//  searched city to localStorage
function saveCityToLocalStorage(city) {
  console.log("Saving city:", city); 

  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  console.log("Before filtering:", cities); 

  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  cities = cities.slice(0, 5);

  console.log("After saving:", cities); 

  localStorage.setItem("recentCities", JSON.stringify(cities));

  populateRecentDropdown();
}


// Dropdown recent cities
function populateRecentDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  console.log("Populating dropdown with:", cities); 

  recentDropdown.innerHTML = `<option value="">-- Select a city --</option>`;
  cities.forEach(city => {
    recentDropdown.innerHTML += `<option value="${city}">${city}</option>`;
  });
}


// weather-current location
currentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showWeatherByCoords, showGeoError);
  } else {
    weatherResult.innerHTML = `<p class="text-red-500">Geolocation is not supported</p>`;
    weatherResult.classList.remove("hidden");
  }
});

async function showWeatherByCoords(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Unable to fetch weather");

    const data = await response.json();

    weatherResult.innerHTML = `
      <h2 class="text-xl font-semibold mb-2">${data.name}, ${data.sys.country}</h2>
      <p>🌡️ Temperature: ${data.main.temp}°C</p>
      <p>🌥️ Weather: ${data.weather[0].main}</p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>🌬️ Wind: ${data.wind.speed} m/s</p>
    `;
    weatherResult.classList.remove("hidden");
    forecastResult.classList.add("hidden"); 
  } catch (error) {
    weatherResult.innerHTML = `<p class="text-red-500">⚠️ ${error.message}</p>`;
    weatherResult.classList.remove("hidden");
  }
}

function showGeoError(error) {
  weatherResult.innerHTML = `<p class="text-red-500">⚠️ ${error.message}</p>`;
  weatherResult.classList.remove("hidden");
}


searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") {
    weatherResult.innerHTML = `<p class="text-red-500">⚠️ Please enter a city name</p>`;
    weatherResult.classList.remove("hidden");
    return;
  }

  saveCityToLocalStorage(city);
  getWeatherByCity(city);
});

recentDropdown.addEventListener("change", () => {
  const selectedCity = recentDropdown.value;
  if (selectedCity !== "") {
    getWeatherByCity(selectedCity);
  }
});

window.addEventListener("load", () => {
  populateRecentDropdown();
});
