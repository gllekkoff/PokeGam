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

// ✅ FIXED: register route — preserves entire JSON structure
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const data = getUserData(); // full structure: { users, packs }
    const users = data.users || [];

    if (users.find((u) => u.email === email)) {
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

    saveUserData({ ...data, users }); // ✅ preserve existing packs

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.status(201).json({
      user: { ...newUser, password: undefined },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUserData().users || [];
    const user = users.find((u) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h', algorithm: 'HS256' }
    );

    res.json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/user/open-pack', authenticateToken, (req, res) => {
  const data = getUserData();
  const users = data.users || [];
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const card = {
    id: Date.now(),
    name: 'Rowlet',
    imageUrl: 'https://images.pokemontcg.io/sm9/1.png'
  };

  user.cards = user.cards || [];
  user.cards.push(card);
  user.packs_opened = (user.packs_opened || 0) + 1; // ✅ increment here

  saveUserData({ ...data, users });

  res.json({
    success: true,
    card,
    updatedUser: {
      id: user.id,
      email: user.email,
      username: user.username,
      diamonds: user.diamonds,
      packs_opened: user.packs_opened
    }
  });
});


app.post('/api/user/buy-pack', authenticateToken, (req, res) => {
  const { packId } = req.body;
  const data = getUserData();
  const users = data.users || [];
  const user = users.find(u => u.id === req.user.id);
  const pack = data.packs.find(p => p.id === packId);

  if (!user || !pack) return res.status(404).json({ message: 'Not found' });
  if (user.diamonds < pack.price) {
    return res.status(400).json({ message: 'Not enough diamonds' });
  }

  user.diamonds -= pack.price;
  user.packs_opened = (user.packs_opened || 0) + 1; // ✅ increment here

  const card = {
    id: Date.now(),
    name: 'Rowlet',
    imageUrl: 'https://images.pokemontcg.io/sm9/1.png'
  };

  user.cards = user.cards || [];
  user.cards.push(card);

  saveUserData({ ...data, users });

  res.json({
    success: true,
    card,
    updatedUser: {
      id: user.id,
      email: user.email,
      username: user.username,
      diamonds: user.diamonds,
      packs_opened: user.packs_opened
    }
  });
});

app.get('/api/cards', authenticateToken, (req, res) => {
  const data = getUserData();
  const cards = data.cards || [];
  res.json(cards);
});

app.post('/api/user/buy-card', authenticateToken, (req, res) => {
  const { cardId } = req.body;
  const data = getUserData();
  const users = data.users || [];
  const user = users.find(u => u.id === req.user.id);
  const card = data.cards.find(c => c.id === cardId);

  if (!user || !card) {
    return res.status(404).json({ message: 'Not found' });
  }

  if (user.diamonds < card.price) {
    return res.status(400).json({ message: 'Not enough diamonds' });
  }

  user.diamonds -= card.price;
  user.cards = user.cards || [];

  user.cards.push({
    id: Date.now(), // allow duplicates by timestamp ID
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
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

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

app.get('/api/packs', authenticateToken, (req, res) => {
  const data = getUserData();
  const packs = data.packs || [];
  res.json(packs);
});

app.use((err, req, res, next) => {
  console.error('💥 Uncaught error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
