/* ==========================================
   ANU Meal Booking – Global System Script
   ========================================== */

// ---------- INITIALIZATION ----------
document.addEventListener("DOMContentLoaded", () => {
  initializeSession();
  applySettings();
  setupGlobalListeners();
});

// ---------- SESSION HANDLING ----------
function initializeSession() {
  const session = JSON.parse(localStorage.getItem("anu_session"));
  const currentPage = window.location.pathname.toLowerCase();

  if (!session && !currentPage.includes("login")) {
    // not logged in → redirect
    window.location.href = "../login.html";
    return;
  }

  // restrict pages by role
  if (session) {
    const role = (session.role || "").toLowerCase();

    if (role === "admin") {
      // hide user management + settings links
      const userMgmtLink = document.querySelector('a[href*="UserManagement"]');
      const settingsLink = document.querySelector('a[href*="Setting"]');
      if (userMgmtLink) userMgmtLink.style.display = "none";
      if (settingsLink) settingsLink.style.display = "none";
    }

    // Redirect unauthorized page access
    if (
      (role === "admin" &&
        (currentPage.includes("usermanagement") || currentPage.includes("setting"))) ||
      (role === "student" && currentPage.includes("/admin/"))
    ) {
      alert("Access denied.");
      window.location.href = role === "student" ? "../student/dashboard.html" : "Dashboard.html";
    }
  }
}

// ---------- SETTINGS HANDLING ----------
const defaultSettings = {
  orgName: "Africa Nazarene University",
  orgEmail: "support@anu.ac.ke",
  timezone: "Africa/Nairobi",
  darkMode: false,
  sidebarCollapse: false,
  mealAlerts: true,
  emailReports: false,
  bookingOpen: "06:00",
  bookingClose: "10:00",
  autoReset: true,
};

// Apply settings visually and functionally
function applySettings() {
  const s = JSON.parse(localStorage.getItem("anu_settings")) || defaultSettings;

  // 1. Dark mode
  if (s.darkMode) {
    document.body.classList.add("dark-mode");
    document.body.style.background = "#111";
    document.body.style.color = "#eee";
  } else {
    document.body.classList.remove("dark-mode");
    document.body.style.background = "#f5f5f5";
    document.body.style.color = "#222";
  }

  // 2. Sidebar collapse
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.toggle("collapsed", s.sidebarCollapse);

  // 3. Update organization name in header if present
  const orgNameEls = document.querySelectorAll(".org-name");
  orgNameEls.forEach((el) => (el.textContent = s.orgName));

  // 4. Booking time restrictions on student side
  if (window.location.pathname.toLowerCase().includes("student")) {
    restrictBookingTimes(s.bookingOpen, s.bookingClose);
  }
}

// ---------- BOOKING TIME LOGIC ----------
function restrictBookingTimes(openTime, closeTime) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const open = openH * 60 + openM;
  const close = closeH * 60 + closeM;

  const bookingBtn = document.getElementById("bookMealBtn");
  if (bookingBtn) {
    if (current < open || current > close) {
      bookingBtn.disabled = true;
      bookingBtn.title = `Booking is closed. Open between ${openTime} and ${closeTime}`;
    } else {
      bookingBtn.disabled = false;
      bookingBtn.title = "Booking available";
    }
  }
}

// ---------- LISTENERS (LIVE SYNC) ----------
function setupGlobalListeners() {
  // Respond to changes in settings made in Settings page
  window.addEventListener("storage", (e) => {
    if (e.key === "anu_settings") {
      applySettings();
      showToast("System settings updated globally.", true);
    }

    if (e.key === "anu_users") {
      console.log("User data changed globally.");
    }

    if (e.key === "meal_validation_log") {
      console.log("Meal validation feed updated.");
      updateLiveFeed && updateLiveFeed();
    }
  });

  // Logout listener (if button exists)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("anu_session");
      window.location.href = "../login.html";
    });
  }
}

// ---------- TOAST UTILITY ----------
function showToast(msg, success = true) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "8px";
    toast.style.color = "white";
    toast.style.zIndex = "10000";
    toast.style.transition = "opacity 0.3s";
    toast.style.opacity = "0";
    document.body.appendChild(toast);
  }
  toast.style.background = success ? "#2e7d32" : "#c62828";
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => (toast.style.opacity = "0"), 2500);
}

// ---------- AUTO RESET BOOKINGS ----------
function autoResetBookings() {
  const s = JSON.parse(localStorage.getItem("anu_settings")) || defaultSettings;
  if (!s.autoReset) return;

  const lastReset = localStorage.getItem("anu_last_reset");
  const today = new Date().toDateString();

  if (lastReset !== today) {
    localStorage.setItem("anu_bookings", JSON.stringify([]));
    localStorage.setItem("anu_last_reset", today);
    console.log("Bookings auto-reset for new day");
  }
}
autoResetBookings();
