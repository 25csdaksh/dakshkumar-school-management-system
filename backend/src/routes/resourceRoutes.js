import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getBooks,
  createBook,
  issueBook,
  returnBook,
  getHostels,
  createHostel,
  allocateBed,
  deallocateBed,
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getVehicles,
  createVehicle,
  deleteVehicle,
  assignVehicleToStudent
} from '../controllers/resourceController.js';

const router = express.Router();

// Library
router.get('/library', protect, getBooks);
router.post('/library', protect, authorize('admin'), createBook);
router.post('/library/issue', protect, authorize('admin'), issueBook);
router.post('/library/return', protect, authorize('admin'), returnBook);

// Hostel
router.get('/hostel', protect, getHostels);
router.post('/hostel', protect, authorize('admin'), createHostel);
router.put('/hostel/:hostelId/room/:roomId/allocate', protect, authorize('admin'), allocateBed);
router.put('/hostel/:hostelId/room/:roomId/deallocate', protect, authorize('admin'), deallocateBed);

// Inventory
router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, authorize('admin'), createInventoryItem);
router.put('/inventory/:id', protect, authorize('admin'), updateInventoryItem);
router.delete('/inventory/:id', protect, authorize('admin'), deleteInventoryItem);

// Transport
router.get('/transport', protect, getVehicles);
router.post('/transport', protect, authorize('admin'), createVehicle);
router.delete('/transport/:id', protect, authorize('admin'), deleteVehicle);
router.post('/transport/assign', protect, authorize('admin'), assignVehicleToStudent);

export default router;
