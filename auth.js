const signupForm = document.getElementById("signupForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitButton = document.getElementById("submitButton");
const formAlert = document.getElementById("formAlert");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePasswordButton = document.getElementById("togglePassword");
const yearElement = document.getElementById("year");

if (yearElement) yearElement.textContent = new Date().getFullYear();

function showAlert(message, type) {
  formAlert.textContent = message;
  formAlert.className = `form-alert ${type}`;
  formAlert.hidden = false;
}

function setInvalid(input, messageElement, message) {
  input.setAttribute("aria-invalid", "true");
  messageElement.textContent = message;
}

function clearInvalid(input, messageElement) {
  input.removeAttribute("aria-invalid");
  messageElement.textContent = "";
}

function getAuthErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "An account may already exist for this email. Try signing in, or use another email address.";
  }
  if (message.includes("password") && (message.includes("weak") || message.includes("length"))) {
    return "Choose a stronger password with at least 8 characters.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts were made. Please wait a little and try again.";
  }
  if (message.includes("invalid api key") || message.includes("invalid api_key")) {
    return "Supabase rejected the configured publishable key. Check the project key in auth.js.";
  }
  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Could not reach Supabase. Check your internet connection and try again.";
  }
  return "We couldn't create your account right now. Please try again in a moment.";
}

if (togglePasswordButton && passwordInput) {
  togglePasswordButton.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    confirmPasswordInput.type = shouldShow ? "text" : "password";
    togglePasswordButton.textContent = shouldShow ? "Hide" : "Show";
    togglePasswordButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    togglePasswordButton.setAttribute("aria-pressed", String(shouldShow));
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formAlert.hidden = true;
    clearInvalid(emailInput, emailError);
    clearInvalid(passwordInput, passwordError);
    clearInvalid(confirmPasswordInput, passwordError);

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    if (!emailInput.validity.valid) {
      setInvalid(emailInput, emailError, "Enter a valid email address.");
      isValid = false;
    }
    if (password.length < 8) {
      setInvalid(passwordInput, passwordError, "Your password must be at least 8 characters.");
      isValid = false;
    }
    if (confirmPassword !== password) {
      setInvalid(confirmPasswordInput, passwordError, "The passwords do not match.");
      isValid = false;
    }

    if (!isValid) {
      (emailInput.getAttribute("aria-invalid") ? emailInput : passwordInput).focus();
      return;
    }

    const buttonLabel = submitButton.querySelector(".button-label");
    submitButton.disabled = true;
    buttonLabel.textContent = "Creating your account…";
    submitButton.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(`${window.SAFFRON_AUTH_CONFIG.supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: window.SAFFRON_AUTH_CONFIG.publishableKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.msg || result.message || result.error_description || "Signup request failed.");
      }

      if (Array.isArray(result.identities) && result.identities.length === 0) {
        showAlert("An account may already exist for this email. Try signing in or use another email address.", "error");
        return;
      }

      if (result.session) window.SaffronAuth.saveSession(result.session);

      signupForm.reset();
      showAlert(
        result.session
          ? "Your account was created and you are signed in. Welcome to Saffron & Ember!"
          : "Your account has been created. Check your inbox for the confirmation link to finish signing up.",
        "success"
      );
    } catch (error) {
      console.error("Supabase sign-up error:", error);
      showAlert(getAuthErrorMessage(error), "error");
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      buttonLabel.textContent = "Create account";
    }
  });
}
