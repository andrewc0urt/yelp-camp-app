// SPECIFICALLY FOR THE EDIT CAMPGROUND PAGE
// JavaScript for the Mapbox Geooder API: mapbox-search-js Geocoding

const script = document.getElementById("search-js");
// wait for the Mapbox Search JS script to load before using it
script.onload = function () {
  // select the MapboxGeocoder instance
  const geocoder = document.querySelector("mapbox-geocoder");

  // set the options property
  geocoder.options = {
    language: "en",
    country: "US",
  };

  // select the div containing the MapboxGeocoder instance
  const mapboxContainer = document.querySelector("#mapbox-container");

  // select the location input element from the form; it is set with a hidden attribute to start
  const locationInputElement = document.querySelector("#location");

  // Check if we're on the edit campground page
  const isEditPage = document.querySelector("#edit-campground-form");

  if (isEditPage) {
    // Get the location input element
    const locationInputElement = document.getElementById("location"); // Assuming the element ID

    if (locationInputElement.value) {
      // If there's a pre-populated value in the location input
      showLocationInput(); // Assuming this function shows the location input element

      locationInputElement.addEventListener("focus", () => {
        // When the location input is focused (clicked)
        hideLocationInput(); // Assuming this function hides the location input element and shows the mapbox-geocoder
        console.log(locationInputElement.value); // Optional: Log the current location value

        // Perform a search on the mapbox-geocoder using the pre-populated location value
        geocoder.search(locationInputElement.value);
      });
    }
  }

  // Function to show the location input element and hide the mapbox-geocoder element
  function showLocationInput() {
    // Remove the "hidden" attribute from the locationInputElement
    // This makes the location input element visible.
    locationInputElement.removeAttribute("hidden");

    // Set the "hidden" attribute on the mapboxContainer element to "true"
    // This hides the mapbox-geocoder element.
    mapboxContainer.setAttribute("hidden", true);
  }

  // Function to hide the location input element and show the mapbox-geocoder element
  function hideLocationInput() {
    // Set the "hidden" attribute on the locationInputElement element to "true"
    // This hides the location input element.
    locationInputElement.setAttribute("hidden", true);

    // Remove the "hidden" attribute from the mapboxContainer element
    // This makes the mapbox-geocoder element visible.
    mapboxContainer.removeAttribute("hidden");

    // Set focus on the mapbox-geocoder element
    // This allows the user to start typing immediately after showing the mapbox-geocoder.
    geocoder.focus();
  }

  // On the Edit page, always display the campground location (the locationInputElement)
  //   showLocationInput();

  // Identify the clear button element within the mapbox-geocoder component
  const clearButton = geocoder.querySelector("[aria-label='Clear']");

  // Add an event listener to the clear button for the 'click' event
  clearButton.addEventListener("click", (event) => {
    // Prevent the default form submission behavior when the clear button is clicked
    event.preventDefault();

    // Clear the value of the location input element
    locationInputElement.value = "";
  });

  // Add an event listener to the mapbox-geocoder element for the 'retrieve' event
  geocoder.addEventListener("retrieve", (e) => {
    // Access the retrieved geojson data from the event details
    const feature = e.detail;

    // Extract the full address from the retrieved feature's properties
    const fullAddress = feature.properties.full_address;

    // Update the location input element's value with the full address
    locationInputElement.value = fullAddress;
  });

  // Select the element with the ID "add-campground-button"
  const updateCampgroundButton = document.querySelector("#update-campground-button");

  // Add an event listener to the button for the 'click' event
  updateCampgroundButton.addEventListener("click", (clickEvent) => {
    // Check if the location input element has a value (i.e., if a location is selected)
    if (!locationInputElement.value) {
      // If there's no value, call the showLocationInput function to display the input field
      showLocationInput();

      // Uncomment the following line to prevent default form submission if there's no location
      // clickEvent.preventDefault();
    }
  });
};
