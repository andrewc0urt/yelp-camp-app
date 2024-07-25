// JavaScript for Using the Map via Mapbox
mapboxgl.accessToken = mapToken; // maptoken comes from the first loaded script in showDetails.ejs
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Create a new market
const marker = new mapboxgl.Marker({
  color: "#B22222",
})
  .setLngLat(campground.geometry.coordinates)
  .addTo(map);
