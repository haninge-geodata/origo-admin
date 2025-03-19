export async function updateProxyCache(): Promise<void> {
  const proxyUpdateUrl = process.env.PROXY_UPDATE_URL;
  if (!proxyUpdateUrl) {
    console.warn(`[${new Date().toISOString()}] PROXY_UPDATE environment variable is not set. Skipping proxy cache update.`);
    return;
  }

  try {
    const response = await fetch(proxyUpdateUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to trigger proxy cache update: ${error}`);
  }
}
