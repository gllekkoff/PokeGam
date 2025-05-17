import styles from '../packs/styles/packs.module.css';

export default function PokemonPack({ pack }) {
  return (
    <div className={styles.pack}>
      <div className={styles.packImage}>
        <img src={pack.image} alt={pack.name} className={styles.packIcon} />
      </div>
      <div className={styles.packContent}>
        <h2 className={styles.packTitle}>{pack.name}</h2>
        <div className={styles.packFooter}>
          <span className={styles.freeTag}>{pack.tag ?? 'Free'}</span>
          <button className={styles.openButton}>Open</button>
        </div>
      </div>
    </div>
  );
}
