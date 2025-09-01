import VSlider from './components/sliders/vslider/vslider.js';

const slider = new VSlider(document.querySelector('#slider1'), { label: 'Output Mix', value: 30 });
const slider2 = new VSlider(document.querySelector('#slider2'), { label: 'Volume', value: 30 });
const slider3 = new VSlider(document.querySelector('#slider3'), { label: 'Brightness', value: 30 });
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

        const frameIndex = Math.floor(video.currentTime * TARGET_FPS);
        ipcRenderer.send('frame-timestamp', {
          frameIndex,
          timestamp: video.currentTime
        });
      }
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
});


