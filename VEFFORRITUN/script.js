// Function to create a raindrop element
function createRaindrop() {
    const raindrop = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    raindrop.setAttribute("class", "raindrop");
    raindrop.setAttribute("cx", Math.random() * 800); // Random X position within the SVG width
    raindrop.setAttribute("cy", -10); // Start raindrop above the SVG
    raindrop.setAttribute("r", 2); // Raindrop radius
    document.getElementById("rainSvg").appendChild(raindrop);
  }
  
  // Function to generate multiple raindrops
  function generateRain() {
    setInterval(createRaindrop, 200); // Adjust the interval for the rate of raindrop generation
  }
  
  // Call the function to start the rain animation
  generateRain();
  