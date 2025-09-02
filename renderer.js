import Scene from "./components/Scene.js";

const scenes = [];
const sceneContainer = document.getElementById("scenes");

// Track toolbar elements
const toolbar = document.querySelector(".toolbar");
const inputTitle = toolbar.querySelector("input[type='text']");
const btnDelete = toolbar.querySelector("[data-icon='x']").closest("button");
const btnShiftLeft = toolbar.querySelector("[data-icon='arrow-left']").closest("button");
const btnShiftRight = toolbar.querySelector("[data-icon='arrow-right']").closest("button");
const btnOpenFile = toolbar.querySelector("[data-icon='upload']").closest("button");
const btnCommit = toolbar.querySelector("[data-icon='check']").closest("button");

// Helper: get currently selected scene
function getSelected() {
  return scenes.find(s => s.state === "selected");
}

// Add new scene
function addScene() {
  const scene = new Scene({});
  scenes.push(scene);
  sceneContainer.appendChild(scene.el);

  // When clicked → select this scene
  scene.el.addEventListener("click", () => {
    scenes.forEach(s => s.setState("idle"));
    scene.setState("selected");
    inputTitle.value = scene.title;
  });
}
document.getElementById("btn-new-scene").addEventListener("click", addScene);

// --- Toolbar actions ---

// Rename
inputTitle.addEventListener("input", e => {
  const scene = getSelected();
  if (scene) {
    scene.title = e.target.value;
    scene.el.querySelector(".scene-title").innerText = scene.title;
  }
});

// Delete
btnDelete.addEventListener("click", () => {
  const scene = getSelected();
  if (scene) {
    scene.el.remove();
    scenes.splice(scenes.indexOf(scene), 1);
  }
});

// Shift left
btnShiftLeft.addEventListener("click", () => {
  const scene = getSelected();
  if (!scene) return;
  const idx = scenes.indexOf(scene);
  if (idx > 0) {
    scenes.splice(idx, 1);
    scenes.splice(idx - 1, 0, scene);
    sceneContainer.insertBefore(scene.el, sceneContainer.children[idx - 1]);
  }
});

// Shift right
btnShiftRight.addEventListener("click", () => {
  const scene = getSelected();
  if (!scene) return;
  const idx = scenes.indexOf(scene);
  if (idx < scenes.length - 1) {
    scenes.splice(idx, 1);
    scenes.splice(idx + 1, 0, scene);
    sceneContainer.insertBefore(scene.el, sceneContainer.children[idx + 2] || null);
  }
});

// Open File (basic file picker)
btnOpenFile.addEventListener("click", () => {
  const scene = getSelected();
  if (!scene) return;

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*,image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) scene.loadFile(file);
  };
  input.click();
});


// Commit (mark as HOT for now)
btnCommit.addEventListener("click", () => {
  const scene = getSelected();
  if (!scene) return;

  // clear old hot
  scenes.forEach(s => {
    if (s.state === "hot") s.setState("idle");
  });
  scene.setState("hot");
});

// Seed one scene so it’s not empty
addScene();
