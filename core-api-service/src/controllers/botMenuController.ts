import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getMenus = async (req: Request, res: Response) => {
  try {
    const menus = await prisma.botMenu.findMany({
      orderBy: { keyword: 'asc' },
    });
    res.json({ data: menus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
};

export const createMenu = async (req: Request, res: Response) => {
  const { keyword, title, response, isActive } = req.body;
  try {
    // Validate unique keyword
    const existing = await prisma.botMenu.findUnique({
      where: { keyword: keyword.toLowerCase() },
    });
    if (existing) {
      return res.status(400).json({ error: 'Keyword sudah digunakan' });
    }

    const menu = await prisma.botMenu.create({
      data: {
        keyword: keyword.toLowerCase(),
        title,
        response,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json({ data: menu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu' });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { keyword, title, response, isActive } = req.body;
  try {
    // Check if keyword changed and already exists
    if (keyword) {
      const existing = await prisma.botMenu.findFirst({
        where: { 
          keyword: keyword.toLowerCase(),
          NOT: { id }
        },
      });
      if (existing) {
        return res.status(400).json({ error: 'Keyword sudah digunakan' });
      }
    }

    const dataToUpdate: any = {};
    if (keyword !== undefined) dataToUpdate.keyword = keyword.toLowerCase();
    if (title !== undefined) dataToUpdate.title = title;
    if (response !== undefined) dataToUpdate.response = response;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;

    const menu = await prisma.botMenu.update({
      where: { id },
      data: dataToUpdate,
    });
    res.json({ data: menu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.botMenu.delete({
      where: { id },
    });
    res.json({ message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu' });
  }
};
