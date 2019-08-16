console.clear();
// import framework
import Vis from "/modules/Vis.js";

let hueOffset = 0;
let saturation = 50;
let position = 0;
let rotation = 0;
let backgroundHueOffset = 0;
let backgroundSaturation = 0;
let height, width;
const { innerHeight, innerWidth } = window;
let imageMode = false;
let invertMode = false;
let imageIndex = 0;

function setWindow() {
  if (rotation === 0 || rotation === 0.5) {
    height = innerHeight;
    width = innerWidth;
    console.log("regular");
  } else {
    width = innerHeight;
    height = innerWidth;
    console.log("side");
  }
}

setWindow();

// let saturation = 50;

const inputMap = {
  2: leftDial,
  1: rightDial,
  53: top0,
  54: top1,
  60: top2,
  56: top3,
  57: bot0,
  58: bot1,
  59: bot2,
  55: bot3
};

function leftDial(value) {
  hueOffset = (value / 128) * 360;
  console.log("hueOffset", value);
}

function rightDial(value) {
  saturation = (value / 128) * 80 + 20;
  console.log("saturation", saturation);
}

function top0(pressure, value) {
  if (value) {
    position = (position + 1) % 3;
  }
}

function top1(pressure, value) {
  if (value) {
    rotation = (rotation + 0.25) % 1;
  }
}

function top2(pressure, value) {
  if (value) {
    backgroundHueOffset = hueOffset;
  }
}

function top3(pressure, value) {
  if (value) {
    backgroundSaturation = saturation;
  }
}

function bot0(pressure, value) {
  console.log("bot0", value);
  if (value) {
    imageMode = !imageMode;
    imageIndex = (imageIndex + 1) % 16;
    console.log(`imageIndex`, imageIndex);
  }
}

function bot1(pressure, value) {
  console.log("bot1", value);
  if (value) {
    invertMode = !invertMode;
  }
}

function bot2(pressure, value) {
  if (value) {
    backgroundHueOffset = Math.random() * 360;
  }
}

function bot3(pressure, value) {
  if (value) {
    backgroundSaturation = Math.random() * 100;
  }
}

function marginLeft(frequencyIn) {
  const frequency = frequencyIn < 10 ? 10 : frequencyIn;

  switch (position) {
    case 0:
      return 0;
    case 1:
      return width / 2 - frequency;
    case 2:
      return width - frequency;
  }
}

function getWidth(frequencyIn) {
  const frequency = frequencyIn < 10 ? 10 : frequencyIn;

  return position === 1 ? 2 * frequency : frequency;
}

navigator.requestMIDIAccess({ sysex: false }).then(function(access) {
  console.log("access", access);
  // Get lists of available MIDI controllers
  const inputs = Array.from(access.inputs.values());
  //const outputs = Array.from(access.outputs.values());

  inputs[0].onmidimessage = function(message) {
    const data = message.data; // this gives us our [command/channel, note, velocity] data.
    const [buttonValue, input, pressure] = data;
    console.log("MIDI data in", data); // MIDI data [144, 63, 73]

    const value = buttonValue === 144;
    inputMap[input](pressure, value);
  };
});

// setup
const visEl = document.querySelector("#visual");
const binSize = 128;
const buckets = Math.floor(binSize / 3); // Returned frequncies is a third

// make elements
for (let i = 0; i < buckets; i++) {
  // create an element
  const el = document.createElement("i");
  // append it
  visEl.appendChild(el);
}
// get those elements
const allEls = visEl.querySelectorAll("i");

//<iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/99511020&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
// create a new vis
// params: binSize = size of frequency array returned
// soundcloudID: if you want to use a track from soundcloud pass in an id (as a string) here, otherwise mic is used:
// new Vis(binSize, '433074246');
const vis = new Vis(binSize); //, "99511020");
// let hueOffset = 0;
// setup our draw loop: THIS IS WHERE THE MAGIC HAPPENS!!
vis.draw(() => {
  // hueOffset = hueOffset + 1;
  // console.log(vis.frequencies);
  vis.frequencies.forEach((frequencyIn, i) => {
    const frequency = frequencyIn * 2;
    allEls[i].style.marginLeft = marginLeft(frequency) + "px";
    allEls[i].style.width = getWidth(frequency * 2) + "px";
    allEls[i].style.backgroundColor = `hsla(${i * 5 +
      hueOffset}, ${saturation}%, 60%, 1)`;
  });
  visEl.style.transform = `rotate(${rotation}turn)`;
  visEl.style.height = rotation === 0 || rotation === 0.5 ? `100vh;` : `auto`;
  visEl.style.width =
    rotation === 0.25 || rotation === 0.75 ? `100vh;` : `auto`;
  document.body.style.backgroundColor = imageMode
    ? null
    : `hsla(${backgroundHueOffset}, ${backgroundSaturation}%, 60%, 1)`;
  visEl.style.backgroundImage = imageMode
    ? `url(http://placekitten.com/1680/960?image=${imageIndex})`
    : null;
  document.body.setAttribute("style", "-webkit-filter:invert(100%)");
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
