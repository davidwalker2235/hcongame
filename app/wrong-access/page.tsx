import styles from "../components/page.module.css";

export default function WrongAccess() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.text} style={{ color: '#ff4444', textAlign: 'center', fontSize: '18px' }}>
            Wrong access. ID needed
          </p>
        </div>
      </main>
    </div>
  );
}
