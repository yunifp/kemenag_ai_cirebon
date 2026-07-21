import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-kemenag-123';

import { prisma } from '../lib/prisma';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { username: { equals: email, mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email/Username tidak terdaftar.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Akun Anda dinonaktifkan.' });
    }

    // NOTE: In production, use bcrypt.compare
    if (user.password !== password) {
      return res.status(401).json({ error: 'Password salah.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ message: 'Login berhasil', token, email: user.email || user.username });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
