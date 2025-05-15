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
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
};

const saveUserData = (data) => {
  const filePath = path.join(__dirname, 'user_info.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const users = getUserData().users || [];

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      email,
      username,
      password: hashedPassword,
      diamonds: 100
    };

    users.push(newUser);
    saveUserData({ users });

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

app.get('/api/user/profile', authenticateToken, (req, res) => {
  const users = getUserData().users || [];
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ 
    id: user.id,
    email: user.email,
    username: user.username,
    diamonds: user.diamonds
  });
});

app.get('/api/packs', authenticateToken, (req, res) => {
  res.json([
    { id: 1, name: 'Basic Pack', price: 100 },
    { id: 2, name: 'Premium Pack', price: 200 },
    { id: 3, name: 'Ultra Pack', price: 500 }
  ]);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
