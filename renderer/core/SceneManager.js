export default class SceneManager {
  constructor() {
    this.scenes = [];
  }

  add(scene) {
    this.scenes.push(scene);
    return scene;
  }

  remove(scene) {
    const i = this.scenes.indexOf(scene);
    if (i >= 0) this.scenes.splice(i, 1);
  }

  getSelected() { return this.scenes.find(s => s.flags.selected); }
  getHot() { return this.scenes.find(s => s.flags.hot); }
  getLive() { return this.scenes.find(s => s.flags.live); }

  setSelected(scene, on = true) {
    this.scenes.forEach(s => s.setFlag("selected", false));
    if (scene && on) scene.setFlag("selected", true);
  }

  setHot(scene) {
    this.scenes.forEach(s => s.setFlag("hot", false));
    if (scene) scene.setFlag("hot", true);
  }

  setLive(scene) {
    this.scenes.forEach(s => s.setFlag("live", false));
    if (scene) scene.setFlag("live", true);
    // committing usually resets hot
    this.scenes.forEach(s => s.setFlag("hot", false));
  }

  moveLeft(scene) {
    const idx = this.scenes.indexOf(scene);
    if (idx > 0) {
      this.scenes.splice(idx, 1);
      this.scenes.splice(idx - 1, 0, scene);
      return true;
    }
    return false;
  }

  moveRight(scene) {
    const idx = this.scenes.indexOf(scene);
    if (idx >= 0 && idx < this.scenes.length - 1) {
      this.scenes.splice(idx, 1);
      this.scenes.splice(idx + 1, 0, scene);
      return true;
    }
    return false;
  }
}