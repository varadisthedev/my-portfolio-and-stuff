import styles from "./Loader.module.css";

export function Loader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <div className={styles.box1} />
      <div className={styles.box2} />
      <div className={styles.box3} />
    </div>
  );
}
