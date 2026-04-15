/* travel.js
   - Search + filters (already implemented)
   - Popup handling (already implemented)
   - Wishlist integration: tries to POST to /api/wishlist/travel, falls back to localStorage.
   - Adds a heart button to each card for quick wishlist adding.
*/

const cards = Array.from(document.querySelectorAll(".card"));
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupDesc = document.getElementById("popup-desc");
const popupTime = document.getElementById("popup-time");
const popupBest = document.getElementById("popup-best");
const closeBtn = document.querySelector(".close-btn");

const searchInput = document.querySelector(".search-bar");
const interestFilter = document.getElementById("interest");
const regionFilter = document.getElementById("region");

// --- Popup logic (showing details) ---
cards.forEach((card) => {
  // add heart button to each card (if not already present)
  if (!card.querySelector(".card-heart")) {
    const heart = document.createElement("button");
    heart.className = "card-heart";
    heart.title = "Add to Travel Wishlist";
    heart.innerHTML = "♡"; // will toggle to ♥ when saved
    heart.style =
      "position:absolute; top:12px; right:12px; background:transparent; border:none; font-size:20px; cursor:pointer;";
    card.style.position = "relative";
    card.appendChild(heart);

    heart.addEventListener("click", (e) => {
      e.stopPropagation(); // do not open popup
      const item = cardToTravelItem(card);
      toggleTravelWishlist(item, heart);
    });

    // reflect saved state (from local or backend)
    isInTravelWishlist(cardToTravelItem(card).id).then((inList) => {
      if (inList) heart.innerHTML = "♥";
    });
  }

  // open popup when clicking the card
  card.addEventListener("click", () => {
    popupTitle.textContent = card.getAttribute("data-title");
    popupDesc.textContent = card.getAttribute("data-desc");
    popupTime.textContent = card.getAttribute("data-time");
    popupBest.textContent = card.getAttribute("data-best");
    popup.style.display = "flex";

    // set popup heart handler (the popup has .heart-btn)
    const popupHeart = popup.querySelector(".heart-btn");
    popupHeart.onclick = () => {
      const item = cardToTravelItem(card);
      toggleTravelWishlist(item, null, popupHeart);
    };

    const popupMap = popup.querySelector(".map-btn");
    popupMap.onclick = () => {
      // This will attempt to open maps directions from current location to the destination.
      // For a real implementation you'd include proper latitude/longitude with the item.
      const title = card.getAttribute("data-title");
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        title
      )}`;
      window.open(mapUrl, "_blank");
    };
  });
});

closeBtn.addEventListener("click", () => {
  popup.style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target === popup) popup.style.display = "none";
});

// --- Filtering & search (same behavior as shop) ---
function filterCards() {
  const searchValue = (searchInput.value || "").toLowerCase().trim();
  const selectedInterest = (interestFilter.value || "All").toLowerCase();
  const selectedRegion = (regionFilter.value || "All").toLowerCase();

  const interestKeywords = {
    wildlife: [
      "national park",
      "wildlife",
      "sanctuary",
      "bird",
      "river rafting",
    ],
    heritage: [
      "fort",
      "palace",
      "ruins",
      "heritage",
      "island",
      "temple",
      "fortress",
    ],
    spiritual: ["temple", "ashram", "gurudwara", "monastery", "lake"],
    adventure: [
      "trek",
      "valley",
      "rafting",
      "paragliding",
      "ski",
      "safari",
      "adventure",
    ],
  };

  cards.forEach((card) => {
    const title = (card.querySelector("h3").textContent || "").toLowerCase();
    const region = (card.querySelector("p").textContent || "").toLowerCase();
    const dataTitle = (card.getAttribute("data-title") || "").toLowerCase();
    const dataDesc = (card.getAttribute("data-desc") || "").toLowerCase();

    let interestMatch = true;
    if (selectedInterest !== "all" && selectedInterest !== "all") {
      const keywords = interestKeywords[selectedInterest] || [];
      interestMatch = keywords.some(
        (k) =>
          title.includes(k) || dataDesc.includes(k) || dataTitle.includes(k)
      );
    }

    const regionMatch =
      selectedRegion === "all" || region.includes(selectedRegion);
    const searchMatch =
      title.includes(searchValue) ||
      dataTitle.includes(searchValue) ||
      dataDesc.includes(searchValue) ||
      region.includes(searchValue);

    if (searchMatch && interestMatch && regionMatch) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}
searchInput.addEventListener("input", filterCards);
interestFilter.addEventListener("change", filterCards);
regionFilter.addEventListener("change", filterCards);

// --- Wishlist helpers ---

function cardToTravelItem(card) {
  // Build a travel-item object shape used for wishlist
  return {
    id: generateId(card.getAttribute("data-title")), // stable id from title (or you can use UUID)
    title:
      card.getAttribute("data-title") || card.querySelector("h3").textContent,
    desc: card.getAttribute("data-desc") || "",
    time: card.getAttribute("data-time") || "",
    best: card.getAttribute("data-best") || "",
    region: card.querySelector("p") ? card.querySelector("p").textContent : "",
    img: card.querySelector("img") ? card.querySelector("img").src : "",
  };
}

function generateId(seed) {
  // simple stable id using base64-ish of seed
  return btoa(seed).replace(/=/g, "").slice(0, 24);
}

async function toggleTravelWishlist(
  item,
  heartBtn = null,
  popupHeartBtn = null
) {
  try {
    // optimistic UI change
    if (heartBtn) heartBtn.innerHTML = "♥";
    if (popupHeartBtn) popupHeartBtn.textContent = "Added ✔️";

    // POST to backend
    const res = await fetch("/api/wishlist/travel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Backend save failed");
    // success — optionally refresh counts via profile page requests
    console.log("Saved to backend travel wishlist");
  } catch (err) {
    console.warn(
      "Could not save travel wishlist to backend — falling back to localStorage.",
      err
    );
    // fallback: save to localStorage
    const key = "travelWishlist";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!existing.some((i) => i.id === item.id)) {
      existing.push(item);
      localStorage.setItem(key, JSON.stringify(existing));
    }
    if (heartBtn) heartBtn.innerHTML = "♥";
    if (popupHeartBtn) popupHeartBtn.textContent = "Added ✔️";
  }
}

// checks if item exists in wishlist (backend, then local)
async function isInTravelWishlist(id) {
  try {
    const res = await fetch(`/api/wishlist/travel`);
    if (!res.ok) throw new Error("no backend");
    const items = await res.json();
    return items.some((i) => i.id === id);
  } catch (err) {
    // fallback local
    const existing = JSON.parse(localStorage.getItem("travelWishlist") || "[]");
    return existing.some((i) => i.id === id);
  }
}
