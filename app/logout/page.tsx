import styles from "../components/page.module.css";

export default function Logout() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.text}>
            soy el contenido de la tab Log out
          </p>
        </div>
      </main>
    </div>
  );
}
