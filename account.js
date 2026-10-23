const accountLoading = document.getElementById("accountLoading");
const accountContent = document.getElementById("accountContent");
const accountSignedOut = document.getElementById("accountSignedOut");
const accountEmail = document.getElementById("accountEmail");
const accountSignOut = document.getElementById("accountSignOut");
const yearElement = document.getElementById("year");

if (yearElement) yearElement.textContent = new Date().getFullYear();

window.SaffronAuth.getCurrentUser().then((user) => {
  accountLoading.hidden = true;
  if (!user) {
    accountSignedOut.hidden = false;
    return;
  }

  accountEmail.textContent = user.email || "Signed-in account";
  accountContent.hidden = false;
});

accountSignOut.addEventListener("click", async () => {
  accountSignOut.disabled = true;
  accountSignOut.textContent = "Signing out…";
  try {
    await window.SaffronAuth.signOut();
  } catch (error) {
    console.error("Supabase sign-out error:", error);
  } finally {
    window.location.href = "login.html";
  }
});
