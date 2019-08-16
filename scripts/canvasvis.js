console.clear();
// import framework
import Vis from "/modules/Vis.js";

// setup
const visEl = document.querySelector("#visual");
// setup 2D canvas plus resize
// set up dpr for  vis
const dpr = window.devicePixelRatio;
// get window dimensions & set canvas to fill window
function Dimensions() {
  this.width = window.innerWidth * dpr;
  this.height = window.innerHeight * dpr;
  this.centerX = this.width / 2;
  this.centerY = this.height / 2;

  this.setFullscreen = function(el) {
    el.width = this.width;
    el.height = this.height;
  };

  this.update = function() {
    this.width = window.innerWidth * dpr;
    this.height = window.innerHeight * dpr;
  };
}

let screenDim = new Dimensions();
screenDim.setFullscreen(visEl);
window.addEventListener(
  "resize",
  function(e) {
    screenDim.update();
    screenDim.setFullscreen(visEl);
    init();
  },
  false
);
const ctx = visEl.getContext("2d");
// set up canvas defaults
ctx.lineWidth = 0.0;
ctx.lineCap = "round";
ctx.lineJoin = "round";

const binSize = 128;
const elAmount = Math.floor(binSize / 3); // Returned frequncies is a third

// create a new vis
const vis = new Vis(binSize, "99511020"); //, "/beast.mp3");
const { width, height } = screenDim;

// setup our draw loop: THIS IS WHERE THE MAGIC HAPPENS!!
vis.draw(() => {
  ctx.clearRect(0, 0, width, height);
  // loop over our frequencies and draw a shape for each one
  vis.frequencies.forEach((frequency, i) => {
    ctx.beginPath();
    ctx.fillStyle = "blue";
    const offset = i * 10;
    ctx.arc(width / 2 + offset, height / 2 + offset, frequency, 0, 5);
    ctx.fill();
    ctx.closePath();
  });
});

// ===================== CONTROLS edit here if you want to start/stop multiple vis
const controls = document.querySelector("#controls");

controls
  .querySelector('[data-control="play"]')
  .addEventListener("click", function(e) {
    if (this.dataset.on === "false") {
      this.dataset.on = "true";
      vis.start();
    } else {
      this.dataset.on = "false";
      vis.stop();
    }
  });
