// song
let song;
let horn;
let omg;

// image
let bgImg;
let me;

// camera
let cameraCapture;
let faceMesh;
let predictions = [];
let lipX;

// sound effects
let fft;
let amp;
let filter;
let filter2;
let filterFreq;
let filterRes;
let volHistory = [];

// colors
let col;
let col2;
let colWave;

// soundWave
let threshold = 400;
let resolution = 500;
let aveWave = 0;
let r;

// mask
let pg;
let movingOffsetX;
let movingOffsetY;
let meRatio;

// socket
let socket;

// text
const opacityDuration = 1;

function preload() {
  socket = io.connect("https://icm-socket.herokuapp.com", {
    transports: ["websocket"],
  });
  // socket
  socket.on("text", function (text) {
    console.log(text);
    showUpText(text);
  });
  socket.on("emoji", function (emoji) {
    console.log(emoji);
    if (emoji === "horn") horn.play();
    if (emoji === "scream") omg.play();
    if (emoji === "hi") showUpText("👋");
    if (emoji === "hoo") showUpText("🤟");
    if (emoji === "yay") showUpText("🤘");
    if (emoji === "glass") showUpText("😎");
    if (emoji === "pretty") showUpText("😍");
    if (emoji === "poop") showUpText("💩");
    if (emoji === "shine") showUpText("✨");
    if (emoji === "heart") showUpText("💗");
  });

  // loading sounds
  song = loadSound("assets/song2.mp3");
  horn = loadSound("assets/horn.mp3");
  omg = loadSound("assets/ohmygosh.mp3");

  // loading images
  bgImg = loadImage("assets/bg.jpg");
  me = loadImage("assets/profile.jpeg");
  copiedMe = loadImage("assets/profile.jpeg");

  // preparing camera
  cameraCapture = createCapture(VIDEO);
  cameraCapture.size(400, 400);
  cameraCapture.hide();
  faceMesh = ml5.facemesh(cameraCapture, modelLoaded);

  // initializing color
  col = color(0, 255, 0);
  col2 = color("hsba(250, 57%, 100%, 1)");
  colWave = color(0, 100, 255, 150);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(bgImg);

  // about song
  song.amp(0.2);
  filter = new p5.LowPass();
  // filter2 = new p5.HighPass();
  song.connect(filter);
  // song.connect([filter, filter2]); // TODO how to attach multiple?
  fft = new p5.FFT();
  fft.setInput(song);
  r = height / 4;

  // about face
  faceMesh.on("predict", (results) => {
    predictions = results;
    lipX =
      predictions[0] && predictions[0].scaledMesh[13]
        ? predictions[0].scaledMesh[13][0]
        : 0;
    const topLip =
      predictions[0] && predictions[0].scaledMesh[13]
        ? predictions[0].scaledMesh[13][1]
        : 0;
    const bottomLip =
      predictions[0] && predictions[0].scaledMesh[14]
        ? predictions[0].scaledMesh[14][1]
        : 0;
    let disTopBottom = bottomLip - topLip > 0 ? bottomLip - topLip : 0;

    const leftLip =
      predictions[0] && predictions[0].scaledMesh[78]
        ? predictions[0].scaledMesh[78][0]
        : 0;
    const rightLip =
      predictions[0] && predictions[0].scaledMesh[293]
        ? predictions[0].scaledMesh[293][0]
        : 0;
    let disLeftRight = rightLip - leftLip > 0 ? rightLip - leftLip : 0;

    // filterFreq = map(mouseX, 0, width, 10, 22050);
    filterFreq = map(disTopBottom, 0, 200, 10, 22050);

    filterRes = map(disLeftRight, 0, 200, 15, 5);
    // filterRes = map(mouseY, 0, height, 0, 90);

    // filterRes = map(mouseY, 0, height, 15, 5);
    filter.set(filterFreq, filterRes);
    // filter2.set(filterFreq, filterRes);
  });
}

////////
// When the model is loaded
function modelLoaded() {
  console.log("Model Loaded!");
}

function draw() {
  image(bgImg, movingOffsetX, movingOffsetY, width);
  meRatio = me.width / me.height;

  changeResolution();
  visualizeSpectrum();

  maskProfile();
  visualizeWaveform();
}

// prepared functions
function mousePressed() {
  toggleSound();
}

function mouseMoved() {
  let panning = map(lipX, 0, width, -1.0, 1.0);
  if (song.isPlaying()) song.pan(panning);

  movingOffsetX = (mouseX - windowWidth / 2) * 0.02;
  movingOffsetY = (mouseY - windowWidth / (2 * meRatio)) * 0.02;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bgImg.resize(width, 0);
  r = height / 4;
}

// ----------------------------------------------

function maskProfile() {
  const lensSize = height / 2;

  //create the mask
  pg = createGraphics(lensSize, lensSize);
  pg.pixelDensity();
  pg.noStroke();
  pg.ellipse(lensSize / 2, lensSize / 2, lensSize);
  me.mask(pg);
  cameraCapture.mask(pg);
}
function toggleSound() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function changeResolution() {
  var waveform = fft.waveform();
  for (var i = 0; i < waveform.length; i++) {
    aveWave += waveform[i] + 1;
  }
  aveWave = aveWave / waveform.length;
  resolution = map(aveWave, 0.98, 1.03, 20, 1000);
}

