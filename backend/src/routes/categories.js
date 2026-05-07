import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    orderBy: { name: 'asc' }
  });
  res.json(categories);
});

router.post('/', async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });

  const category = await prisma.category.create({
    data: { name, color: color || null, userId: req.user.id }
  });
  res.status(201).json(category);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  const existing = await prisma.category.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(color !== undefined ? { color } : {})
    }
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.category.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});

export default router;
