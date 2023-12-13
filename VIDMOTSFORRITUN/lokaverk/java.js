let map;
let isMapVisible = false;

var script = document.createElement('script');
script.async = true;
script.defer = true;
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCQsS8D7X9PRDrtg64mkCSgy0NPVI0IuXE&libraries=places&callback=initMap`;
document.head.appendChild(script);

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        map = new google.maps.Map(document.getElementById('map'), {
          center: userLocation,
          zoom: 12
        });

        displayWeatherResults();
        displayCountry();

      },
      (error) => {
        console.error('Error getting user location:', error);
        initFallbackMap();
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    initFallbackMap();
  }
}

function initFallbackMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 0, lng: 0 },
    zoom: 12
  });
}

function adjustLongitude(longitude) {
    return (longitude % 360 + 540) % 360 - 180;
}

function setColors(sunHeight) {
  sunHeight = (1-sunHeight/200)*200;
  document.getElementById('weatherstuff').style.opacity = `${sunHeight}%`
  document.body.style.background = `linear-gradient(to bottom,
  rgb(${sunHeight/1.5}, ${sunHeight/1.25}, ${sunHeight*1.25}), 
  rgb(${10+sunHeight*3}, ${10+sunHeight*2.5}, ${50+sunHeight*1.5}))`;
  document.getElementById('sun').setAttribute('cy', `${120-sunHeight/2}%`)
  document.getElementById('ground').setAttribute('fill', `rgb(${20+sunHeight/2}, ${20+sunHeight}, ${20+sunHeight/2})`)
}

const cloudsLeft = document.getElementById('left');
const cloudsRight = document.getElementById('right');

function moveClouds(onScreen) {

  [cloudsLeft, cloudsRight].forEach(side => {
    const clouds = side.getElementsByTagName('ellipse');
    const offScreenX = side.getAttribute('data-offscreen-x');

    for (const cloud of clouds) {
      const cloudX = cloud.getAttribute('data-cx');

      if (onScreen) {
        cloud.setAttribute('cx', cloudX);
      } else {
        cloud.setAttribute('cx', offScreenX);
      }
    }
  })
}

let isSnow = false;
let raining = false;
const rainbox = document.getElementById("rainbox");

function createRaindrop() {
  if (!raining) { return; }
  
  const raindrop = document.createElementNS("http://www.w3.org/2000/svg", "line");
  raindrop.setAttribute("class", (isSnow ? "snowflake": "raindrop"));
  raindrop.setAttribute("x1", `${Math.random() *100}vw`);
  raindrop.setAttribute("y1", 0);
  raindrop.setAttribute("x2", raindrop.getAttribute("x1"));
  raindrop.setAttribute("y2", (isSnow ? 10: 40));
  rainbox.appendChild(raindrop);

  const animation = raindrop.animate(
    [
      { transform: "translateY(0)" },
      { transform: `translateY(100vh)` }
    ],
    {
      duration: Math.random() * 500 + (isSnow ? 500 : 100)
    }
  );
  animation.addEventListener('finish', () => {
    raindrop.remove();  
  })
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
      document.getElementById('country').innerText = countryName;
    } else {
      console.error('Geocode was not successful for the following reason:', status);
      document.getElementById('country').innerText = 'N/A';
    }
  });
}

function toggleMap() {
  const mapContainer = document.getElementById('map-container');

  isMapVisible = !isMapVisible;

  if (isMapVisible) {
    mapContainer.style.display = 'block';
    stuff.style.display = 'none'
    icon.setAttribute('src', 'https://raw.githubusercontent.com/vValdimar/VIDVEF/main/VIDMOTSFORRITUN/weather%20icon.png');
  } else {
    mapContainer.style.display = 'none';
    stuff.style.display = 'initial'   
    icon.setAttribute('src', 'https://raw.githubusercontent.com/vValdimar/VIDVEF/main/VIDMOTSFORRITUN/map%20icon.png');
    displayWeatherResults();
    displayCountry();
  }
}

function displayWeatherResults() {
  const center = map.getCenter();
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${center.lat()}&lon=${adjustLongitude(center.lng())}&appid=c547660549d1834abba3194d9b68fbad`;

  console.log(apiUrl);

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        const unixTime = data.dt + data.timezone;
        const date = new Date(unixTime * 1000);
        var bbox = arrow.getBBox();
        const centerX = bbox.x + bbox.width * 0.51;
        const centerY = bbox.y + bbox.height * 0.53;
        const weatherMain = data.weather[0].main;
        document.getElementById("city").innerText = data.name;
        document.getElementById("time").innerText = date.toLocaleTimeString('en-US');
        document.getElementById("temperature").innerText = `${(data.main.temp-273.15).toFixed(1)}°C`
        document.getElementById("weather").innerText = weatherMain;
        document.getElementById("weathericon").setAttribute('src', `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`)
        document.getElementById("arrow").setAttribute('transform', `rotate(${data.wind.deg-90} ${centerX} ${centerY})`);
        document.getElementById("wind").innerText = `${data.wind.speed}m/s`;


        const midDay = (data.sys.sunrise + data.sys.sunset)/2;
        const sunLevel = (Math.abs(data.dt - midDay));
        setColors(Math.round(sunLevel/43200*200));
        moveClouds(["Clouds", "Rain", "Snow"].includes(weatherMain));
        rainbox.innerHTML = ''
        isSnow = weatherMain == "Snow";
        raining = ["Snow", "Rain"].includes(weatherMain);
        console.log(isSnow, weatherMain);
        
    })
    .catch(error => {
        console.log('Error...', error);
    })
}
setInterval(createRaindrop, (isSnow ? 40: 10));