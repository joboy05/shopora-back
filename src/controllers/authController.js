import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-shopora-20';

export const register = async (req, res) => {
  const { email, password, storeName, accountType, username } = req.body;

  try {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Store and Owner
    const store = await prisma.store.create({
      data: {
        name: accountType === 'COMPANY' ? (storeName || "Ma Boutique Shopora") : (username || email.split('@')[0]),
        email: email
      }
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username,
        accountType: accountType || 'INDIVIDUAL',
        role: accountType === 'COMPANY' ? 'SELLER' : 'USER', // Only seeded admin gets ADMIN role
        storeId: store.id
      }
    });

    // 4. Generate Token
    const token = jwt.sign(
      { userId: user.id, storeId: store.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ 
        where: { email },
        include: { store: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { userId: user.id, storeId: user.storeId, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
