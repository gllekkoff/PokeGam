import styles from '../packs/styles/packs.module.css'
import { Diamond } from 'lucide-react'

export default function PokemonPack({ pack }) {
  return (
    <div className={styles.pack}>
      <div className={styles.packImage}>
        <img src={pack.image} alt={pack.name} className={styles.packIcon} />
      </div>
      <div className={styles.packContent}>
        <h2 className={styles.packTitle}>{pack.name}</h2>
        <div className={styles.packFooter}>
          {pack.tag === 'Market' ? (
            <div className={styles.priceSection}>
              <Diamond className={styles.diamondIcon} />
              <span className={styles.packPrice}>{pack.price}</span>
            </div>
          ) : (
            <span className={styles.freeTag}>{pack.tag ?? 'Free'}</span>
          )}
          <button className={styles.openButton}>Open</button>
        </div>
      </div>
    </div>
  )
}
