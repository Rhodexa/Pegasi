import VSlider from './components/sliders/vslider/vslider.js';
import HSlider from './components/sliders/hslider/hslider.js';

const mix_slider = new HSlider(document.querySelector('#mix-slider'), { value: 100 });
const global_brightness = new HSlider(document.querySelector('#slider-global-birghtness'), { label: "Global Brightness", value: 100 });


const slider = new VSlider(document.querySelector('#slider1'), { label: 'Output Mix', value: 100 });
const slider2 = new VSlider(document.querySelector('#slider2'), { label: 'Volume', value: 100 });
const slider3 = new VSlider(document.querySelector('#slider3'), { label: 'Brightness', value: 100 });

slider.onChange(v => console.log('Slider value:', v));


/* Video controller */
const { ipcRenderer } = require('electron');
const video = document.getElementById('videoPlayer');

video.addEventListener('play', () => {
  let lastTick = 0;
  const TARGET_FPS = 24;

  const tick = () => {
    if (!video.paused && !video.ended) {
      const now = performance.now();
      if (now - lastTick > 1000 / TARGET_FPS) {
        lastTick = now;

        ipcRenderer.send('frame-timestamp', {
          timestamp: video.currentTime
        });
      }
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
});
