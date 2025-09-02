const scenes = [];
const sceneContainer = document.getElementById("scenes");


/* Video controller */
const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

//await window.serial.open("COM5");
console.log("Serial open, ready!");

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function gammaCorrect(val, gamma = 2.2) {
  return Math.pow(val / 255, gamma) * 255;
}

/*
video.addEventListener('play', () => {
  const TARGET_FPS = 30;
  let lastTick = 0;

  const tick = () => {
    if (video.paused || video.ended) return;

    const now = performance.now();
    if (now - lastTick > 1000 / TARGET_FPS) {
      lastTick = now;

      // draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      // build serial buffer
      const buf = new Uint8Array(1 + 150*3 + 1); // start + 150 LEDs *3 + end
      buf[0] = 0x01; // start
      for (let i = 0; i < 150; i++) {
        const r = gammaCorrect(frameData[i*4  ]);
        const g = gammaCorrect(frameData[i*4+1]);
        const b = gammaCorrect(frameData[i*4+2]);
        buf[1 + i*3 + 0] = (clamp(r - 10, 0, 255) >> 1) + 0x80;
        buf[1 + i*3 + 1] = (clamp(g - 10, 0, 255) >> 1) + 0x80;
        buf[1 + i*3 + 2] = (clamp(b - 10, 0, 255) >> 1) + 0x80;
      }
      buf[buf.length - 1] = 0x02; // end

      window.serial.send(buf).catch(err => console.error("Serial fail", err));

    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
});

*/
/* //////////////////////////////////////////////////////////////////////////////// */

import Scene from "./components/Scene.js";

function addScene() {
  const scene = new Scene({});
  scenes.push(scene);
  sceneContainer.appendChild(scene.el);
}

// connect button
document.getElementById("btn-new-scene").addEventListener("click", addScene);

// seed with one
addScene();
