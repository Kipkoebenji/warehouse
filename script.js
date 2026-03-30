const BOOKING_KEY = "storageBookings";

const bookingForm = document.getElementById("bookingForm");
const unitSelect = document.getElementById("unitSelect");
const formMessage = document.getElementById("formMessage");
const bookingList = document.getElementById("bookingList");
const emptyState = document.getElementById("emptyState");
const clearBookingsBtn = document.getElementById("clearBookingsBtn");
const viewBookingsBtn = document.getElementById("viewBookingsBtn");
const unitButtons = document.querySelectorAll(".unit-book-btn");
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

const revealElements = document.querySelectorAll(".reveal");
const storySection = document.getElementById("story");
const storySteps = document.querySelectorAll(".reveal-step");
const parallaxLayers = document.querySelectorAll("[data-parallax]");
const zoomLayer = document.querySelector("[data-zoom]");
const heroLayer = document.querySelector(".hero-media");

function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKING_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem(BOOKING_KEY, JSON.stringify(list));
}

function setFormMessage(message, type) {
  formMessage.textContent = message;
  formMessage.classList.remove("success", "error");
  if (type) formMessage.classList.add(type);
}

function isValidPhone(phone) {
  return /^[+\d][\d\s-]{6,}$/.test(phone.trim());
}

function prefillUnit(unitName) {
  unitSelect.value = unitName;
  bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderBookings() {
  const bookings = getBookings();
  bookingList.innerHTML = "";

  if (!bookings.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  bookings.forEach((booking, index) => {
    const card = document.createElement("article");
    card.className = "booking-item";
    card.innerHTML = `
      <h4>${booking.unit}</h4>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Duration:</strong> ${booking.duration} month(s)</p>
      <p><strong>Total:</strong> $${booking.totalPrice}</p>
      <p><strong>Booked on:</strong> ${booking.bookedOn}</p>
      <p><strong>Booking #:</strong> ${index + 1}</p>
    `;
    bookingList.appendChild(card);
  });
}

// Intersection observer powers fade + slide reveal animation.
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  }
);

revealElements.forEach((el) => revealObserver.observe(el));

// RequestAnimationFrame keeps scroll animations smooth.
let ticking = false;

function animateOnScroll() {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY;

  parallaxLayers.forEach((layer) => {
    const speed = Number(layer.dataset.speed || 0.2);
    const offset = scrollY * speed;
    layer.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  if (heroLayer) {
    const heroRect = heroLayer.parentElement.getBoundingClientRect();
    const progress = Math.min(Math.max(-heroRect.top / viewportHeight, 0), 1);
    const scale = 1 + progress * 0.12;
    heroLayer.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0) scale(${scale})`;
  }

  if (zoomLayer) {
    const section = zoomLayer.parentElement;
    const rect = section.getBoundingClientRect();
    const sectionProgress = Math.min(Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0), 1);
    const zoomScale = 1 + sectionProgress * 0.24;
    zoomLayer.style.transform = `scale(${zoomScale})`;
  }

  if (storySection) {
    const rect = storySection.getBoundingClientRect();
    const total = storySection.offsetHeight - viewportHeight;
    const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
    const activeIndex = Math.min(storySteps.length - 1, Math.floor(progress * storySteps.length));

    storySteps.forEach((step, idx) => {
      step.classList.toggle("active", idx === activeIndex);
    });
  }

  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(animateOnScroll);
    ticking = true;
  }
}, { passive: true });

window.addEventListener("resize", animateOnScroll);

unitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".unit-card");
    const unitName = card ? card.dataset.unitName : "";
    if (unitName) prefillUnit(unitName);
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setFormMessage("", "");

  const data = new FormData(bookingForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const unit = String(data.get("unit") || "").trim();
  const duration = Number(data.get("duration") || 0);

  if (!name || !email || !phone || !unit || duration < 1) {
    setFormMessage("Please fill all required fields.", "error");
    return;
  }

  if (!isValidPhone(phone)) {
    setFormMessage("Please provide a valid phone number.", "error");
    return;
  }

  const option = unitSelect.options[unitSelect.selectedIndex];
  const monthly = Number(option.dataset.price || 0);

  const booking = {
    name,
    email,
    phone,
    unit,
    duration,
    pricePerMonth: monthly,
    totalPrice: monthly * duration,
    bookedOn: new Date().toLocaleString()
  };

  const existing = getBookings();
  existing.push(booking);
  saveBookings(existing);

  renderBookings();
  bookingForm.reset();
  setFormMessage("Booking confirmed. Your storage unit has been reserved.", "success");

  document.getElementById("dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
});

viewBookingsBtn.addEventListener("click", () => {
  document.getElementById("dashboard").scrollIntoView({ behavior: "smooth", block: "start" });
});

clearBookingsBtn.addEventListener("click", () => {
  localStorage.removeItem(BOOKING_KEY);
  renderBookings();
  setFormMessage("All bookings have been cleared.", "success");
});

menuToggle.addEventListener("click", () => {
  siteNav.classList.toggle("open");
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
  });
});

renderBookings();
animateOnScroll();
