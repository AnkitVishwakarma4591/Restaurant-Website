const resetForm = document.getElementById("resetForm");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const passwordError = document.getElementById("passwordError");
const formAlert = document.getElementById("formAlert");
const linkError = document.getElementById("linkError");
const resetSuccess = document.getElementById("resetSuccess");
const recoveryLink = document.getElementById("recoveryLink");
const signinLink = document.getElementById("signinLink");
const homeLink = document.querySelector(".home-link");
const submitButton = document.getElementById("submitButton");
const togglePasswordButton = document.getElementById("togglePassword");
const yearElement = document.getElementById("year");

if (yearElement) yearElement.textContent = new Date().getFullYear();

const recoverySessionFound = window.SaffronAuth.setSessionFromRecoveryUrl();
const urlParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const queryParams = new URLSearchParams(window.location.search);
const recoveryError = urlParams.get("error_description") || urlParams.get("error") ||
  queryParams.get("error_description") || queryParams.get("error");

if (recoverySessionFound) {
  resetForm.hidden = false;
  recoveryLink.hidden = true;
  homeLink.hidden = true;
} else {
  linkError.textContent = recoveryError
    ? "This reset link has expired or was already used. Request a new link to continue."
    : "Open this page from the password reset email link. If your link expired, request a new one.";
  linkError.hidden = false;
  recoveryLink.hidden = false;
}

function showResetAlert(message, type) {
  formAlert.textContent = message;
  formAlert.className = `form-alert ${type}`;
  formAlert.hidden = false;
}

if (togglePasswordButton) {
  togglePasswordButton.addEventListener("click", () => {
    const shouldShow = passwordInput.type === "password";
    passwordInput.type = shouldShow ? "text" : "password";
    confirmPasswordInput.type = shouldShow ? "text" : "password";
    togglePasswordButton.textContent = shouldShow ? "Hide" : "Show";
    togglePasswordButton.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
    togglePasswordButton.setAttribute("aria-pressed", String(shouldShow));
  });
}

if (resetForm) {
  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formAlert.hidden = true;
    passwordError.textContent = "";
    passwordInput.removeAttribute("aria-invalid");
    confirmPasswordInput.removeAttribute("aria-invalid");

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    if (password.length < 8) {
      passwordInput.setAttribute("aria-invalid", "true");
      passwordError.textContent = "Your password must be at least 8 characters.";
      passwordInput.focus();
      return;
    }
    if (password !== confirmPassword) {
      confirmPasswordInput.setAttribute("aria-invalid", "true");
      passwordError.textContent = "The passwords do not match.";
      confirmPasswordInput.focus();
      return;
    }

    const buttonLabel = submitButton.querySelector(".button-label");
    submitButton.disabled = true;
    buttonLabel.textContent = "Updating password…";
    submitButton.setAttribute("aria-busy", "true");

    try {
      await window.SaffronAuth.updatePassword(password);
      resetForm.hidden = true;
      resetSuccess.textContent = "Your password has been updated. You can now sign in with your new password.";
      resetSuccess.hidden = false;
      signinLink.hidden = false;
      homeLink.hidden = true;
    } catch (error) {
      console.error("Supabase password update error:", error);
      const message = String(error.message || "").toLowerCase();
      showResetAlert(
        message.includes("expired") || message.includes("invalid")
          ? "This reset link has expired or was already used. Request a new reset link."
          : "We couldn't update your password. Please request a new reset link and try again.",
        "error"
      );
      if (message.includes("expired") || message.includes("invalid")) recoveryLink.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      buttonLabel.textContent = "Update password";
    }
  });
}
