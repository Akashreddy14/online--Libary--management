import { Router } from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/mine', protect, async (req, res, next) => {
  try {
    res.json(await Loan.find({ user: req.user._id }).populate('book').sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.post('/:bookId/borrow', protect, async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies < 1) return res.status(400).json({ message: 'No copies currently available' });
    const alreadyBorrowed = await Loan.findOne({ user: req.user._id, book: book._id, status: 'borrowed' });
    if (alreadyBorrowed) return res.status(409).json({ message: 'You already borrowed this book' });
    book.availableCopies -= 1;
    await book.save();
    const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const loan = await Loan.create({ user: req.user._id, book: book._id, dueAt });
    res.status(201).json(await loan.populate('book'));
  } catch (error) { next(error); }
});

router.patch('/:id/return', protect, async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id, status: 'borrowed' }).populate('book');
    if (!loan) return res.status(404).json({ message: 'Active loan not found' });
    loan.status = 'returned';
    loan.returnedAt = new Date();
    await loan.save();
    await Book.findByIdAndUpdate(loan.book._id, { $inc: { availableCopies: 1 } });
    res.json({ message: 'Book returned successfully', loan });
  } catch (error) { next(error); }
});

export default router;
