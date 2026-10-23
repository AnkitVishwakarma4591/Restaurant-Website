const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submitButton");
const formAlert = document.getElementById("formAlert");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePasswordButton = document.getElementById("togglePassword");
const yearElement = document.getElementById("year");

if (yearElement) yearElement.textContent = new Date().getFullYear();

function showLoginAlert(message, type) {
  formAlert.textContent = message;
  formAlert.className = `form-alert ${type}`;
  formAlert.hidden = false;
}

if (togglePasswordButton) {
  togglePasswordButton.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    togglePasswordButton.textContent = shouldShow ? "Hide" : "Show";
    togglePasswordButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    togglePasswordButton.setAttribute("aria-pressed", String(shouldShow));
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formAlert.hidden = true;
    emailError.textContent = "";
    passwordError.textContent = "";
    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;

    if (!emailInput.validity.valid) {
      emailInput.setAttribute("aria-invalid", "true");
      emailError.textContent = "Enter a valid email address.";
      valid = false;
    }
    if (!password) {
      passwordInput.setAttribute("aria-invalid", "true");
      passwordError.textContent = "Enter your password.";
      valid = false;
    }
    if (!valid) {
      (emailInput.getAttribute("aria-invalid") ? emailInput : passwordInput).focus();
      return;
    }

    const buttonLabel = submitButton.querySelector(".button-label");
    submitButton.disabled = true;
    buttonLabel.textContent = "Signing in…";
    submitButton.setAttribute("aria-busy", "true");

    try {
      await window.SaffronAuth.signIn(email, password);
      showLoginAlert("You're signed in. Taking you back to the restaurant…", "success");
      window.setTimeout(() => {
        window.location.href = "index.html?auth=signed-in";
      }, 700);
    } catch (error) {
      console.error("Supabase sign-in error:", error);
      const message = String(error.message || "").toLowerCase();
      if (message.includes("email not confirmed")) {
        showLoginAlert("Please confirm your email using the link in your inbox before signing in.", "error");
      } else if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
        showLoginAlert("Email or password is incorrect. Check both and try again.", "error");
      } else if (message.includes("rate limit") || message.includes("too many requests")) {
        showLoginAlert("Too many attempts. Please wait a little before trying again.", "error");
      } else if (message.includes("failed to fetch") || message.includes("network")) {
        showLoginAlert("Could not reach Supabase. Check your internet connection and try again.", "error");
      } else {
        showLoginAlert("We couldn't sign you in right now. Please try again in a moment.", "error");
      }
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      buttonLabel.textContent = "Sign in";
    }
  });
}
