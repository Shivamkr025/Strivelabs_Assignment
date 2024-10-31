function displayCountryDetails(country) {
  const countryDetailsContainer = document.getElementById("country-details");

  countryDetailsContainer.innerHTML = "";

  const countryName = document.createElement("h2");
  countryName.textContent = country.name.common;

  const flag = document.createElement("img");
  flag.src = country.flags.png;
  flag.alt = `${country.name.common} flag`;
  flag.width = 150;

  const region = document.createElement("p");
  region.textContent = `Region: ${country.region}`;

  const population = document.createElement("p");
  population.textContent = `Population: ${country.population.toLocaleString()}`;

  const capital = document.createElement("p");
  capital.textContent = `Capital: ${country.capital ? country.capital[0] : "N/A"}`;

  countryDetailsContainer.appendChild(flag);
  countryDetailsContainer.appendChild(countryName);
  countryDetailsContainer.appendChild(region);
  countryDetailsContainer.appendChild(population);
  countryDetailsContainer.appendChild(capital);
}

document.getElementById("back-button").addEventListener("click", () => {
  window.history.back();
});

document.addEventListener("DOMContentLoaded", () => {
  const countryData = JSON.parse(localStorage.getItem("selectedCountry"));
  if (countryData) {
    displayCountryDetails(countryData);
  } else {
    console.error("No country data found in localStorage.");
  }
});
