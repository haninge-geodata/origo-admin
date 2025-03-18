export async function updateProxyCache(): Promise<void> {
  const proxyUpdateUrl = process.env.PROXY_UPDATE_URL;
  if (!proxyUpdateUrl) {
    console.warn(`[${Date.now()}] PROXY_UPDATE environment variable is not set. Skipping proxy cache update.`);
    return;
  }

  try {
    const response = await fetch(proxyUpdateUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`[${Date.now()}] Failed to trigger proxy cache update: ${error}`);
  }
}
