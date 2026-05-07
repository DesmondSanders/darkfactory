import { Router } from 'express';
import { prisma } from '../services/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { year, month } = req.query;
  const where = { userId: req.user.id };
  if (year) where.year = Number(year);
  if (month) where.month = Number(month);

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  res.json(budgets);
});

router.post('/', async (req, res) => {
  const { amount, year, month, categoryId } = req.body;
  if (amount === undefined || !year || !month) {
    return res.status(400).json({ message: 'amount, year, month are required' });
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
    if (!category) return res.status(400).json({ message: 'Invalid category' });
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_year_month_categoryId: {
        userId: req.user.id,
        year: Number(year),
        month: Number(month),
        categoryId: categoryId ?? null
      }
    },
    update: { amount },
    create: {
      amount,
      year: Number(year),
      month: Number(month),
      categoryId: categoryId ?? null,
      userId: req.user.id
    },
    include: { category: true }
  });

  res.status(201).json(budget);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, year, month, categoryId } = req.body;

  const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Budget not found' });

  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
    if (!category) return res.status(400).json({ message: 'Invalid category' });
  }

  const updated = await prisma.budget.update({
    where: { id },
    data: {
      ...(amount !== undefined ? { amount } : {}),
      ...(year !== undefined ? { year: Number(year) } : {}),
      ...(month !== undefined ? { month: Number(month) } : {}),
      ...(categoryId !== undefined ? { categoryId } : {})
    },
    include: { category: true }
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ message: 'Budget not found' });

  await prisma.budget.delete({ where: { id } });
  res.status(204).send();
});

export default router;
