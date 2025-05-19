const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const RARITIES = {
  "ACE SPEC Rare":             { min: 700,  max: 900,  weight: 5 },
  "Amazing Rare":              { min: 900,  max: 1100, weight: 5 },
  "Classic Collection":        { min: 100,  max: 200,  weight: 15 },
  "Common":                    { min: 50,   max: 150,  weight: 35 },
  "Double Rare":               { min: 510,  max: 700,  weight: 8 },
  "Hyper Rare":               { min: 1200, max: 1400, weight: 3 },
  "Illustration Rare":        { min: 1300, max: 1500, weight: 3 },
  "LEGEND":                    { min: 2000, max: 3000, weight: 1 },
  "Promo":                     { min: 200,  max: 600,  weight: 10 },
  "Radiant Rare":             { min: 1400, max: 1600, weight: 3 },
  "Rare":                     { min: 310,  max: 500,  weight: 15 },
  "Rare ACE":                 { min: 600,  max: 800,  weight: 8 },
  "Rare BREAK":               { min: 910,  max: 1200, weight: 5 },
  "Rare Holo":                { min: 510,  max: 800,  weight: 10 },
  "Rare Holo EX":             { min: 810,  max: 1200, weight: 5 },
  "Rare Holo GX":             { min: 900,  max: 1300, weight: 5 },
  "Rare Holo LV.X":           { min: 1000, max: 1500, weight: 4 },
  "Rare Holo Star":           { min: 1000, max: 1500, weight: 4 },
  "Rare Holo V":              { min: 1010, max: 1600, weight: 4 },
  "Rare Holo VMAX":           { min: 1510, max: 2500, weight: 2 },
  "Rare Holo VSTAR":          { min: 1510, max: 2500, weight: 2 },
  "Rare Prime":               { min: 700,  max: 1000, weight: 6 },
  "Rare Prism Star":          { min: 810,  max: 1300, weight: 5 },
  "Rare Rainbow":             { min: 1800, max: 2300, weight: 2 },
  "Rare Secret":              { min: 1800, max: 2500, weight: 2 },
  "Rare Shining":             { min: 800,  max: 1200, weight: 6 },
  "Rare Shiny":               { min: 800,  max: 1200, weight: 6 },
  "Rare Shiny GX":            { min: 1000, max: 1600, weight: 4 },
  "Rare Ultra":               { min: 1200, max: 1800, weight: 3 },
  "Shiny Rare":               { min: 1200, max: 1800, weight: 3 },
  "Shiny Ultra Rare":         { min: 1800, max: 2400, weight: 2 },
  "Special Illustration Rare": { min: 2000, max: 3000, weight: 1 },
  "Trainer Gallery Rare Holo": { min: 1000, max: 1500, weight: 4 },
  "Ultra Rare":               { min: 1200, max: 1800, weight: 3 },
  "Uncommon":                 { min: 160,  max: 300,  weight: 25 }
};

app.use(cors());
app.use(express.json());

