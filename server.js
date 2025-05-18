const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

const getUserData = () => {
  const filePath = path.join(__dirname, 'user_info.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
};

const saveUserData = (data) => {
  const filePath = path.join(__dirname, 'user_info.json');
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
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, {
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

// Buy Pack (3 cards, duplicates reward)
app.post('/api/user/buy-pack', authenticateToken, (req, res) => {
  const { packId } = req.body;
  const data = getUserData();
  const users = data.users || [];
  const cards = data.cards || [];

  const user = users.find(u => u.id === req.user.id);
  const pack = data.packs.find(p => p.id === packId);
  if (!user || !pack) return res.status(404).json({ message: 'Not found' });
  if (!cards.length) return res.status(404).json({ message: 'No cards available' });

  if (pack.tag === 'Market' && user.diamonds < pack.price) {
    return res.status(400).json({ message: 'Not enough diamonds' });
  }

  if (pack.tag === 'Market') {
    user.diamonds -= pack.price;
  }

  user.cards = user.cards || [];
  const drawnCards = [];

  for (let i = 0; i < 3; i++) {
    const card = cards[Math.floor(Math.random() * cards.length)];
    if (!card || !card.name) continue;

    drawnCards.push(card);
  }

  const newCards = [];
  const duplicates = [];

  for (const card of drawnCards) {
    const isDuplicate = user.cards.some(c => c.name.toLowerCase() === card.name.toLowerCase());

    if (isDuplicate) {
      user.diamonds += 10;
      duplicates.push(card);
    } else {
      const instance = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: card.name,
        imageUrl: card.imageUrl
      };
      user.cards.push(instance);
      newCards.push(instance);
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
      packs_opened: user.packs_opened
    }
  });
});


// Buy Single Card
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
      cards: user.cards
    }
  });
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
    packs_opened: user.packs_opened,
    rare_cards: user.rare_cards,
    collection_value: user.collection_value
  });
});

app.get('/api/cards', authenticateToken, (req, res) => {
  const data = getUserData();
  res.json(data.cards || []);
});

app.get('/api/packs', authenticateToken, (req, res) => {
  const data = getUserData();
  res.json(data.packs || []);
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
  console.error('💥 Uncaught error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
