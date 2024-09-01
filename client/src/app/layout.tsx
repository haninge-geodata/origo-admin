import React, { } from "react";
import { ReactQueryClientProvider } from "@/components/TanStack/ReactQueryClientProvider";
import ThemeProvider from "@/themes/theme";
import { Session } from "next-auth";
import ClientWrapper from "@/components/ClientWrapper";

type RootLayoutProps = {
  session: Session | null;
  children: React.ReactNode;
};

export default async function RootLayout({ children, session }: RootLayoutProps) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body>
          <ThemeProvider>
            <ClientWrapper children={children} session={session}></ClientWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
