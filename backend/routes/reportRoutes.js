import { Router } from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.get('/summary', protect, adminOnly, async (_req, res, next) => {
  try {
    const [books, users, activeLoans, overdueLoans] = await Promise.all([
      Book.countDocuments(), User.countDocuments(),
      Loan.countDocuments({ status: 'borrowed' }),
      Loan.countDocuments({ status: 'borrowed', dueAt: { $lt: new Date() } })
    ]);
    res.json({ books, users, activeLoans, overdueLoans });
  } catch (error) { next(error); }
});
export default router;
