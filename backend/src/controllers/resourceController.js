import Book from '../models/Book.js';
import Hostel from '../models/Hostel.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Vehicle from '../models/Vehicle.js';
import BookTransaction from '../models/BookTransaction.js';

// ==========================================
// 1. LIBRARY HANDLERS (WITH TRANSACTION LOGGING & LATE FINES)
// ==========================================

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({}).populate('issues.student', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  const { title, author, isbn, availableCopies } = req.body;
  try {
    const bookExists = await Book.findOne({ isbn });
    if (bookExists) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }
    const book = new Book({ title, author, isbn, availableCopies });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const issueBook = async (req, res) => {
  const { bookId, studentEmail, dueDate } = req.body;
  try {
    const studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const studentDoc = await Student.findOne({ user: studentUser._id });
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'No available copies for checkout' });
    }

    // Check if student already has this book issued
    const alreadyIssued = book.issues.some(issue => issue.student.toString() === studentUser._id.toString());
    if (alreadyIssued) {
      return res.status(400).json({ message: 'This student already has a copy of this book issued' });
    }

    book.issues.push({
      student: studentUser._id,
      dueDate: new Date(dueDate)
    });
    book.availableCopies -= 1;
    await book.save();

    // Log the transaction
    const transaction = new BookTransaction({
      book: bookId,
      student: studentDoc._id,
      dueDate: new Date(dueDate)
    });
    await transaction.save();

    const updatedBook = await Book.findById(bookId).populate('issues.student', 'name email');
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const returnBook = async (req, res) => {
  const { bookId, studentId } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const initialIssueCount = book.issues.length;
    book.issues = book.issues.filter(issue => issue.student.toString() !== studentId);
    
    if (book.issues.length === initialIssueCount) {
      return res.status(404).json({ message: 'No active issue record found for this student' });
    }

    book.availableCopies += 1;
    await book.save();

    // Check for transaction & calculate fines
    const studentDoc = await Student.findOne({ user: studentId });
    let fine = 0;
    if (studentDoc) {
      const transaction = await BookTransaction.findOne({
        book: bookId,
        student: studentDoc._id,
        status: 'Issued'
      });

      if (transaction) {
        transaction.returnDate = new Date();
        transaction.status = 'Returned';
        
        // Calculate late fine (e.g. Rs 5 per day late)
        if (new Date() > new Date(transaction.dueDate)) {
          const diffTime = Math.abs(new Date() - new Date(transaction.dueDate));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          fine = diffDays * 5;
          transaction.finePaid = fine;
        }
        await transaction.save();
      }
    }

    const updatedBook = await Book.findById(bookId).populate('issues.student', 'name email');
    res.json({ updatedBook, fine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. HOSTEL HANDLERS
// ==========================================

export const getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({}).populate('rooms.occupiedBy', 'name email');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHostel = async (req, res) => {
  const { name, type, rooms } = req.body;
  try {
    const hostelExists = await Hostel.findOne({ name });
    if (hostelExists) {
      return res.status(400).json({ message: 'Hostel block already exists' });
    }

    const formattedRooms = (rooms || []).map(r => ({
      roomNo: r.roomNo,
      bedCount: Number(r.bedCount || 4),
      occupiedBy: []
    }));

    const hostel = new Hostel({
      name,
      type,
      rooms: formattedRooms
    });

    await hostel.save();
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allocateBed = async (req, res) => {
  const { hostelId, roomId } = req.params;
  const { studentEmail } = req.body;

  try {
    const studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
      return res.status(404).json({ message: 'Student user not found' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel block not found' });
    }

    const room = hostel.rooms.id(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found in this block' });
    }

    if (room.occupiedBy.length >= room.bedCount) {
      return res.status(400).json({ message: 'Room occupancy is full' });
    }

    if (room.occupiedBy.some(id => id.toString() === studentUser._id.toString())) {
      return res.status(400).json({ message: 'Student is already allocated to this room' });
    }

    room.occupiedBy.push(studentUser._id);
    await hostel.save();

    const updated = await Hostel.findById(hostelId).populate('rooms.occupiedBy', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deallocateBed = async (req, res) => {
  const { hostelId, roomId } = req.params;
  const { studentId } = req.body;

  try {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel block not found' });
    }

    const room = hostel.rooms.id(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found in this block' });
    }

    room.occupiedBy = room.occupiedBy.filter(id => id.toString() !== studentId);
    await hostel.save();

    const updated = await Hostel.findById(hostelId).populate('rooms.occupiedBy', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 3. INVENTORY HANDLERS
// ==========================================

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInventoryItem = async (req, res) => {
  const { name, stockQty, thresholdQty, category } = req.body;
  try {
    const item = new Inventory({ name, stockQty, thresholdQty, category });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  const { name, stockQty, thresholdQty, category } = req.body;
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (name) item.name = name;
    if (stockQty !== undefined) item.stockQty = Number(stockQty);
    if (thresholdQty !== undefined) item.thresholdQty = Number(thresholdQty);
    if (category) item.category = category;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 4. TRANSPORT HANDLERS
// ==========================================

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { vehicleNumber, model, capacity, driverName, driverPhone, driverLicense, routeDetails } = req.body;
    const vehicle = new Vehicle({
      vehicleNumber,
      model,
      capacity,
      driverName,
      driverPhone,
      driverLicense,
      routeDetails
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignVehicleToStudent = async (req, res) => {
  try {
    const { studentId, vehicleId, routeName } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student details not found' });
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
      student.assignedVehicle = vehicleId;
    } else {
      student.assignedVehicle = undefined;
    }

    if (routeName) {
      student.assignedRoute = routeName;
    }

    await student.save();
    res.json({ message: 'Student transport parameters updated successfully', data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

