import styles from "./components/page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>--- Day 2: Gift Shop ---</h1>
        <div className={styles.content}>
          <p className={styles.text}>
            Welcome to ERNI
          </p>
        </div>
      </main>
    </div>
  );
}
