import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Actually let's just use raw password for MVP since this is a quick demo

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json({ data: users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, username, nik, position } = req.body;
    
    // Check if user exists
    const existing = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { email },
          { username: username || email?.split('@')[0] || 'user' }
        ]
      } 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email atau Username sudah terdaftar' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username: username || email?.split('@')[0] || 'user' + Date.now(),
        nik,
        position,
        password: password || 'default123' // Raw password for MVP demo purposes
      }
    });

    return res.status(201).json({ message: 'User berhasil dibuat', data: newUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal membuat user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    return res.status(200).json({ data: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

