"use client";

import { useState } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import styles from "./navigation.module.css";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.leftSection}>
          <Link href="/levels" className={styles.title} style={{ textDecoration: 'none', cursor: 'pointer' }}>
            The ERNI-bots Castle
          </Link>
        </div>
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Abrir o cerrar menú"
        >
          ☰
        </button>
        <div className={`${styles.rightSection} ${isMenuOpen ? styles.mobileOpen : ''}`}>
          <NavLink href="/levels" label="Niveles" onClick={() => setIsMenuOpen(false)} />
          <NavLink href="/ranking" label="Clasificación" onClick={() => setIsMenuOpen(false)} />
          <NavLink href="/about" label="Acerca de" onClick={() => setIsMenuOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
