// JavaScript for Using the Map via Mapbox
mapboxgl.accessToken = mapToken; // maptoken comes from the first loaded script in showDetails.ejs
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [-112.3535, 36.2679], // starting position [lng, lat]
  zoom: 9, // starting zoom
});

// Create a new market
const marker = new mapboxgl.Marker({
  color: "#B22222",
})
  .setLngLat([-112.3535, 36.2679])
  .addTo(map);
