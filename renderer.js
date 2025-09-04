import Scene from "./components/Scene.js";
import HSlider from "./components/sliders/hslider/hslider.js"
import Toast from "./components/toast/toast.js"

// === Scene + track management ===
const scenes = [];
const sceneContainer = document.getElementById("scenes");

// Toolbar elements
const toolbar = document.getElementById("context-toolbar");
const inputTitle = toolbar.querySelector("input[type='text']");
const btnDelete = toolbar.querySelector("[data-icon='trash']").closest("button");
const btnShiftLeft = toolbar.querySelector("[data-icon='arrow-left']").closest("button");
const btnShiftRight = toolbar.querySelector("[data-icon='arrow-right']").closest("button");
const btnOpenFile = toolbar.querySelector("[data-icon='upload']").closest("button");
const btnCommit = document.querySelector("#btn-commit");

const slider_fade_time = new HSlider(document.getElementById("fade-time"), { label: "Transition time", numbers: true, min: 0, max: 2000, unit: "ms" });

// --- Helpers ---
function scenes_getSelected() { return scenes.find(s => s.flags.selected); }
function scenes_getLive() { return scenes.find(s => s.flags.active) || scenes.find(s => s.flags.hot); }
function scenes_getHot() { return scenes.find(s => s.flags.hot) || scenes.find(s => s.flags.active); }

function toolbar_update() {
  const scene = scenes_getSelected();
  if (!scene) {
    toolbar.classList.add("hidden");
    return;
  } 
  toolbar.classList.remove("hidden");

  inputTitle.value = scene.title;

  const warningIcon = document.getElementById("warning");
  if (warningIcon) warningIcon.style.display = scene.file_path ? "inline" : "none";
}

// --- Add new scene ---
function addScene() {
  const scene = new Scene({});
  scenes.push(scene);
  sceneContainer.appendChild(scene.element);

  scene.element.addEventListener("click", () => {
    // Deselect all other scenes
    scenes.forEach(s => s.setFlag("selected", false));
    scene.setFlag("selected", true);
    toolbar_update();
  });
}
document.getElementById("btn-new-scene").addEventListener("click", addScene);

// --- Toolbar actions ---

// Rename
inputTitle.addEventListener("input", e => {
  const scene = scenes_getSelected();
  if (scene) {
    scene.title = e.target.value;
    scene.element.querySelector(".scene-title").innerText = scene.title;
  }
});

// Delete
btnDelete.addEventListener("click", () => {
  const scene = scenes_getSelected();
  if (scene) {
    scene.element.remove();
    scenes.splice(scenes.indexOf(scene), 1);
  }
});

// Shift left
btnShiftLeft.addEventListener("click", () => {
  const scene = scenes_getSelected();
  if (!scene) return;
  const idx = scenes.indexOf(scene);
  if (idx > 0) {
    scenes.splice(idx, 1);
    scenes.splice(idx - 1, 0, scene);
    sceneContainer.insertBefore(scene.element, sceneContainer.children[idx - 1]);
  }
});

// Shift right
btnShiftRight.addEventListener("click", () => {
  const scene = scenes_getSelected();
  if (!scene) return;
  const idx = scenes.indexOf(scene);
  if (idx < scenes.length - 1) {
    scenes.splice(idx, 1);
    scenes.splice(idx + 1, 0, scene);
    sceneContainer.insertBefore(scene.element, sceneContainer.children[idx + 2] || null);
  }
});

// Open File
btnOpenFile.addEventListener("click", () => {
  const scene = scenes_getSelected();
  if (!scene) return;

  // Show warning if scene already has a file
  const warningIcon = document.getElementById("warning");
  if (warningIcon) warningIcon.style.display = scene.file_path ? "inline" : "none";

  if (scene.file_path) {
    Toast("You're about to REPLACE a file");
    const confirmReplace = confirm(
      "This Scene already has a file. Are you sure you want to replace it?"
    );
    if (!confirmReplace) return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*,image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) scene.loadFile(file);
    
    // Show warning icon now that scene has a file
    warningIcon.style.display = "inline";
  };
  input.click();
});

// Commit
btnCommit.addEventListener("click", () => {
  const scene = scenes_getHot();
  if (!scene) {
    Toast("No HOT scenes to commit!");
    return;
  }

  // Clear previous active flags
  scenes.forEach(s => s.setFlag("active", false));

  // Set current scene as LIVE
  scene.setFlag("active", true);
});

// Seed first scene
addScene();

// === Pixel Scrapper ===
const pixelCanvas = document.getElementById("pixelCanvas");
const pixelCtx = pixelCanvas.getContext("2d");
const TARGET_FPS_PERIOD = 1000 / 24;
const LOW_SPEED_FPS_PERIOD = 1000;

function scrapperLoop() {
  const liveScene = scenes_getLive();
  if (!liveScene) {
    requestAnimationFrame(scrapperLoop);
    return;
  }

  const feedEl = liveScene.element.querySelector(".feed");
  const mediaEl = feedEl.querySelector("video, img");

  if (mediaEl) {
    const is_image = mediaEl.tagName === "IMG";
    const reduce_speed = mediaEl.paused || mediaEl.ended || is_image;

    pixelCtx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    pixelCtx.drawImage(mediaEl, 0, 0, pixelCanvas.width, pixelCanvas.height);

    const fps = reduce_speed ? LOW_SPEED_FPS_PERIOD : TARGET_FPS_PERIOD;
    setTimeout(() => requestAnimationFrame(scrapperLoop), fps);
  } else {
    requestAnimationFrame(scrapperLoop);
  }
}


// Start the scrapper loop
scrapperLoop();
