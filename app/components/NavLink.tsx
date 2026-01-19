"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ 
  href, 
  label, 
  onClick 
}: { 
  href: string; 
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      onClick={onClick}
      style={{
        color: isActive ? "#00ff00" : "#00cc00",
        textDecoration: "none",
        transition: "color 0.2s ease",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        padding: "4px 0",
        minHeight: "32px",
      }}
    >
      [{label}]
    </Link>
  );
}
