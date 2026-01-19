import styles from "./components/page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <pre style={{ fontFamily: 'monospace', fontSize: '0.5em', lineHeight: '1.1', margin: 0, textAlign: 'center', whiteSpace: 'pre' }}>
{`     ╔════════╗
    ╱           ╲
   ╱      •      ╲
  ╱       e       ╲
 ╱                 ╲
╱                   ╲
╲                   ╱
 ╲                 ╱
  ╲       e       ╱
   ╲      •      ╱
    ╲           ╱
     ╚════════╝`}
          </pre>
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
