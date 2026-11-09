import React from "react";
import { ReactQueryClientProvider } from "@/components/TanStack/ReactQueryClientProvider";
import ThemeProvider from "@/themes/theme";
import ClientWrapper from "@/components/ClientWrapper";
import { AppProvider } from '../contexts/AppContext';

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session is fetched client side, refreshed tokens can't be saved from a server component
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const sessionRefetchInterval = authEnabled ? parseInt(process.env.PROTECTED_SESSION_REFETCH_INTERVAL || "") || 240 : 0;

  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body>
          <ThemeProvider>
            <AppProvider>
              <ClientWrapper sessionRefetchInterval={sessionRefetchInterval} children={children}></ClientWrapper>
            </AppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