function visualizeSpectrum() {
  //   FFT
  let spectrum = fft.analyze();
  // 間引きするための変数
  let specInter = floor((spectrum.length - threshold) / resolution);
  let reducedSpec = [];

  for (var i = 0; i < resolution; i++) {
    reducedSpec.push(spectrum[i * specInter]);
  }
  let r = width / 4;
  var angleStep = TWO_PI / resolution;

  interval = r * sin(angleStep / 2);
  // draw spectrum
  for (var i = 0; i < resolution; i++) {
    var scale = map(reducedSpec[i], 0, 255, 0, r);

    var angle = map(i, 0, resolution, 0, TWO_PI);
    var y = r * sin(angle - PI / 2);
    var x = r * cos(angle - PI / 2);

    push();
    translate(width / 2 + x - movingOffsetX, height / 2 + y - movingOffsetY);
    rotate(angle);
    // stroke(col);
    // strokeWeight(2);
    noStroke();
    let gradColor;

    if ((angle * 180) / PI < 180) {
      let addColor = map((angle * 180) / PI, 0, 179, 0, 50);
      gradColor = "hsba(" + round(250 + addColor) + ", 60%, 100%, 1)";
    } else {
      let addColor = map((angle * 180) / PI, 180, 360, 0, 50) - 50;
      gradColor = "hsba(" + round(250 - addColor) + ", 60%, 100%, 1)";
    }
    fill(gradColor);
    rect(-interval / 2, -scale, interval, scale);
    pop();
  }
}

function visualizeWaveform() {
  image(
    cameraCapture,
    width / 4 - movingOffsetX - 0.025 * width,
    height / 2 -
      windowWidth / (2 * meRatio) / 2 -
      movingOffsetY -
      0.025 * width,
    width / 2 + 0.05 * width,
    width / (2 * meRatio) + 0.05 * width
  );
  var waveform = fft.waveform();
  var waveInter = floor(waveform.length / resolution);
  var reducedWave = [];

  for (var i = 0; i < resolution; i++) {
    reducedWave.push(waveform[i * waveInter]);
  }
  let waveShape = createGraphics(windowWidth / 2, windowWidth / (2 * meRatio));

  //draw waveform
  waveShape.beginShape();
  waveShape.fill(100);
  waveShape.strokeWeight(4);
  waveShape.translate(windowWidth / 4, windowWidth / (4 * meRatio));
  for (var i = 0; i < resolution; i++) {
    var off = map(reducedWave[i], -1, 1, -r / 2, r / 2);

    var angle = map(i, 0, resolution, 0, TWO_PI);
    var y = (r + r * 0.0 + off) * sin(angle);
    var x = (r + r * 0.0 + off) * cos(angle);

    waveShape.vertex(x, y);
  }
  waveShape.endShape(CLOSE);

  copiedMe.mask(waveShape);
  // image(
  //   copiedMe,
  //   width / 4 - movingOffsetX - 0.025 * width,
  //   height / 2 -
  //     windowWidth / (2 * meRatio) / 2 -
  //     movingOffsetY -
  //     0.025 * width,
  //   width / 2 + 0.05 * width,
  //   width / (2 * meRatio) + 0.05 * width
  // );
}

function showUpText(textInput) {
  const randX = random(0, 0.9 * width);
  const randY = random(0, 0.9 * height);
  const fontRand = random(1, 100);
  const textDiv = createDiv(textInput);
  textDiv.style("z-index: 1000");
  textDiv.style("position: absolute");
  textDiv.style("opacity: 0");
  textDiv.style("left: " + randX + "px");
  textDiv.style("top: " + randY + "px");
  textDiv.style("font-size: " + fontRand + "px");
  // TODO 色のランダム化
  // TODO フォント追加
  setTimeout(function () {
    addOpacity(textDiv, 0, fontRand, randX);
  }, opacityDuration);
}

function addOpacity(obj, i, fontSize, x) {
  const newOpacity = i + 0.25;
  const newFontSize = fontSize + 1;
  const newX = x - 1;
  obj.style("opacity: " + newOpacity);
  obj.style("font-size: " + newFontSize + "px");
  obj.style("left: " + newX + "px");

  console.log("opacity");
  if (i < 0.99) {
    setTimeout(function () {
      addOpacity(obj, newOpacity, newFontSize, newX);
    }, opacityDuration);
  } else {
    setTimeout(function () {
      decreaseOpacity(obj, newOpacity, newFontSize, newX);
    }, opacityDuration);
  }
}

function decreaseOpacity(obj, i, fontSize, x) {
  const newOpacity = i - 0.3;
  const newFontSize = fontSize - 1;
  const newX = x + 1;

  obj.style("opacity: " + newOpacity);
  obj.style("font-size: " + newFontSize + "px");
  obj.style("left: " + newX + "px");

  if (i < 0) {
    obj.remove();
    console.log("deleted");
  } else {
    setTimeout(function () {
      decreaseOpacity(obj, newOpacity, newFontSize, newX);
    }, opacityDuration);
  }
}
