import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { from, to, categoryId } = req.query;
  const where = { userId: req.user.id };

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  if (categoryId) where.categoryId = categoryId;

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' }
  });

  res.json(expenses);
});

router.post('/', async (req, res) => {
  const { amount, date, categoryId, note, description } = req.body;
  if (amount === undefined || !date || !categoryId) {
    return res.status(400).json({ message: 'amount, date, categoryId are required' });
  }

  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
  if (!category) return res.status(400).json({ message: 'Invalid category' });

  const expense = await prisma.expense.create({
    data: {
      amount,
      date: new Date(date),
      categoryId,
      note: note || null,
      description: description || null,
      userId: req.user.id
    },
    include: { category: true }
  });

  res.status(201).json(expense);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, date, categoryId, note, description } = req.body;

  const existing = await prisma.expense.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Expense not found' });

  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
    if (!category) return res.status(400).json({ message: 'Invalid category' });
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...(amount !== undefined ? { amount } : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(note !== undefined ? { note } : {}),
      ...(description !== undefined ? { description } : {})
    },
    include: { category: true }
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.expense.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Expense not found' });

  await prisma.expense.delete({ where: { id } });
  res.status(204).send();
});

export default router;
