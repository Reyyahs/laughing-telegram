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