const getUserData = () => {
  const filePath = path.join(__dirname, 'new_db.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};

const saveUserData = (data) => {
  const filePath = path.join(__dirname, 'new_db.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const data = getUserData();
    const users = data.users || [];

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email,
      username,
      password: hashedPassword,
      diamonds: 100,
      cards: [],
      starredCards: [],
      packs_opened: 0,
      rare_cards: 0,
      collection_value: 0
    };

    users.push(newUser);
    saveUserData({ ...data, users });

    const token = jwt.sign({ id: newUser.id, email }, JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    res.status(201).json({
      user: { ...newUser, password: undefined },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUserData().users || [];
    const user = users.find(u => 
      u.email === email || 
      u.username.toLowerCase() === email.toLowerCase()
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    res.json({
      user: { ...user, password: undefined },
      token
    });
  } catch {
    res.status(500).json({ message: 'Error logging in' });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isRareCard = (rarity) => {
  return RARITIES[rarity].min > RARITIES["Rare"].max;
};

const getRandomCard = (cards) => {
  const totalWeight = Object.values(RARITIES).reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  let selectedRarity;
  for (const [rarity, data] of Object.entries(RARITIES)) {
    random -= data.weight;
    if (random <= 0) {
      selectedRarity = rarity;
      break;
    }
  }
  
  const cardsOfRarity = cards.filter(card => card.rarity === selectedRarity);
  if (cardsOfRarity.length === 0) {
    return cards[Math.floor(Math.random() * cards.length)];
  }
  return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
};

app.post('/api/user/buy-pack', authenticateToken, (req, res) => {
  const { packId } = req.body;
  const data = getUserData();
  const users = data.users || [];

  const user = users.find(u => u.id === req.user.id);
  const pack = data.packs.find(p => p.id === packId);
  
  if (!user || !pack) return res.status(404).json({ message: 'Not found' });
  if (!pack.cards?.length) return res.status(404).json({ message: 'Pack has no cards' });

  if (pack.tag === 'Market' && user.diamonds < pack.price) {
    return res.status(400).json({ message: 'Not enough diamonds' });
  }

  if (pack.tag === 'Market') {
    user.diamonds -= pack.price;
  }

  const newCards = [];
  const duplicates = [];

  const card = getRandomCard(pack.cards);
  
  const isDuplicate = user.cards.some(c => c.name.toLowerCase() === card.name.toLowerCase());
  
  if (isDuplicate) {
    const reward = Math.floor(RARITIES[card.rarity].max * 0.1);
    user.diamonds += reward;
    duplicates.push({ ...card, reward });
  } else {
    const instance = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      name: card.name,
      imageUrl: card.imageUrl,
      rarity: card.rarity
    };
    user.cards.push(instance);
    newCards.push(instance);

    if (isRareCard(card.rarity)) {
      user.rare_cards = (user.rare_cards || 0) + 1;
    }
  }

  user.packs_opened = (user.packs_opened || 0) + 1;

  saveUserData({ ...data, users });

  res.json({
    success: true,
    newCards,
    duplicates,
    updatedUser: {
      id: user.id,
      email: user.email,
      username: user.username,
      diamonds: user.diamonds,
      cards: user.cards,
      starredCards: user.starredCards || [],
      packs_opened: user.packs_opened,
      rare_cards: user.rare_cards,
      collection_value: user.collection_value
    }
  });
});


app.post('/api/user/buy-card', authenticateToken, (req, res) => {
  const { cardId } = req.body;
  const data = getUserData();
  const users = data.users || [];
  const cards = data.cards || [];
  const user = users.find(u => u.id === req.user.id);
  const card = cards.find(c => c.id === cardId);

  if (!user || !card) {
    return res.status(404).json({ message: 'Not found' });
  }

  if (user.diamonds < card.price) {
    return res.status(400).json({ message: 'Not enough diamonds' });
  }

  user.diamonds -= card.price;
  user.cards = user.cards || [];
  user.cards.push({
    id: Date.now(),
    name: card.name,
    imageUrl: card.imageUrl
  });

  saveUserData({ ...data, users });

  res.json({
    success: true,
    card,
    updatedUser: {
      id: user.id,
      email: user.email,
      username: user.username,
      diamonds: user.diamonds,
      cards: user.cards,
      starredCards: user.starredCards || []
    }
  });
});

app.post('/api/user/starred-cards', authenticateToken, (req, res) => {
  try {
    const { starredCards } = req.body;
    const data = getUserData();
    const user = data.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.starredCards = starredCards;
    saveUserData(data);

    res.json({ message: 'Starred cards updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating starred cards' });
  }
});

app.get('/api/user/profile', authenticateToken, (req, res) => {
  const users = getUserData().users || [];
  const user = users.find(u => u.id === req.user.id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    diamonds: user.diamonds,
    cards: user.cards || [],
    starredCards: user.starredCards || [],
    packs_opened: user.packs_opened,
    rare_cards: user.rare_cards,
    collection_value: user.collection_value
  });
});

app.post('/api/user/update-collection-value', authenticateToken, (req, res) => {
  const { collectionValue } = req.body;
  const data = getUserData();
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.collection_value = collectionValue;
  saveUserData(data);

  res.json({ success: true, updatedUser: user });
});

app.get('/api/cards', authenticateToken, (req, res) => {
  const data = getUserData();
  res.json(data.cards || []);
});

app.get('/api/packs', authenticateToken, (req, res) => {
  const data = getUserData();

  const packsWithChances = data.packs.map(pack => {
    const totalWeight = pack.cards.reduce((sum, card) => {
      const rarityData = RARITIES[card.rarity] || { weight: 1 };
      return sum + rarityData.weight;
    }, 0);

    const cardsWithChance = pack.cards.map(card => {
      const rarityData = RARITIES[card.rarity] || { weight: 1 };
      const chance = ((rarityData.weight / totalWeight) * 100).toFixed(1);
      return {
        ...card,
        chance: parseFloat(chance)
      };
    });

    return {
      ...pack,
      cards: cardsWithChance
    };
  });

  res.json(packsWithChances);
});

app.get('/api/market', (req, res) => {
  try {
    const data = getUserData();
    res.json({
      packs: data.packs.filter(pack => pack.tag === 'Market'),
      cards: data.cards.filter(card => card.forSale)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching market' });
  }
});

app.use((err, req, res, next) => {
  console.error('Uncaught error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

