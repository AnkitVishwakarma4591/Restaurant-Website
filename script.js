
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const bookingForm = document.getElementById("bookingForm");
const bookingDate = document.getElementById("bookingDate");
const formMessage = document.getElementById("formMessage");

// Supabase > Project Settings > API. Use the publishable (or legacy anon) key;
// never put a service_role/secret key in browser code.
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";

// Mobile navigation
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

// Set today's date as the earliest booking date
function getLocalDate() {
  const now = new Date();
  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 10);
}

if (bookingDate) {
  bookingDate.min = getLocalDate();
}

// Update footer year
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Booking form submission
if (bookingForm && bookingDate && formMessage) {
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.className = "form-message";

    if (!bookingForm.reportValidity()) {
      return;
    }

    const formData = new FormData(bookingForm);

    const booking = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      date: String(formData.get("date") || "").trim(),
      time: String(formData.get("time") || "").trim(),
      guests: String(formData.get("guests") || "").trim(),
      occasion: String(formData.get("occasion") || "").trim(),
      requests: String(formData.get("requests") || "").trim()
    };

    if (
      !booking.name ||
      !booking.phone ||
      !booking.date ||
      !booking.time ||
      !booking.guests
    ) {
      formMessage.textContent =
        "Please complete all required booking fields.";
      formMessage.classList.add("error");
      return;
    }

    if (booking.date < getLocalDate()) {
      formMessage.textContent =
        "Please choose today or a future date.";
      formMessage.classList.add("error");
      bookingDate.focus();
      return;
    }

    const submitButton = bookingForm.querySelector(
      'button[type="submit"]'
    );

    if (!submitButton) {
      formMessage.textContent =
        "The booking button could not be found.";
      formMessage.classList.add("error");
      return;
    }

    const originalButtonHTML = submitButton.innerHTML;

    submitButton.disabled = true;
    submitButton.textContent = "Submitting your request...";

    try {
      if (
        SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" ||
        SUPABASE_ANON_KEY === "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
      ) {
        throw new Error("Supabase setup is incomplete. Add the project URL and publishable key in script.js.");
      }

      const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify(booking)
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("Supabase booking error:", response.status, details);
        throw new Error("Supabase rejected the booking. Check the table and RLS policy.");
      }

      formMessage.textContent =
        `Thank you, ${booking.name}! Your request has been submitted. ` +
        "Please wait for the restaurant to confirm your reservation.";

      formMessage.classList.add("success");

      bookingForm.reset();
      bookingDate.min = getLocalDate();

    } catch (error) {
      console.error("Booking submission error:", error);

      formMessage.textContent = error.message.includes("Supabase")
        ? "We couldn't save your request. Please try again later or contact the restaurant."
        : "We couldn't send your request. Please check your connection and try again.";

      formMessage.classList.add("error");

    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonHTML;

      formMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  });
}
