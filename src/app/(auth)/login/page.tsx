"use client";
import { useEffect } from "react";
import { LoginPage } from "../../../../submodules/bifrost-next-helper";

export default function Page() {
  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.style.display = "none";
    }

    return () => {
      if (sidebar) sidebar.style.display = "";
    };
  }, []);

  return <LoginPage />;
}
