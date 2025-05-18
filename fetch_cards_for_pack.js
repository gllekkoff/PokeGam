const fs = require('fs');
const fetch = require('node-fetch');

const API_KEY = 'c210671d-a1cc-4a9e-b0cc-5e209c61f5e6';
const cardIds = [
  'ex13-2', 'ex12-1', 'dp1-1', 'pl3-2', 'swsh35-1',
  'dp3-2', 'ecard2-H1', 'gym1-2', 'hgss4-3', 'ex14-1'
];

const headers = {
  'X-Api-Key': API_KEY
};

const fetchCardData = async (id) => {
  const res = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`, { headers });
  const json = await res.json();
  const card = json.data;

  return {
    id: card.id,
    name: card.name,
    imageUrl: card.images?.small || '',
    rarity: card.rarity || 'Common',
    price: card.rarity === 'Rare' ? 100 : 50,
  };
};

(async () => {
  const cards = [];
  for (let id of cardIds) {
    try {
      const card = await fetchCardData(id);
      cards.push(card);
    } catch (err) {
      console.error(`❌ Failed to fetch ${id}`, err.message);
    }
  }

  const data = JSON.parse(fs.readFileSync('./user_info.json', 'utf-8'));

  data.packs = [
    {
      id: 1,
      name: 'Legacy Pack',
      price: 100,
      image: '/images/basic-pack.png',
      tag: 'Free',
      cards: cards.map((c) => c.id)
    }
  ];

  data.cards = cards.map((c) => ({
    ...c,
    forSale: true
  }));

  fs.writeFileSync('./user_info.json', JSON.stringify(data, null, 2));
  console.log(`✅ Updated user_info.json with ${cards.length} cards`);
})();
