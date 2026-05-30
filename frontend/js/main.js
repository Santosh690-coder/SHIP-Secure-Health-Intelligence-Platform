// main.js
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

  if (!menuToggle || !mobileNav) return;

  const openMenu = () => {
    mobileNav.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.classList.add("is-open");
  };

  const closeMenu = () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.classList.remove("is-open");
  };

  const toggleMenu = () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
      if (mobileLinks.length) mobileLinks[0].focus();
    }
  };

  menuToggle.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuToggle.getAttribute("aria-expanded") === "true" &&
      !mobileNav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  closeMenu();

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});