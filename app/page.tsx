import styles from "./components/page.module.css";
import { Logo } from "./components/Logo";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <Logo />
        </h1>
        <div className={styles.content}>
          <p className={styles.text}>
            Welcome to ERNI
          </p>
        </div>
      </main>
    </div>
  );
}
