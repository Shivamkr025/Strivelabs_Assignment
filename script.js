// Get DOM elements
const countryList = document.getElementById("country-list");
const searchInput = document.getElementById("search");
const regionFilter = document.getElementById("region-filter");
const languageFilter = document.getElementById("language-filter");
const loadMoreButton = document.getElementById("load-more");
const suggestionBox = document.getElementById("suggestion-box");

let countries = [];
let filteredCountries = [];
let displayedCountries = 0;
const countriesPerPage = 10;

// Fetch country data from the API
async function fetchCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    countries = await response.json();
    filteredCountries = countries;
    populateLanguageFilter();
    displayCountries();
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}

// Populate the language filter dropdown
function populateLanguageFilter() {
  const languages = new Set();

  countries.forEach(country => {
    if (country.languages) {
      Object.values(country.languages).forEach(language => {
        languages.add(language);
      });
    }
  });

  languages.forEach(language => {
    const option = document.createElement("option");
    option.value = language;
    option.textContent = language;
    languageFilter.appendChild(option);
  });
}

// Display countries on the page
function displayCountries() {
  const countriesToDisplay = filteredCountries.slice(displayedCountries, displayedCountries + countriesPerPage);

  countriesToDisplay.forEach(country => {
    const countryCard = document.createElement("div");
    countryCard.className = "country-card";

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.some(fav => fav.name.common === country.name.common);
    const heartIconClass = isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const heartIconColor = isFavorite ? "color: #ff0000;" : "";

    countryCard.innerHTML = `
    <img class="countriesImage" src="${country.flags.png}" alt="${country.name.common} flag" />
    <div class="country-header">
      <i class="${heartIconClass}" style="${heartIconColor}" onclick="toggleFavorite('${country.name.common}', this)"></i>
      <h2>${country.name.common}</h2>
    </div>
  `;

    countryCard.onclick = () => viewCountryDetails(country.name.common);
    countryList.appendChild(countryCard);
  });

  displayedCountries += countriesToDisplay.length;

  loadMoreButton.style.display = displayedCountries < filteredCountries.length ? "block" : "none";
}

// Filter countries based on search, region, and language
function filterCountries() {
  const searchValue = searchInput.value.toLowerCase();
  const selectedRegion = regionFilter.value;
  const selectedLanguage = languageFilter.value;

  languageFilter.disabled = selectedRegion !== "all" && selectedRegion !== "";
  regionFilter.disabled = !!selectedLanguage;

  filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.common.toLowerCase().includes(searchValue);
    const matchesRegion = selectedRegion === "all" || country.region === selectedRegion;
    const matchesLanguage = !selectedLanguage || (country.languages && Object.values(country.languages).includes(selectedLanguage));
    return matchesSearch && (selectedLanguage ? matchesLanguage : matchesRegion);
  });

  displayedCountries = 0;
  countryList.innerHTML = "";
  displayCountries();

  loadMoreButton.style.display = filteredCountries.length > countriesPerPage ? "block" : "none";

  showSuggestions(searchValue);
}

// Show search suggestions based on user input
function showSuggestions(searchValue) {
  suggestionBox.innerHTML = "";
  if (searchValue) {
    const suggestions = countries
      .filter(country => country.name.common.toLowerCase().includes(searchValue))
      .slice(0, 5);

    suggestions.forEach(country => {
      const suggestionItem = document.createElement("div");
      suggestionItem.textContent = country.name.common;
      suggestionItem.onclick = () => {
        searchInput.value = country.name.common;
        suggestionBox.innerHTML = "";
        filterCountries();
      };
      suggestionBox.appendChild(suggestionItem);
    });
  }
}

// View detailed information about a country
function viewCountryDetails(countryName) {
  const country = countries.find(c => c.name.common === countryName);
  localStorage.setItem("selectedCountry", JSON.stringify(country));
  window.location.href = "country-details.html";
}

// Toggle the favorite status of a country
function toggleFavorite(countryName, iconElement) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const country = countries.find(c => c.name.common === countryName);

  const isFavorite = favorites.some(fav => fav.name.common === country.name.common);

  if (!isFavorite) {
    if (favorites.length < 5) {
      favorites.push(country);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      iconElement.classList.replace("fa-regular", "fa-solid");
      iconElement.style.color = "#ff0000";
    } else {
      alert("You can only have up to 5 favorites.");
    }
  } else {
    favorites = favorites.filter(fav => fav.name.common !== country.name.common);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    iconElement.classList.replace("fa-solid", "fa-regular");
    iconElement.style.color = "";
  }

  populateFavoritesDropdown();
}

// Populate the favorites dropdown menu
function populateFavoritesDropdown() {
  const favoritesMenu = document.getElementById("favoritesMenu");
  favoritesMenu.innerHTML = "";

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    const noFavorites = document.createElement("div");
    noFavorites.textContent = "No favorites added yet.";
    noFavorites.style.padding = "8px 16px";
    favoritesMenu.appendChild(noFavorites);
  } else {
    favorites.forEach(country => {
      const favoriteItem = document.createElement("a");
      favoriteItem.innerHTML = `<i class="fa-solid fa-heart" style="color: #ff0000;"></i> ${country.name.common}`;
      favoritesMenu.appendChild(favoriteItem);
    });
  }
}

// Toggle the visibility of the favorites dropdown
function toggleDropdown() {
  document.getElementById("favoritesMenu").classList.toggle("show");
}

// Close dropdown if the user clicks outside
window.onclick = function(event) {
  if (!event.target.matches('.dropdown-btn')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
}

// Event listeners for filters and search
searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);
languageFilter.addEventListener("change", filterCountries);
loadMoreButton.addEventListener("click", displayCountries);

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchCountries();
  populateFavoritesDropdown();
});
