"use client";

import { useState } from "react";
import NavLink from "./NavLink";
import styles from "./navigation.module.css";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <div className={styles.leftSection}>
          <div className={styles.title}>ERNI Challenge</div>
        </div>
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className={`${styles.rightSection} ${isMenuOpen ? styles.mobileOpen : ''}`}>
          <NavLink href="/about" label="About" onClick={() => setIsMenuOpen(false)} />
          <NavLink href="/levels" label="Levels" onClick={() => setIsMenuOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
