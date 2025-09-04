export default class Toolbar {
  constructor({
    manager,
    onRename,
    onDelete,
    onShiftLeft,
    onShiftRight,
    onOpenFile,
    onPreheat,
    onCommit,
  }) {
    this.manager = manager;
    this.root = document.getElementById("context-toolbar");
    this.inputTitle = this.root.querySelector("input[type='text']");
    this.btnDelete = this.root.querySelector("[data-icon='trash']").closest("button");
    this.btnShiftLeft = this.root.querySelector("[data-icon='arrow-left']").closest("button");
    this.btnShiftRight = this.root.querySelector("[data-icon='arrow-right']").closest("button");
    this.btnOpenFile = this.root.querySelector("[data-icon='upload']").closest("button");
    this.btnCommit = document.querySelector("#btn-commit");
    this.btnPreheat = document.querySelector('#btn-preheat');
    this.warningIcon = document.getElementById("warning");

    this.inputTitle.addEventListener("input", (e) => onRename?.(e.target.value));
    this.btnDelete.addEventListener("click", () => onDelete?.());
    this.btnShiftLeft.addEventListener("click", () => onShiftLeft?.());
    this.btnShiftRight.addEventListener("click", () => onShiftRight?.());
    this.btnOpenFile.addEventListener("click", () => onOpenFile?.());
    this.btnPreheat.addEventListener("click", () => onPreheat?.());
    this.btnCommit.addEventListener("click", () => onCommit?.());
  }

  update() {
    const scene = this.manager.getSelected();
    if (!scene) {
      this.root.classList.add("hidden");
      return;
    }
    this.root.classList.remove("hidden");
    this.inputTitle.value = scene.title ?? "";

    if (this.warningIcon) {
      this.warningIcon.style.display = scene.file_path ? "inline" : "none";
    }
  }
}