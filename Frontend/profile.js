const wishlistBtn = document.getElementById("wishlistBtn");
const modal = document.getElementById("wishlistModal");
const modalClose = document.getElementById("modalClose");
const openTravel = document.getElementById("openTravelWishlist");
const openProduct = document.getElementById("openProductWishlist");
const travelCountEl = document.getElementById("travelCount");
const productCountEl = document.getElementById("productCount");

wishlistBtn.addEventListener("click", async () => {
  modal.style.display = "flex";
  const [tCount, pCount] = await Promise.all([
    getTravelCount(),
    getProductCount(),
  ]);
  travelCountEl.textContent = `(${tCount})`;
  productCountEl.textContent = `(${pCount})`;
});

modalClose.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

openTravel.addEventListener("click", () => {
  window.location.href = "wishlist-travel.html";
});
openProduct.addEventListener("click", () => {
  window.location.href = "wishlist-shop.html";
});

// -------- Get Wishlist Counts -------- //
async function getTravelCount() {
  try {
    const res = await fetch("http://localhost:5000/api/wishlist/travel");
    if (!res.ok) throw new Error("no backend");
    const arr = await res.json();
    return arr.length;
  } catch {
    const arr = JSON.parse(localStorage.getItem("travelWishlist") || "[]");
    return arr.length;
  }
}

async function getProductCount() {
  try {
    const res = await fetch("http://localhost:5000/api/wishlist/shop");
    if (!res.ok) throw new Error("no backend");
    const arr = await res.json();
    return arr.length;
  } catch {
    const arr = JSON.parse(localStorage.getItem("productWishlist") || "[]");
    return arr.length;
  }
}

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
} else {
  document.getElementById("profile-name").textContent = user.name;
  document.getElementById("member-since").textContent = "Member since: 2025";
}

const logoutBtn = document.createElement("button");
logoutBtn.textContent = "Logout";
logoutBtn.classList.add("secondary");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});
document.querySelector(".profile-actions").appendChild(logoutBtn);
