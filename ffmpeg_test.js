const ffmpeg = require('fluent-ffmpeg');

// Hardcoded video path (scaled to 250x250)
const videoPath = './testing/videos/angelina.mp4';
const WIDTH = 250;
const HEIGHT = 250;
const PIXELS_TO_SHOW = 100; // first 100 pixels

ffmpeg(videoPath)
    .outputOptions([
        '-f rawvideo',
        '-pix_fmt rgb24',
        `-s ${WIDTH}x${HEIGHT}`
    ])
    .noAudio()
    .pipe()
    .on('data', chunk => {
    if (!chunk) return; // skip empty chunks

    const length = Math.min(chunk.length, 100*3); // first 100 pixels
    for (let i = 0; i < length; i += 3) {
        const r = chunk[i];
        const g = chunk[i + 1];
        const b = chunk[i + 2];
        const brightness = Math.floor((r+g+b)/3 / 25);
        process.stdout.write(' .:-=+*#%@'[brightness]);
        if ((i/3+1) % 10 === 0) process.stdout.write('\n');
    }
    process.stdout.write('\n---\n');
    })
    .on('end', () => console.log('Done streaming frames'));

