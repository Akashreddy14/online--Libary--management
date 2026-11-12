import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
