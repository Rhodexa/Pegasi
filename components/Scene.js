export default class Scene {
    constructor({ title = "Untitled Scene", file_path = "" } = {}) {
        this.title = title;
        this.file_path = file_path;
        this.type = ""; // "video" | "image"
        this.state = "idle"; // idle | selected | active | hot

        this.el = this._createCard();
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

        card.addEventListener("click", () => this.setState("selected"));

        return card;
    }

    setState(newState) {
        this.state = newState;
        this.el.className = "scene-card"; // reset classes
        if (newState !== "idle") this.el.classList.add(newState);
    }

    loadFile(file) {
        // Accept File object from <input type=file>
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
