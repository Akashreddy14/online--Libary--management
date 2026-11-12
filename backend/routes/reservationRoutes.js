import { Router } from 'express';
import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Reservation.find({ user: req.user._id }).populate('book').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});

router.post('/:bookId', protect, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const existing = await Reservation.findOne({ user: req.user._id, book: book._id, status: 'pending' });
    if (existing) return res.status(409).json({ message: 'This book is already reserved by you' });
    res.status(201).json(await Reservation.create({ user: req.user._id, book: book._id }));
  } catch (error) { next(error); }
});

router.patch('/:id/cancel', protect, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'pending' },
      { status: 'cancelled' }, { new: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Pending reservation not found' });
    res.json(reservation);
  } catch (error) { next(error); }
});

export default router;
