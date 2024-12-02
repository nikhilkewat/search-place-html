const API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";
const API_KEY = "b4e1ee2c6fmsh994c605aa8251c0p1c32dajsn1b2976de7367";
const API_HOST = "wft-geo-db.p.rapidapi.com";

let debounceTimer;
let currentPage = 1;
let totalResults = [];
let itemsPerPage = 3;

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const tableBody = document.getElementById("table-body");
const spinner = document.getElementById("spinner");
const paginationContainer = document.getElementById("pagination-container");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const itemsPerPageInput = document.getElementById("items-per-page");

const fetchCities = async (query, limit) => {
  if (!query) return [];

  spinner.classList.remove("hidden");
  try {
    const response = await fetch(
      `${API_URL}?namePrefix=${query}&limit=${limit}`,
      {
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": API_HOST,
        },
      }
    );

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  } finally {
    spinner.classList.add("hidden");
  }
};

const updateTable = () => {
  tableBody.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const pageResults = totalResults.slice(start, start + itemsPerPage);

  if (pageResults.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" class="no-results">No results found</td></tr>`;
    paginationContainer.classList.add("hidden");
    return;
  }

  pageResults.forEach((city, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>${city.name}</td>
        <td>
          ${city.country} 
          <img src="https://flagsapi.com/${city.countryCode}/flat/32.png" alt="${city.country}" />
        </td>
      </tr>
    `;
  });

  paginationContainer.classList.remove("hidden");
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * itemsPerPage >= totalResults.length;
};

const handleSearch = async () => {
  const query = searchBox.value.trim();
  if (!query) {
    tableBody.innerHTML = `<tr><td colspan="3" class="no-results">Start searching</td></tr>`;
    return;
  }

  totalResults = await fetchCities(query, 10); // Fetch max results for pagination
  currentPage = 1;
  updateTable();
};

searchBtn.addEventListener("click", handleSearch);

searchBox.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(handleSearch, 500);
});

itemsPerPageInput.addEventListener("change", (e) => {
  itemsPerPage = Math.min(Math.max(parseInt(e.target.value) || 3, 3), 10);
  currentPage = 1;
  updateTable();
});

prevBtn.addEventListener("click", () => {
  currentPage--;
  updateTable();
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  updateTable();
});

const handleKeyShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "/") {
    event.preventDefault();
    searchBox.focus();
  }
};
