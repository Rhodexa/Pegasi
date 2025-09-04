import Scene from "./components/Scene.js";
import HSlider from "./components/sliders/hslider/hslider.js";
import Toast from "./components/toast/toast.js";

import SceneManager from "./core/SceneManager.js";
import SceneList from "./ui/SceneList.js";
import Toolbar from "./ui/Toolbar.js";
import { startScrapper } from "./render/Scrapper.js";

// State
const manager = new SceneManager();

// UI: scene list container
const sceneContainer = document.getElementById("scenes");
const sceneList = new SceneList({ container: sceneContainer, manager });

// UI: toolbar with callbacks
const toolbar = new Toolbar({
  manager,
  onRename: (newTitle) => {
    const s = manager.getSelected();
    if (!s) return;
    s.title = newTitle;
    const titleEl = s.element.querySelector(".scene-title");
    if (titleEl) titleEl.innerText = s.title;
  },
  onDelete: () => {
    const s = manager.getSelected();
    if (!s) return;
    sceneList.remove(s);
    manager.remove(s);
    toolbar.update();
  },
  onShiftLeft: () => {
    const s = manager.getSelected();
    if (!s) return;
    if (manager.moveLeft(s)) sceneList.syncOrder(manager.scenes);
  },
  onShiftRight: () => {
    const s = manager.getSelected();
    if (!s) return;
    if (manager.moveRight(s)) sceneList.syncOrder(manager.scenes);
  },
  onOpenFile: () => {
    const s = manager.getSelected();
    if (!s) return;

    if (s.file_path) {
      Toast("You're about to REPLACE a file");
      const ok = confirm("This Scene already has a file. Are you sure you want to replace it?");
      if (!ok) return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*,image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) s.loadFile(file);
      toolbar.update();
    };
    input.click();
  },
  onPreheat: () => {
    const s = manager.getSelected();
    if (!s) {
      Toast("No scene selected");
      return;
    }
    if (s.flags.live) {
      Toast("Cannot heat a Live scene");
      return;
    }
    manager.setHot(s);
    toolbar.update();
  },
  onCommit: () => {
    const hot = manager.getHot();
    if (!hot) {
      Toast("Empty Hot Source — Nothing to Commit");
      return;
    }
    manager.setLive(hot);
    toolbar.update();
  },
});

// New Scene button
const btnNew = document.getElementById("btn-new-scene");
btnNew.addEventListener("click", () => {
  const scene = new Scene({});
  manager.add(scene);
  sceneList.add(scene, () => {
    manager.setSelected(scene);
    toolbar.update();
  });
  toolbar.update();
});

// Seed first scene by simulating a click
btnNew.click();

// Start scrapper loops
const canvasHot = document.getElementById("canvas-hot-source");
const canvasLive = document.getElementById("canvas-live-source");
startScrapper({ manager, canvasHot, canvasLive });

// Init any extra controls
const slider_fade_time = new HSlider(document.getElementById("fade-time"), {
  label: "Transition time", numbers: true, min: 0, max: 2000, unit: "ms"
});

// Initial toolbar render
toolbar.update();

// SERIAL //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const portSelect = document.getElementById("select-gabby-port");
const portStatus = document.getElementById("port-status");

async function refreshPorts() {
  const ports = await window.serial.list();
  portSelect.innerHTML = "";
  ports.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.innerText = p;
    portSelect.appendChild(opt);
  });
}
refreshPorts();
portSelect.addEventListener("focus", refreshPorts);

async function connectPort(path) {
  portStatus.innerText = "Connecting…";
  portStatus.style.color = "#ff5"; // yellow

  try {
    await window.serial.open(path);
    portStatus.innerText = `Connected to ${path}`;
    portStatus.style.color = "#5f5"; // green
  } catch (e) {
    console.error("Failed to connect:", e);
    portStatus.innerText = `Cannot access port ${path}: ${e}`;
    portStatus.style.color = "#f55"; // red
  }
}
portSelect.addEventListener("change", () => {
  const path = portSelect.value;
  if (path) connectPort(path);
});

window.serial.onDisconnected(() => {
  Toast("SERIAL DISCONNECTED");
  portStatus.innerText = "Port disconnected";
  portStatus.style.color = "#f55";
});

window.serial.onError((msg) => {
  portStatus.innerText = `Serial error: ${msg}`;
  portStatus.style.color = "#f55";
});

/*************************************************************************************************************************** */