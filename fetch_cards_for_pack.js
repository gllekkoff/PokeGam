const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = 'c210671d-a1cc-4a9e-b0cc-5e209c61f5e6';
const OUTPUT_FILE = 'user_info.json';

const globalCardIDs = [
  'sm1-1', 'sm1-2', 'sm1-3', 'sm1-4', 'sm1-5',
  'sm1-6', 'sm1-7', 'sm1-8', 'sm1-9', 'sm1-10',
  'base4-1', 'base4-2', 'base4-3', 'base4-4', 'base4-5',
  'base4-6', 'base4-7', 'base4-8', 'base4-9', 'base4-10',
  'xy1-1', 'xy1-2', 'xy1-3', 'xy1-4'
];

const packsDefinition = [
  { name: 'Basic Pack', tag: 'Free', price: 0, image: '/images/basic-pack.png', cardIndices: [0, 1, 2] },
  { name: 'Jungle Pack', tag: 'Free', price: 0, image: '/images/basic-pack.png', cardIndices: [3, 4, 5] },
  { name: 'Starter Blaze', tag: 'Free', price: 0, image: '/images/basic-pack.png', cardIndices: [6, 7, 8] },
  { name: 'Forest Force', tag: 'Free', price: 0, image: '/images/basic-pack.png', cardIndices: [9, 10, 11] },
  { name: 'Elemental Storm', tag: 'Market', price: 400, image: '/images/premium-pack.png', cardIndices: [12, 13, 14] },
  { name: 'Crystal Pack', tag: 'Market', price: 600, image: '/images/premium-pack.png', cardIndices: [15, 16, 17] },
  { name: 'Sky Clash', tag: 'Market', price: 800, image: '/images/premium-pack.png', cardIndices: [18, 19, 20] },
  { name: 'Ancient Legends', tag: 'Market', price: 1200, image: '/images/premium-pack.png', cardIndices: [21, 22, 23] }
];

async function fetchCard(cardId) {
  const url = `https://api.pokemontcg.io/v2/cards/${cardId}`;
  const res = await fetch(url, {
    headers: { 'X-Api-Key': API_KEY }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${cardId}: ${res.statusText}`);
  const data = await res.json();
  const card = data.data;

  return {
    id: card.id,
    name: card.name,
    imageUrl: card.images.small,
    rarity: card.rarity || 'Common',
    price: Math.floor(Math.random() * 400 + 100) // price between 100–500
  };
}

(async () => {
  try {
    const fetchedCards = await Promise.all(globalCardIDs.map(fetchCard));

    const packs = packsDefinition.map((packDef, idx) => {
      return {
        id: idx + 1,
        name: packDef.name,
        price: packDef.price,
        tag: packDef.tag,
        image: packDef.image,
        cards: packDef.cardIndices.map(i => fetchedCards[i])
      };
    });

    const userInfo = {
      users: [],
      cards: fetchedCards,
      packs
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(userInfo, null, 2));
    console.log(`✅ Generated ${OUTPUT_FILE} with ${packs.length} packs and ${fetchedCards.length} global cards.`);
  } catch (err) {
    console.error('❌ Failed to fetch cards or write file:', err);
  }
})();
