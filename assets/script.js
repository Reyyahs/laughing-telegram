// DOM element selections
const searchInput = document.querySelector(".inputValue");
const searchBtn = document.querySelector(".searchBtn");
const currentDate = moment();
const cityDateIcon = document.querySelector(".city-date-icon");
const topContainer = document.querySelector(".current-weather");
const temp = document.querySelector(".temp");
const humidity = document.querySelector(".humidity");
const wind = document.querySelector(".wind");
const uvi = document.querySelector(".uvi");
const recentContainer = document.querySelector("#recent");
const inputValue = document.querySelector("#inputValue");
const clear = document.querySelector("#clearHistory");

// Load recent searches from local storage or initialize an empty array
const recentSearches = JSON.parse(localStorage.getItem("recents")) || [];

// Render the list of recent searches in the UI
renderRecents();

function renderRecents() {
  recentContainer.innerHTML = "";

  // Loop through recent searches and create input elements for each
  recentSearches.forEach((city) => {
    const recentInput = document.createElement("input");
    recentInput.type = "text";
    recentInput.readOnly = true;
    recentInput.className = "form-control-lg text-black";
    recentInput.value = city;
    
    // Add click event listener to perform a search when clicked
    recentInput.addEventListener("click", () => {
      getWeather(city);
    });
    
    // Append the input element to the recentContainer
    recentContainer.appendChild(recentInput);
  });
}

// Event handler for the search form submission
const searchSubmitHandler = (event) => {
  event.preventDefault();

  const city = searchInput.value.trim();

  if (city) {
    getCityWeather(city);
    searchInput.value = "";
  } else {
    alert("Please enter a city!");
  }
};
// Get weather information for a city from the OpenWeatherMap API
const getWeather = async (city) => {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=274430606889ac1bc7c52608988ee8ae`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    const { name: nameValue, main, wind: windValue, coord, weather } = data;
    const { temp: tempValue, humidity: humidityValue } = main;
    const { speed: windSpeed } = windValue;
    const { lat, lon } = coord;
    const icon = weather[0].icon;

    // Construct the weather icon URL
    const weatherURL = `https://openweathermap.org/img/wn/${icon}.png`;
    const iconImage = `<img src="${weatherURL}"/>`;

    // Update the UI with weather information
    cityDateIcon.innerHTML = `${nameValue} ${currentDate.format(" (M/DD/YYYY) ")} ${iconImage}`;
    temp.innerHTML = `Temperature: ${tempValue} °F`;
    humidity.innerHTML = `Humidity: ${humidityValue}%`;
    wind.innerHTML = `Wind Speed: ${windSpeed} MPH`;
    topContainer.classList.remove("hide");

    // Save the searched city in local storage and update recent searches
    setLocalStorage(city);
    renderRecents();
    
    // Get UV index information and update the forecast
    await uvIndex(lat, lon);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Store a city in local storage if it's not already included
const setLocalStorage = (city) => {
  if (!recentSearches.includes(city)) {
    recentSearches.push(city);
    localStorage.setItem("recents", JSON.stringify(recentSearches));
  }
};

// Add click event listener to the search button
searchBtn.addEventListener("click", () => {
  const userInput = inputValue.value.trim();
  if (userInput !== "") {
    getWeather(userInput);
    inputValue.value = "";
  } else {
    alert("Please enter a city!");
  }
});

// Add click event listener to the clear history button
clear.addEventListener("click", () => {
  localStorage.removeItem("recents");
  recentSearches.length = 0;
  renderRecents();
});

// Get UV index and 5-day forecast data
const uvIndex = async (lat, lon) => {
  try {
    const uviUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=274430606889ac1bc7c52608988ee8ae`;
    const response = await fetch(uviUrl);
    
    if (response.ok) {
      const data = await response.json();
      const { current, daily } = data;
      const { uvi: uviValue } = current;
      
      // Apply different styles to UV index badge based on its value
      const uviLine = document.querySelector(".uviValue");
      uviLine.textContent = uviValue;
      if (uviValue >= 8) {
        uviLine.classList.add("badge", "badge-danger");
      } else if (uviValue >= 6) {
        uviLine.classList.add("badge", "badge-warning");
      } else if (uviValue >= 3) {
        uviLine.classList.add("badge", "badge-success");
      } else {
        uviLine.classList.add("badge", "badge-info");
      }
      
      // Generate HTML for the 5-day forecast cards
      const fiveDayCardContainer = document.querySelector("#cards");
      fiveDayCardContainer.innerHTML = daily.slice(0, 5).map((cardData) => {
        const { temp: { day: cardTemp }, humidity: cardHumidity, weather } = cardData;
        const iconImage = weather[0].icon;
        const weatherURL = `https://openweathermap.org/img/wn/${iconImage}.png`;
        const icon = `<img src="${weatherURL}" style="width: 75px"/>`;
        
        return `
          <div class="card fiveDayCard" style="flex: 1">
            <h4 class="dateHeader">${moment(new Date(cardData.dt * 1000)).format(" M/DD/YYYY")}</h4>
            ${icon}
            <p>Temp: ${cardTemp}&deg;F</p>
            <p>Humidity: ${cardHumidity}%</p>
          </div>
        `;
      }).join("");
    }
  } catch (error) {
    console.error(error);
  }
};
