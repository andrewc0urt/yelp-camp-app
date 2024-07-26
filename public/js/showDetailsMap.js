// JavaScript for Using the Map via Mapbox
mapboxgl.accessToken = mapToken; // maptoken comes from the first loaded script in showDetails.ejs
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Create a new marker
const marker = new mapboxgl.Marker({
  color: "#3bb2d0",
  size: "large",
})
  .setLngLat(campground.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 20, maxWidth: "none" }).setHTML(`<h3> ${campground.title} </h3><p>${campground.location} </p>`)) // sets a popup on this marker
  .addTo(map);
