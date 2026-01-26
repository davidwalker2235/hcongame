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
            ERNI Challenge
          </Link>
        </div>
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className={`${styles.rightSection} ${isMenuOpen ? styles.mobileOpen : ''}`}>
          <NavLink href="/levels" label="Levels" onClick={() => setIsMenuOpen(false)} />
          <NavLink href="/ranking" label="Ranking" onClick={() => setIsMenuOpen(false)} />
          <NavLink href="/about" label="About" onClick={() => setIsMenuOpen(false)} />
        </div>
      </div>
    </nav>
  );
}
