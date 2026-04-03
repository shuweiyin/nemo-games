import styles from '../styles/Inventory.module.css';
import { FISH } from '../engine/FishingGameEngine.js';

export function Inventory({ state, engine }) {
  const inv = state.inv || {};
  const caughtFishList = Object.entries(inv).map(([fishId, count]) => {
    const fishData = FISH.find(f => f.id === fishId);
    return {
      id: fishId,
      name: fishData?.name || 'Unknown',
      weight: fishData?.w || 0,
      value: fishData?.v || 0,
      count: count,
    };
  });

  const totalFish = Object.values(inv).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.inventory}>
      <h2>Inventory ({totalFish})</h2>
      <div className={styles.fishList}>
        {caughtFishList.length === 0 ? (
          <p className={styles.emptyText}>No fish caught yet</p>
        ) : (
          caughtFishList.map((f) => (
            <div key={f.id} className={styles.fishItem}>
              <div className={styles.fishInfo}>
                <strong>{f.name}</strong>
                <span>x{f.count} · {f.weight.toFixed(1)}kg</span>
              </div>
              <div className={styles.fishActions}>
                <span className={styles.fishValue}>${f.value}</span>
                <button
                  className={styles.sellBtn}
                  onClick={() => engine.sellFish(f.id)}
                >
                  Sell
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
