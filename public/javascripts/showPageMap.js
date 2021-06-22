// <!-- Script for rendering map -->
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 10, // starting zoom
});

new mapboxgl.Marker().setLngLat([-74.5, 40]).addTo(map);
