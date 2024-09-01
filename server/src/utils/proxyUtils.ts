export async function updateProxyCache(): Promise<void> {
  const proxyUpdateUrl = process.env.PROXY_UPDATE_URL;
  if (!proxyUpdateUrl) {
    console.warn("PROXY_UPDATE environment variable is not set. Skipping proxy cache update.");
    return;
  }

  try {
    const response = await fetch(proxyUpdateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to trigger proxy cache update:", error);
  }
}
