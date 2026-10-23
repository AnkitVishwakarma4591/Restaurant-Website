
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const bookingForm = document.getElementById("bookingForm");
const bookingDate = document.getElementById("bookingDate");
const formMessage = document.getElementById("formMessage");
const accountLink = document.querySelector("[data-account-link]");
const signOutButton = document.getElementById("signOutButton");

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby91TXcgFiQRr_m2_F1UyjH7wrt425ZUPXrhOgOkIjB_gI0pTJWLaWZI5GXVCwhUMbP/exec";
const SUPABASE_URL = "https://puusxhlglndguvqiuedf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_MqhNzT_0r_muqYDA3fedLw_Wl8ICIaq";

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

// Reflect the saved Supabase Auth session in the site navigation.
if (window.SaffronAuth && accountLink && signOutButton) {
  window.SaffronAuth.getCurrentUser().then((user) => {
    if (!user) return;
    accountLink.textContent = "My account";
    accountLink.href = "account.html";
    signOutButton.hidden = false;
  });

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out…";
    try {
      await window.SaffronAuth.signOut();
    } catch (error) {
      console.error("Supabase sign-out error:", error);
    } finally {
      window.location.href = "index.html";
    }
  });
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
      const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(booking)
      });

      if (!supabaseResponse.ok) {
        const details = await supabaseResponse.text();
        console.error("Supabase booking error:", supabaseResponse.status, details);
        throw new Error("Supabase could not save the booking.");
      }

      // Submit as a normal cross-origin HTML form. This avoids fetch/CORS
      // restrictions when the website is opened directly from a local file.
      const frameName = "googleSheetsSubmissionFrame";
      if (!document.getElementById(frameName)) {
        const frame = document.createElement("iframe");
        frame.name = frameName;
        frame.id = frameName;
        frame.title = "Google Sheets submission";
        frame.hidden = true;
        document.body.appendChild(frame);
      }

      const googleForm = document.createElement("form");
      googleForm.method = "POST";
      googleForm.action = GOOGLE_SCRIPT_URL;
      googleForm.target = frameName;
      googleForm.hidden = true;

      Object.entries(booking).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        googleForm.appendChild(input);
      });

      document.body.appendChild(googleForm);
      googleForm.submit();
      googleForm.remove();

      formMessage.textContent =
        `Thank you, ${booking.name}! Your request was saved to Supabase and sent to Google Sheets. ` +
        "Please wait for the restaurant to confirm your reservation.";

      formMessage.classList.add("success");

      bookingForm.reset();
      bookingDate.min = getLocalDate();

    } catch (error) {
      console.error("Booking submission error:", error);

      formMessage.textContent = error.message.includes("Supabase")
        ? "We couldn't save your request to Supabase, so it wasn't sent to Google Sheets. Please try again later."
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
