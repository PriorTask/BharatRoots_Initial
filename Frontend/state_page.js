const params = new URLSearchParams(window.location.search);
const state = params.get("name");

const data = statesData[state];

if (!data) {
  document.body.innerHTML = "<h1>State not found</h1>";
}

// Apply theme
if (data.theme) {
  document.documentElement.style.setProperty("--accent", data.theme.accent);
  document.documentElement.style.setProperty("--bg", data.theme.bg);
}

// Basic
document.getElementById("state-title").innerText = data.title || "";
document.getElementById("state-subtitle").innerText = data.subtitle || "";
document.getElementById("state-map").src = data.map || "";

// Safe section filler
function fillSection(id, section) {
  const sectionElement = document.getElementById(id);
  const listElement = document.getElementById(id + "-list");

  if (!section || !sectionElement || !listElement) return;

  sectionElement.innerText = section.text || "";
  listElement.innerHTML = "";

  if (section.points && Array.isArray(section.points)) {
    section.points.forEach((point) => {
      const li = document.createElement("li");
      li.innerText = point;
      listElement.appendChild(li);
    });
  }
}

// Fill structured sections
fillSection("heritage", data.heritage);
fillSection("crafts", data.crafts);
fillSection("tech", data.tech);
fillSection("unique", data.unique);
fillSection("geo", data.geo);
fillSection("food", data.food);
fillSection("places", data.places);
fillSection("fest", data.fest);
fillSection("music", data.music);

// Handle simple fields (for MP/Tamil fallback)
if (data.about) {
  document.getElementById("heritage").innerText = data.about;
}
if (data.food && typeof data.food === "string") {
  document.getElementById("food").innerText = data.food;
}
if (data.places && typeof data.places === "string") {
  document.getElementById("places").innerText = data.places;
}
