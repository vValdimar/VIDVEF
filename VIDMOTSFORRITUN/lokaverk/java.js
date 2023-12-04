
let map;
let isMapVisible = false;

function initMap() {
  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Initialize the map with the user's location
        map = new google.maps.Map(document.getElementById('map'), {
          center: userLocation,
          zoom: 12
        });

        // Display initial center coordinates
        displayCenterCoordinates();
        displayWeatherResults();
        displayCountry();

        // Add an event listener to update coordinates when the map is moved
        map.addListener('center', () => {
            const center = map.getCenter();
            displayCenterCoordinates();
            addMarker(center);
        });
      },
      (error) => {
        console.error('Error getting user location:', error);
        // Default to a fallback location if geolocation fails
        initFallbackMap();
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    // Default to a fallback location if geolocation is not supported
    initFallbackMap();
  }
}

function initFallbackMap() {
  // Default to a fallback location (e.g., city center)
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 12
  });

  // Display initial center coordinates
  displayCenterCoordinates();

  // Add an event listener to update coordinates when the map is moved
  map.addListener('idle', () => {
    const center = map.getCenter();
    displayCenterCoordinates();
    addMarker(center);
  });
}

function adjustLongitude(longitude) {
    return (longitude + 180) % 360 - 180;
}

function displayCountry() {
  const geocoder = new google.maps.Geocoder();
  const center = map.getCenter();

  geocoder.geocode({ location: { lat: center.lat(), lng: adjustLongitude(center.lng()) } }, (results, status) => {
    if (status === 'OK') {
      const countryComponent = results.find(result =>
        result.types.includes('country')
      );

      const countryName = countryComponent ? countryComponent.formatted_address : 'N/A';
      document.getElementById('countryName').innerText = countryName;
    } else {
      console.error('Geocode was not successful for the following reason:', status);
      document.getElementById('countryName').innerText = 'N/A';
    }
  });
}

function displayCenterCoordinates() {
  const center = map.getCenter();
  document.getElementById('latlng').innerText = center.lat() + ', ' + adjustLongitude(center.lng());
}

function toggleMap() {
  const mapContainer = document.getElementById('map-container');
  const button = document.getElementById('toggle-button');

  isMapVisible = !isMapVisible;

  if (isMapVisible) {
    mapContainer.style.display = 'block';
    button.innerText = 'Toggle Weather';
  } else {
    mapContainer.style.display = 'none';    
    button.innerText = 'Toggle Map';
    displayWeatherResults();
    displayCountry();
  }
}

function displayWeatherResults() {
  const center = map.getCenter();
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${center.lat()}&lon=${center.lng()}&appid=c547660549d1834abba3194d9b68fbad`;

  console.log(apiUrl);

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const unixTime = data.dt + data.timezone;
        const date = new Date(unixTime * 1000);
        document.getElementById("city").innerText = data.name;
        document.getElementById("time").innerText = date.toLocaleTimeString('en-US');

        const midDay = (data.sys.sunrise + data.sys.sunset)/2;
        console.log(Math.abs(data.dt - midDay));
    })
    .catch(error => {
        console.log('Error...', error);
    })
}