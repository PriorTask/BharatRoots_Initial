/* shop.js
   - Adds heart buttons to each product card (product wishlist)
   - Sends POST to /api/wishlist/shop, falls back to localStorage
   - Keeps the "Add to Cart" alert behavior as before
*/

const filterSelect = document.getElementById("categoryFilter");
const products = Array.from(document.querySelectorAll(".product-card"));

// existing filter logic for categories
if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    const category = filterSelect.value;
    products.forEach((card) => {
      if (category === "all" || card.dataset.category === category) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
}

// ensure each product card has a heart button for wishlist
products.forEach((card) => {
  if (!card.querySelector(".product-heart")) {
    const heart = document.createElement("button");
    heart.className = "product-heart";
    heart.title = "Add to Product Wishlist";
    heart.innerHTML = "♡";
    heart.style =
      "position:absolute; top:12px; right:12px; background:transparent; border:none; font-size:20px; cursor:pointer;";
    card.style.position = "relative";
    card.appendChild(heart);

    heart.addEventListener("click", async (e) => {
      e.stopPropagation();
      const product = cardToProduct(card);
      await toggleProductWishlist(product, heart);
    });

    // reflect saved state
    isInProductWishlist(cardToProduct(card).id).then((inList) => {
      if (inList) heart.innerHTML = "♥";
    });
  }
});

// Add-to-cart placeholder
const addButtons = document.querySelectorAll(".add-btn");
addButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("Item added to cart! (Backend integration coming soon)");
  });
});

// helper to build product object
function cardToProduct(card) {
  return {
    id: generateId(
      card.querySelector("h3").textContent ||
        card.dataset.category ||
        Math.random().toString(36).slice(2, 9)
    ),
    title: card.querySelector("h3").textContent,
    price: card.querySelector("p").textContent,
    category: card.dataset.category || "",
    region: card.dataset.region || "",
    img: card.querySelector("img") ? card.querySelector("img").src : "",
  };
}

function generateId(seed) {
  return btoa(seed).replace(/=/g, "").slice(0, 24);
}

async function toggleProductWishlist(item, heartBtn) {
  try {
    if (heartBtn) heartBtn.innerHTML = "♥";
    const res = await fetch("/api/wishlist/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Backend save failed");
    console.log("Saved product to backend wishlist");
  } catch (err) {
    console.warn("Falling back to localStorage for product wishlist", err);
    const key = "productWishlist";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    if (!existing.some((i) => i.id === item.id)) {
      existing.push(item);
      localStorage.setItem(key, JSON.stringify(existing));
    }
    if (heartBtn) heartBtn.innerHTML = "♥";
  }
}

async function isInProductWishlist(id) {
  try {
    const res = await fetch("/api/wishlist/shop");
    if (!res.ok) throw new Error("no backend");
    const items = await res.json();
    return items.some((i) => i.id === id);
  } catch (err) {
    const existing = JSON.parse(
      localStorage.getItem("productWishlist") || "[]"
    );
    return existing.some((i) => i.id === id);
  }
}
