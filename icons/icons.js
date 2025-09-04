// icons.js
async function loadIcons() {
    const divs = document.querySelectorAll("[data-icon]");
    for (const div of divs) {
        const name = div.getAttribute("data-icon");
        const color = div.getAttribute("data-color") || "white";
        const size = div.getAttribute("data-size") || "24";

        const svg = await window.icons.get(name);
        if (!svg) {
            console.log(`Couln't load icon ${name}`);
            continue;
        }

        div.innerHTML = svg;

        const icon = div.querySelector("svg");
        if (icon) {
            icon.setAttribute("width", size);
            icon.setAttribute("height", size);
            icon.style.stroke = color;
        }
    }
}

window.addEventListener("DOMContentLoaded", loadIcons);
