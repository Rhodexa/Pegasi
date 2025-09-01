import VSlider from './components/sliders/vslider/vslider.js';
import HSlider from './components/sliders/hslider/hslider.js';

const mix_slider = new HSlider(document.querySelector('#mix-slider'), { value: 0 });
const global_brightness = new HSlider(document.querySelector('#slider-global-birghtness'), { label: "Global Brightness", value: 100 });


const slider = new VSlider(document.querySelector('#slider1'), { label: 'Output Mix', value: 100 });
const slider2 = new VSlider(document.querySelector('#slider2'), { label: 'Volume', value: 100 });
const slider3 = new VSlider(document.querySelector('#slider3'), { label: 'Brightness', value: 100 });

slider.onChange(v => console.log('Slider value:', v));


/* Video controller */
const { ipcRenderer } = require('electron');
const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');

video.addEventListener('play', () => {
  const TARGET_FPS = 24;
  let lastTick = 0;

  const tick = () => {
    if (!video.paused && !video.ended) {
      const now = performance.now();
      if (now - lastTick > 1000 / TARGET_FPS) {
        lastTick = now;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Example: log first 10 pixels as [r,g,b]
        const preview = [];
        for (let i = 0; i < 150*4; i += 4) {
          preview.push([frameData[i], frameData[i+1], frameData[i+2]]);
        }
        // console.log('First 10 pixels:', preview);
      }
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
});