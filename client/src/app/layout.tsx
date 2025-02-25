import React from "react";
import { ReactQueryClientProvider } from "@/components/TanStack/ReactQueryClientProvider";
import ThemeProvider from "@/themes/theme";
import ClientWrapper from "@/components/ClientWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { AppProvider } from '../contexts/AppContext';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = process.env.AUTH_ENABLED ? await getServerSession(authOptions) : null;

  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body>
          <ThemeProvider>
            <AppProvider>
              <ClientWrapper session={session} children={children}></ClientWrapper>
            </AppProvider>
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}