import styles from '../styles/Inventory.module.css';
import { FISH } from '../engine/FishingGameEngine.js';

export function Inventory({ state }) {
  const inv = state.inv || {};
  const caughtFishList = Object.entries(inv).map(([fishId, count]) => {
    const fishData = FISH.find(f => f.id === fishId);
    return {
      id: fishId,
      name: fishData?.name || 'Unknown',
      weight: fishData?.w || 0,
      count: count
    };
  });

  const totalFish = Object.values(inv).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.inventory}>
      <h2>Inventory ({totalFish})</h2>
      <div className={styles.fishList}>
        {caughtFishList.length === 0 ? (
          <p>No fish caught yet</p>
        ) : (
          caughtFishList.map((f) => (
            <div key={f.id} className={styles.fishItem}>
              <div>
                <strong>{f.name}</strong>
                <span>x{f.count}</span>
              </div>
              <span>{f.weight.toFixed(1)}kg</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
