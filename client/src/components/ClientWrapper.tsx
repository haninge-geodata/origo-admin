"use client";
import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { CssBaseline } from "@mui/material";
import Navigation from "@/components/Navigation/Navigation";

interface props {
  children: React.ReactNode;
  session: Session | null;
}

const ClientWrapper: React.FC<props> = ({ children, session }) => {
  const isDrawerOpen = true;
  const divStyles = {
    marginLeft: isDrawerOpen ? "240px" : "40px",
    marginTop: "30px",
    transition: "margin 0.3s"
  };
  return (
    <>
      <SessionProvider session={session}>
        <CssBaseline />
        <Navigation />
        <div style={divStyles}>
          {children}
        </div>
      </SessionProvider>
    </>
  );
};

export default ClientWrapper;
