import styles from '../styles/Stats.module.css';

export function Stats({ state }) {
  const money = state.coins || 0;
  const caughtFish = Object.values(state.inv || {}).reduce((a, b) => a + b, 0);
  const currentRod = state.rod || 'None';

  return (
    <div className={styles.stats}>
      <h2>Game Stats</h2>
      <div className={styles.stat}>
        <span>Money:</span>
        <strong>${money}</strong>
      </div>
      <div className={styles.stat}>
        <span>Fish Caught:</span>
        <strong>{caughtFish}</strong>
      </div>
      <div className={styles.stat}>
        <span>Current Rod:</span>
        <strong>{currentRod}</strong>
      </div>
    </div>
  );
}

export default Stats;
