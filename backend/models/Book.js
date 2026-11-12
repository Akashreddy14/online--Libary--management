import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  isbn: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  totalCopies: { type: Number, default: 1, min: 0 },
  availableCopies: { type: Number, default: 1, min: 0 }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
