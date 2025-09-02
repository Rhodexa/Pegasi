export default class Scene {
  constructor({ title = "Untitled Scene", file_path = "" } = {}) {
    this.title = title;
    this.file_path = file_path;
    this.type = ""; // "video" | "image"

    // Flags
    this.flags = {
      selected: false,
      hot: false,
      active: false, // LIVE
    };

    this.el = this._createCard();
    this._updateClasses();
  }

  _createCard() {
    const card = document.createElement("div");
    card.className = "scene-card";

    const titleEl = document.createElement("div");
    titleEl.className = "scene-title";
    titleEl.innerText = this.title;

    const feed = document.createElement("div");
    feed.className = "feed";
    feed.innerText = this.file_path || "No file";

    card.appendChild(titleEl);
    card.appendChild(feed);

    card.addEventListener("click", () => this.toggleFlag("selected"));

    return card;
  }

  _updateClasses() {
    const { selected, hot, active } = this.flags;
    const classes = ["scene-card"];
    if (selected) classes.push("selected");
    if (hot) classes.push("hot");
    if (active) classes.push("active");
    this.el.className = classes.join(" ");
  }

  // Generic flag setter
  setFlag(flag, value = true) {
    if (!(flag in this.flags)) return;
    this.flags[flag] = value;
    this._updateClasses();
  }

  // Toggle convenience
  toggleFlag(flag) {
    if (!(flag in this.flags)) return;
    this.flags[flag] = !this.flags[flag];
    this._updateClasses();
  }

  loadFile(file) {
    this.file_path = file.name;
    this.type = file.type.startsWith("video") ? "video" : "image";

    const feed = this.el.querySelector(".feed");
    feed.innerHTML = ""; // clear previous

    let mediaEl;
    if (this.type === "video") {
      mediaEl = document.createElement("video");
      mediaEl.src = URL.createObjectURL(file);
      mediaEl.controls = true;
      mediaEl.autoplay = false;
      mediaEl.style.maxWidth = "100%";
      mediaEl.style.maxHeight = "100%";
      mediaEl.addEventListener("play", () => {
        document.querySelectorAll(".scene-card video").forEach(v => {
          if (v !== mediaEl) v.pause();
        });
      });
    } else {
      mediaEl = document.createElement("img");
      mediaEl.src = URL.createObjectURL(file);
      mediaEl.style.maxWidth = "100%";
      mediaEl.style.maxHeight = "100%";
    }

    feed.appendChild(mediaEl);
  }
}
