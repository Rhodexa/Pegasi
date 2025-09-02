// components/Scene.js
export default class Scene {
  constructor({title = "Untitled Scene", file_path = ""} = {}) {
    this.title = title;
    this.file_path = file_path;
    this.type = ""; // "video" | "image" | ""
    this.is_live = false;
    this.is_hot = false;
    this.is_active = false;

    this.el = this._createCard();
  }

  _createCard() {
    const card = document.createElement("div");
    card.className = "scene-card";

    const controlBar = document.createElement("div");
    controlBar.className = "control-bar";
    controlBar.style.display = "flex";
    controlBar.style.justifyContent = "space-between";

    const titleEl = document.createElement("div");
    titleEl.style.opacity = 0.5;
    titleEl.innerText = this.title;

    const feed = document.createElement("div");
    feed.className = "feed";
    feed.innerText = this.file_path ? this.file_path : "No file";

    controlBar.appendChild(titleEl);
    card.appendChild(controlBar);
    card.appendChild(feed);

    card.addEventListener("click", () => {
      this.setActive();
    });

    return card;
  }

  setActive() {
    this.is_active = true;
    this.el.classList.add("selected");
    // TODO: update toolbar with this scene’s info
  }

  setInactive() {
    this.is_active = false;
    this.el.classList.remove("active");
  }

  loadFile(file_path) {
    this.file_path = file_path;
    this.type = file_path.endsWith(".mp4") ? "video" : "image";
    this.el.querySelector(".feed").innerText = file_path;
  }
}
