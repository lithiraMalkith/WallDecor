/**
 * Converts Firebase and system authentication errors into clean, human-readable messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return "";

  const code =
    error?.code ||
    (typeof error === "string" ? error : error?.message || "");

  if (typeof code === "string") {
    if (code.includes("email-already-in-use")) {
      return "This email is already registered. Please sign in instead.";
    }
    if (
      code.includes("invalid-credential") ||
      code.includes("wrong-password") ||
      code.includes("user-not-found")
    ) {
      return "Incorrect email or password.";
    }
    if (code.includes("weak-password")) {
      return "Password must be at least 6 characters.";
    }
    if (code.includes("invalid-email")) {
      return "Please enter a valid email address.";
    }
    if (code.includes("too-many-requests")) {
      return "Too many attempts. Please try again in a few minutes.";
    }
    if (
      code.includes("popup-closed-by-user") ||
      code.includes("cancelled-popup-request")
    ) {
      return "Google sign-in was cancelled.";
    }
    if (code.includes("network-request-failed")) {
      return "Network connection issue. Please try again.";
    }
    if (code.includes("user-disabled")) {
      return "This account has been disabled.";
    }
    if (code.includes("operation-not-allowed")) {
      return "Sign-in method is currently disabled.";
    }
  }

  const rawMessage = typeof error === "string" ? error : error?.message || "";

  // Strip Firebase internal prefix if present
  if (rawMessage.startsWith("Firebase: Error (auth/") || rawMessage.startsWith("Firebase:")) {
    const match = rawMessage.match(/\(auth\/([a-z-]+)\)/);
    if (match && match[1]) {
      return formatAuthError({ code: `auth/${match[1]}` });
    }
  }

  if (rawMessage && !rawMessage.includes("Firebase") && !rawMessage.includes("auth/")) {
    return rawMessage;
  }

  return "Unable to sign in. Please verify your details.";
}
