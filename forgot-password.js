const recoveryForm = document.getElementById("recoveryForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const formAlert = document.getElementById("formAlert");
const submitButton = document.getElementById("submitButton");
const yearElement = document.getElementById("year");

if (yearElement) yearElement.textContent = new Date().getFullYear();

function showRecoveryAlert(message, type) {
  formAlert.textContent = message;
  formAlert.className = `form-alert ${type}`;
  formAlert.hidden = false;
}

if (recoveryForm) {
  recoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formAlert.hidden = true;
    emailError.textContent = "";
    emailInput.removeAttribute("aria-invalid");

    const email = emailInput.value.trim();
    if (!emailInput.validity.valid) {
      emailInput.setAttribute("aria-invalid", "true");
      emailError.textContent = "Enter a valid email address.";
      emailInput.focus();
      return;
    }

    const buttonLabel = submitButton.querySelector(".button-label");
    submitButton.disabled = true;
    buttonLabel.textContent = "Sending reset link…";
    submitButton.setAttribute("aria-busy", "true");

    try {
      const redirectTo = `${window.location.origin}/reset-password.html`;
      await window.SaffronAuth.recoverPassword(email, redirectTo);
      showRecoveryAlert("If an account exists for this email, a password reset link is on its way. Check your inbox and Spam folder.", "success");
      recoveryForm.reset();
    } catch (error) {
      console.error("Supabase password recovery error:", error);
      const message = String(error.message || "").toLowerCase();
      if (message.includes("rate limit") || message.includes("too many requests")) {
        showRecoveryAlert("Too many reset requests. Please wait a little and try again.", "error");
      } else if (message.includes("failed to fetch") || message.includes("network")) {
        showRecoveryAlert("Could not reach Supabase. Check your internet connection and try again.", "error");
      } else {
        showRecoveryAlert("We couldn't send the reset email right now. Please try again in a moment.", "error");
      }
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      buttonLabel.textContent = "Send reset link";
    }
  });
}
