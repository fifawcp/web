"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/button";

import { logoutAndSignOut } from "../lib/logout";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutAndSignOut("/");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
