'use client';

import styles from './styles/FilterSection.module.css';

export default function FilterSection({ filters, onFilterChange, rarityOptions }) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControls}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Rarity</label>
          <select 
            className={styles.filterSelect}
            value={filters.rarity}
            onChange={(e) => onFilterChange('rarity', e.target.value)}
          >
            {rarityOptions.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'All Rarities' : rarity}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Price Range</label>
          <div className={styles.priceRange}>
            <input
              type="number"
              placeholder="Min Price"
              className={styles.priceInput}
              value={filters.minPrice}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
            />
            <input
              type="number"
              placeholder="Max Price"
              className={styles.priceInput}
              value={filters.maxPrice}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sort By</label>
          <select
            className={styles.filterSelect}
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="name-asc">Name (A to Z)</option>
            <option value="name-desc">Name (Z to A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}