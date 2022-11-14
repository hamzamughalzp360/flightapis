const originInput = document.getElementById("origin-input");
const originOptions = document.getElementById("origin-options");
const destinationInput = document.getElementById("destination-input");
const destinationOptions = document.getElementById("destination-options");
const flightTypeSelect = document.getElementById("flight-type-select");
const departureDateInput = document.getElementById("departure-date-input");
const returnDate = document.getElementById("return-date");
const returnDateInput = document.getElementById("return-date-input");
const travelClassSelect = document.getElementById("travel-class-select");
const adultsInput = document.getElementById("adults-input");
const childrenInput = document.getElementById("children-input");
const infantsInput = document.getElementById("infants-input");
const searchButton = document.getElementById("search-button");
const searchResultsSeparator = document.getElementById(
  "search-results-separator"
);
const searchResultsLoader = document.getElementById("search-results-loader");
const searchResults = document.getElementById("search-results");
const autocompleteTimeout = 300;
let autocompleteTimeoutHandle = 0;
let destinationCityCodes = {};
let originCityCodes = {};

const reset = () => {
  originInput.value = "";
  destinationInput.value = "";
  flightTypeSelect.value = "one-way";
  departureDateInput.valueAsDate = new Date();
  returnDateInput.valueAsDate = new Date();
  returnDate.classList.add("d-none");
  travelClassSelect.value = "ECONOMY";
  adultsInput.value = 1;
  childrenInput.value = 0;
  infantsInput.value = 0;
  searchButton.disabled = true;
  searchResultsSeparator.classList.add("d-none");
  searchResultsLoader.classList.add("d-none");
};
const formatDate = (date) => {
  const [formattedDate] = date.toISOString().split("T");
  return formattedDate;
};
const formatNumber = (number) => {
  return `${Math.abs(parseInt(number))}`;
};
const autocomplete = (input, datalist, cityCodes, Check) => {
  clearTimeout(autocompleteTimeoutHandle);
  autocompleteTimeoutHandle = setTimeout(async () => {
    try {
      const params = new URLSearchParams({ keyword: input.value });
      const response = await fetch(`/api/autocomplete?${params}`);
      const data = await response.json();
      datalist.textContent = "";
      data.forEach((entry) => {
        cityCodes[entry.name.toLowerCase()] = entry.city_code;
        if (Check == 'origin') {

          originInput.setAttribute('flightData', entry.city_code)
        } else if (Check == 'destination') {
          destinationInput.setAttribute('flightData1', entry.city_code)
        }
        datalist.insertAdjacentHTML(
          "beforeend",
          `<option value="${entry.name}" dataairport="${entry.city_code}" ></option>`
        );

      });
    } catch (error) {
      console.error(error);
    }
  }, autocompleteTimeout);
};
const search = async () => {
  try {
    const returns = flightTypeSelect.value === "round-trip";
    const params = new URLSearchParams({
      origin: originInput.getAttribute('flightData'),
      destination: destinationInput.getAttribute('flightData1'),
      departureDate: formatDate(departureDateInput.valueAsDate),
      adults: formatNumber(adultsInput.value),
      children: formatNumber(childrenInput.value),
      infants: formatNumber(infantsInput.value),
      travelClass: travelClassSelect.value,
      ...(returns
        ? { returnDate: formatDate(returnDateInput.valueAsDate) }
        : {}),
    });
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    };
    
    let result = await axios.get(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${originInput.getAttribute('flightData')}&destination=${destinationInput.getAttribute('flightData1')}&unique=false&sorting=price&direct=false&currency=usd&limit=30&page=1&token=aebed97e88519a5cb765d5c68866a86b`,config)
    const response = await fetch(`/api/search?${result.data}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};
const showResults = (results) => {
  if (results.length === 0) {
    searchResults.insertAdjacentHTML(
      "beforeend",
      `<li class="list-group-item d-flex justify-content-center align-items-center" id="search-no-results">
        No results
      </li>`
    );
  }
  searchResults.insertAdjacentHTML(
    "beforeend",
    `<li style="padding: 0.5rem 2.2rem;" class="flex-column flex-sm-row flex-wrap list-group-item gap-2 d-flex justify-content-between align-items-sm-center">
        ${results.data.map(({ origin, destination, price, flight_number, link, airline, duration }, index) => {
      return `
           
      <div class="row " style="width: 50%;">
      <div class="col-sm-3 align-items-center bg-secondary  text-center d-flex justify-content-center "
        style="width: 230px; border-radius: 0rem 1rem; >
        <div class="">
          <button class="bg-danger text-white border-0 py-2 px-5  rounded"
            style="font-size: large;font-weight: bold;">Book <br>${price}</button>
          <p class="text-white" style="font-weight: bold;">FLYdubai</p>
        </div>
      </div>
      <div class="col-sm-7 bg-primary ">
        <div class="">
          <div class="card " >
            <ul class="list-group list-group-flush">
              <li class="list-group-item  d-flex justify-content-between">
                <span>${origin}</span>
                <span>TO</span>
                <span>${destination}</span>
              </li>
              <li class="list-group-item  d-flex justify-content-between"><span>Flight Number</span>
                <span>${flight_number}</span></li>
              <li class="list-group-item  d-flex justify-content-between"> <span>Airline</span> <span>${airline}</span>
              </li>
              <li class="list-group-item  d-flex justify-content-between"><span>Time </span>
                <span>${timeConvert(duration)}</span></li>
              <li class="list-group-item  d-flex justify-content-between">
                 <a href="https://www.aviasales.com${link}" class="btn btn-primary">Ticket</a>
                </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
          `;
    })
      .join("")}
      </li>`
  );
};
function timeConvert(n) {
  var num = n;
  var hours = (num / 60);
  var rhours = Math.floor(hours);
  var minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  return rhours + " hour(s) and " + rminutes + " minute(s).";
}


document.body.addEventListener("change", () => {
  clearTimeout(autocompleteTimeoutHandle);
  searchButton.disabled = !originInput.value || !destinationInput.value;
});
originInput.addEventListener("input", () => {
  let originCheck = 'origin';
  autocomplete(originInput, originOptions, originCityCodes, originCheck);
});
destinationInput.addEventListener("input", () => {
  let destinationCheck = 'destination';
  autocomplete(destinationInput, destinationOptions, destinationCityCodes, destinationCheck);
});
flightTypeSelect.addEventListener("change", () => {
  if (flightTypeSelect.value === "one-way") {
    returnDate.classList.add("d-none");
  } else {
    returnDate.classList.remove("d-none");
  }
});
searchButton.addEventListener("click", async () => {
  searchResultsSeparator.classList.remove("d-none");
  searchResultsLoader.classList.remove("d-none");
  searchResults.textContent = "";

  const results = await search();

  searchResultsLoader.classList.add("d-none");
  showResults(results);
});

reset();
