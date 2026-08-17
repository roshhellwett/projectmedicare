export async function validateTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Turnstile secret key is not configured; allowing local development requests.");
      return true;
    }

    console.error("Turnstile secret key is not configured in production.");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return false;
  }
}
