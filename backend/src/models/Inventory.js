import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g. 'Lab Glass Beakers'
  },
  stockQty: {
    type: Number,
    required: true,
    default: 0
  },
  thresholdQty: {
    type: Number,
    required: true,
    default: 5
  },
  category: {
    type: String,
    required: true,
    trim: true // e.g. 'Stationery', 'Science Lab', 'Sports Assets'
  }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
