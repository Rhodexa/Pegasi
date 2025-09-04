export default class SceneList {
  constructor({ container, manager }) {
    this.container = container;
    this.manager = manager;
  }

  add(scene, onSelect) {
    this.container.appendChild(scene.element);
    scene.element.addEventListener("click", () => {
      this.manager.setSelected(scene, true);
      if (typeof onSelect === "function") onSelect(scene);
    });
  }

  remove(scene) {
    if (scene.element && scene.element.parentNode === this.container) {
      scene.element.remove();
    }
  }

  syncOrder(scenes) {
    // Re-append in order to reflect the array order
    scenes.forEach(s => this.container.appendChild(s.element));
  }
}