import styles from '../styles/Shop.module.css';
import { RODS, LURES, NETS } from '../engine/FishingGameEngine.js';

export function Shop({ engine, state }) {
  const money = state.coins || 0;
  const owned = state.owned || [];

  const handleBuyRod = (rodId) => {
    engine.buyRod(rodId);
  };

  const handleBuyLure = (lureId) => {
    engine.buyLure(lureId);
  };

  const handleBuyNet = (netId) => {
    engine.buyNet(netId);
  };

  return (
    <div className={styles.shop}>
      <h2>Shop</h2>

      <div className={styles.category}>
        <h3>Rods</h3>
        {RODS.map(rod => (
          <div key={rod.id} className={styles.item}>
            <div>
              <strong>{rod.name}</strong>
              <span>${rod.cost}</span>
            </div>
            <button
              onClick={() => handleBuyRod(rod.id)}
              disabled={money < rod.cost || owned.includes(rod.id)}
              title={owned.includes(rod.id) ? 'Already owned' : ''}
            >
              {owned.includes(rod.id) ? 'Owned' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.category}>
        <h3>Lures</h3>
        {LURES.map(lure => (
          <div key={lure.id} className={styles.item}>
            <div>
              <strong>{lure.name}</strong>
              <span>${lure.cost}</span>
            </div>
            <button
              onClick={() => handleBuyLure(lure.id)}
              disabled={money < lure.cost || owned.includes(lure.id)}
              title={owned.includes(lure.id) ? 'Already owned' : ''}
            >
              {owned.includes(lure.id) ? 'Owned' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.category}>
        <h3>Nets</h3>
        {NETS.map(net => (
          <div key={net.id} className={styles.item}>
            <div>
              <strong>{net.name}</strong>
              <span>${net.cost}</span>
            </div>
            <button
              onClick={() => handleBuyNet(net.id)}
              disabled={money < net.cost || owned.includes(net.id)}
              title={owned.includes(net.id) ? 'Already owned' : ''}
            >
              {owned.includes(net.id) ? 'Owned' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
