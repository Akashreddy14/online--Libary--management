import { Router } from 'express';
import Book from '../models/Book.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search = '', category = '' } = req.query;
    const filter = {};
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { author: { $regex: search, $options: 'i' } }];
    if (category) filter.category = category;
    res.json(await Book.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) { next(error); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { title, author, totalCopies = 1 } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'Title and author are required' });
    res.status(201).json(await Book.create({ ...req.body, totalCopies, availableCopies: totalCopies }));
  } catch (error) { next(error); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) { next(error); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (error) { next(error); }
});

export default router;
