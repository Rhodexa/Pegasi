import { TARGET_FPS_PERIOD, LOW_SPEED_FPS_PERIOD } from "../config/constants.js";

export function startScrapper({ manager, canvasHot, canvasLive }) {
  const ctxHot = canvasHot.getContext("2d");
  const ctxLive = canvasLive.getContext("2d");

  function hotLoop() {
    const hot = manager.getHot();
    if (hot) {
      const feed = hot.element.querySelector(".feed");
      const media = feed?.querySelector("video, img");
      if (media) {
        ctxHot.clearRect(0, 0, canvasHot.width, canvasHot.height);
        ctxHot.drawImage(media, 0, 0, canvasHot.width, canvasHot.height);
      }
    }
    setTimeout(() => hotLoop(), 1000);
  }

  function liveLoop() {
  const hot = manager.getHot();
  const live = manager.getLive();

  if (!hot && !live) {
    setTimeout(() => requestAnimationFrame(liveLoop), 1000);
    return;
  }

  if (!live) {
    setTimeout(() => requestAnimationFrame(liveLoop), 100); 
    return;
  }  

  function gammaCorrect(val, gamma = 4) { return Math.pow(val / 255, gamma) * 255; }

  function applyContrast(ctx, width, height, contrast = 100) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert contrast from % to factor
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
        // Apply contrast to R, G, B channels
        data[i] = truncate(factor * (data[i] - 128) + 128);     // R
        data[i + 1] = truncate(factor * (data[i + 1] - 128) + 128); // G
        data[i + 2] = truncate(factor * (data[i + 2] - 128) + 128); // B
        // Alpha channel stays the same
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // Helper to keep values between 0-255
  function truncate(value) {
      return Math.min(255, Math.max(0, value));
  }


  const feed = live.element.querySelector(".feed");
  const media = feed?.querySelector("video, img");
  if (media) {
    const isImage = media.tagName === "IMG";
    const reduce = isImage || media.paused || media.ended;

    ctxLive.clearRect(0, 0, canvasLive.width, canvasLive.height);
    ctxLive.drawImage(media, 0, 0, canvasLive.width, canvasLive.height);
    //applyContrast(ctxLive, canvasLive.width, canvasLive.height, 150); // 150% contrast



    // ---- SERIAL SEND ----
    if (window.serial) {
      const data = ctxLive.getImageData(0,0,canvasLive.width,canvasLive.height).data;
      const bytes = [0x01];
      for (let i = 0; i < 150*4; i += 4) {
        bytes.push((gammaCorrect(data[i+150*4*0])>>1) + 0x80);   // R
        bytes.push((gammaCorrect(data[i+1+150*4*0])>>1) + 0x80); // G
        bytes.push((gammaCorrect(data[i+2+150*4*0])>>1) + 0x80); // B
      }
      bytes.push(0x02);
      window.serial.send(new Uint8Array(bytes));
    }
    // ---------------------

    const period = reduce ? LOW_SPEED_FPS_PERIOD : TARGET_FPS_PERIOD;
    setTimeout(() => requestAnimationFrame(liveLoop), period);
    return;
  }

  requestAnimationFrame(liveLoop);
}

  liveLoop();
  hotLoop();
}