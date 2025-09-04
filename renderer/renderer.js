import Scene from "../components/Scene.js";
import HSlider from "../components/sliders/hslider/hslider.js"
import Toast from "../components/toast/toast.js"

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
const btnPreheat = document.querySelector('#btn-preheat');

const slider_fade_time = new HSlider(document.getElementById("fade-time"), { label: "Transition time", numbers: true, min: 0, max: 2000, unit: "ms" });

// --- Helpers ---
function scenes_getSelected() { return scenes.find(s => s.flags.selected); }
function scenes_getLive() { return scenes.find(s => s.flags.live); }
function scenes_getHot() { return scenes.find(s => s.flags.hot); }

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
// Seed first scene
addScene();

// Preheat
btnPreheat.addEventListener("click", () => {
  const scene = scenes_getSelected();
  if (!scene) {
    Toast("No scene selected");
    return;
  }
  if (scene.flags.live) {
    Toast("Cannot heat a Live scene");
    return
  }

  scenes.forEach(s => s.setFlag("hot", false));
  scene.setFlag("hot", true);  
});

// Commit
btnCommit.addEventListener("click", () => {
  const scene = scenes_getHot();
  if (!scene) {
    Toast("Empty Hot Source — Nothing to Commit");
    return;
  }
  scenes.forEach(s => s.setFlag("hot", false));
  scenes.forEach(s => s.setFlag("live", false));
  scene.setFlag("live", true);
});


const canvas_hot = document.getElementById("canvas-hot-source");
const ctx_hot = canvas_hot.getContext("2d");

function scrapperHotLoop(){
  const scene_hot = scenes_getHot();
  if(scene_hot){
    const feed_hot_element = scene_hot.element.querySelector(".feed");
    const media_hot_element = feed_hot_element.querySelector("video, img");
    ctx_hot.clearRect(0, 0, canvas_live.width, canvas_live.height);
    ctx_hot.drawImage(media_hot_element, 0, 0, canvas_live.width, canvas_live.height);
  }
  setTimeout(() => scrapperHotLoop(), 1000);
}

const canvas_live = document.getElementById("canvas-live-source");
const ctx_live = canvas_live.getContext("2d");
function scrapperLiveLoop() {
  const scene_hot = scenes_getHot();
  const scene_live = scenes_getLive();

  if (!(scene_hot || scene_live)) { // Nothing to draw? Let's poll only occasionally
    setTimeout(() => requestAnimationFrame(scrapperLiveLoop), 1000);
    return;
  }

  if (!scene_live) { // No live scene but yes hot scene? Potentially there will be so let's poll more oftenly
    setTimeout(() => requestAnimationFrame(scrapperLiveLoop), 100); // ~10FPS
    return;
  }  

  const feed_live_element = scene_live.element.querySelector(".feed");
  const media_live_element = feed_live_element.querySelector("video, img");

  if (media_live_element)
  {
    const is_image = media_live_element.tagName === "IMG";
    const reduce_speed = media_live_element.paused || media_live_element.ended || is_image;
      ctx_live.clearRect(0, 0, canvas_live.width, canvas_live.height);
      ctx_live.drawImage(media_live_element, 0, 0, canvas_live.width, canvas_live.height);
    const fps = reduce_speed ? LOW_SPEED_FPS_PERIOD : TARGET_FPS_PERIOD;
    setTimeout(() => requestAnimationFrame(scrapperLiveLoop), fps);
    return;
  }

  else
  {
    requestAnimationFrame(scrapperLiveLoop);
  }
}


// Start the scrapper loop
scrapperLiveLoop();
scrapperHotLoop();
