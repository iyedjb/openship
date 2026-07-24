
"use client";
import { useEffect } from "react";

export default function LoginRedirect() {
  useEffect(() => {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:6661";
    window.location.href = `${dashboardUrl}/login`;
  }, []);
  return null;
}
