
/* =========================================
   WATCHTOWER WEBSITE
   File: script.js
========================================= */

"use strict";

/* =========================================
   1. CONFIGURATION
========================================= */

const WATCHTOWER_CONFIG = {
  apiUrl: "https://watchtower-bot-8ndk.onrender.com",
  statusRefreshInterval: 30000
};

/* =========================================
   2. MOBILE NAVIGATION
========================================= */

function initializeNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");

  if (!toggle || !nav) return;

  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    });
  });

  document.addEventListener("click", (event) => {
    if (
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
}

/* =========================================
   3. AUTOMATIC COPYRIGHT YEAR
========================================= */

function initializeCopyright() {
  const yearElements = document.querySelectorAll(
    "#current-year, [data-current-year]"
  );

  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

/* =========================================
   4. ACTIVE NAVIGATION LINK
========================================= */

function initializeActiveNavigation() {
  const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href.startsWith("#")) {
      return;
    }

    const linkedPage = href.split("#")[0];

    if (linkedPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* =========================================
   5. BACKEND HEALTH CHECK
========================================= */

async function checkBackendHealth() {
  const statusElements = document.querySelectorAll(
    "[data-backend-status]"
  );

  if (statusElements.length === 0) return;

  statusElements.forEach((element) => {
    element.textContent = "Checking...";
  });

  try {
    const response = await fetch(
      `${WATCHTOWER_CONFIG.apiUrl}/api/health`,
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`);
    }

    const data = await response.json();

    const isOnline =
      data.status === "online" ||
      data.status === "ok" ||
      data.success === true;

    statusElements.forEach((element) => {
      element.textContent = isOnline ? "Online" : "Unavailable";

      element.classList.toggle("online", isOnline);
      element.classList.toggle("offline", !isOnline);

      element.setAttribute(
        "aria-label",
        `Backend status: ${isOnline ? "Online" : "Unavailable"}`
      );
    });

    updateStatusMessage(
      isOnline
        ? "The Watchtower backend is responding."
        : "The backend responded, but its status is not confirmed."
    );
  } catch (error) {
    console.error("[Watchtower] Backend health check failed:", error);

    statusElements.forEach((element) => {
      element.textContent = "Unavailable";
      element.classList.remove("online");
      element.classList.add("offline");
    });

    updateStatusMessage(
      "Could not reach the backend. It may be starting up or temporarily unavailable."
    );
  }
}

function updateStatusMessage(message) {
  document.querySelectorAll("[data-status-message]").forEach(
    (element) => {
      element.textContent = message;
    }
  );
}

/* =========================================
   6. BACKEND STATUS REFRESH
========================================= */

function initializeStatusRefresh() {
  if (!document.querySelector("[data-backend-status]")) {
    return;
  }

  checkBackendHealth();

  window.setInterval(
    checkBackendHealth,
    WATCHTOWER_CONFIG.statusRefreshInterval
  );
}

/* =========================================
   7. BUTTON LOADING HELPERS
========================================= */

function setButtonLoading(button, loading, loadingText = "Please wait...") {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = loadingText;
    button.setAttribute("aria-busy", "true");
  } else {
    button.disabled = false;

    if (button.dataset.originalText !== undefined) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }

    button.removeAttribute("aria-busy");
  }
}

/* =========================================
   8. COPY-TO-CLIPBOARD BUTTONS
========================================= */

function initializeCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");

      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);

        const originalText = button.textContent;
        button.textContent = "Copied!";

        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      } catch (error) {
        console.error("[Watchtower] Copy failed:", error);
        alert("Copy failed. Please select and copy the text manually.");
      }
    });
  });
}

/* =========================================
   9. SMOOTH SCROLL FOR PAGE LINKS
========================================= */

function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      if (target.id) {
        history.replaceState(null, "", `#${target.id}`);
      }
    });
  });
}

/* =========================================
   10. EXTERNAL LINK SAFETY
========================================= */

function initializeExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
  });
}

/* =========================================
   11. INITIALIZE WEBSITE
========================================= */

function initializeWatchtowerWebsite() {
  initializeNavigation();
  initializeCopyright();
  initializeActiveNavigation();
  initializeStatusRefresh();
  initializeCopyButtons();
  initializeSmoothScrolling();
  initializeExternalLinks();

  console.log("[Watchtower] Website initialized.");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeWatchtowerWebsite,
    { once: true }
  );
} else {
  initializeWatchtowerWebsite();
}
