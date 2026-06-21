import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import FeePayment from '../models/FeePayment.js';
import FeeCategory from '../models/FeeCategory.js';

// @desc    Admin: Create new fee invoice (individual or bulk)
export const createFeeInvoice = async (req, res) => {
  const { studentId, classId, title, amount, dueDate, category } = req.body;

  try {
    let invoiceAmount = amount;
    if (category) {
      const catDoc = await FeeCategory.findOne({ name: category });
      if (catDoc) invoiceAmount = catDoc.amount;
    }

    if (classId && !studentId) {
      const studentDocs = await Student.find({ classId });
      if (studentDocs.length === 0) {
        return res.status(404).json({ message: 'No students found in this class' });
      }

      const invoices = studentDocs.map(doc => ({
        student: doc.user,
        title,
        amount: invoiceAmount,
        dueDate,
        status: 'Unpaid'
      }));

      await Fee.insertMany(invoices);
      return res.status(201).json({ message: `Successfully generated ${invoices.length} invoices.` });
    }

    const newInvoice = new Fee({
      student: studentId,
      title,
      amount: invoiceAmount,
      dueDate,
      status: 'Unpaid'
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Get list of all invoices
export const getFeeInvoices = async (req, res) => {
  try {
    const invoices = await Fee.find({}).populate('student', 'name email');

    const studentDocs = await Student.find({});
    const studentMap = {};
    studentDocs.forEach(s => {
      studentMap[s.user.toString()] = {
        rollNumber: s.rollNumber,
        classId: s.classId ? s.classId.toString() : null,
        section: s.section || 'A'
      };
    });

    const formatted = invoices.map(inv => {
      if (!inv.student) return null;
      const sInfo = studentMap[inv.student._id.toString()] || { rollNumber: '-', classId: null, section: 'A' };
      
      // Late Fee calculation (Rs 10 per day late after due date)
      let lateFee = 0;
      if (new Date() > new Date(inv.dueDate) && inv.status !== 'Paid') {
        const diffTime = Math.abs(new Date() - new Date(inv.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lateFee = diffDays * 10;
      }

      return {
        _id: inv._id,
        title: inv.title,
        amount: inv.amount,
        dueDate: inv.dueDate,
        status: inv.status,
        amountPaid: inv.amountPaid,
        lateFee,
        totalDue: inv.amount + lateFee - inv.amountPaid,
        student: {
          _id: inv.student._id,
          name: inv.student.name,
          email: inv.student.email,
          studentInfo: { 
            rollNumber: sInfo.rollNumber,
            classId: sInfo.classId,
            section: sInfo.section
          }
        }
      };
    }).filter(i => i !== null);

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Collect/Record fee payment
export const recordFeePayment = async (req, res) => {
  const { amountPaid, paymentMethod, transactionId } = req.body;
  try {
    const invoice = await Fee.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // 1. Log payment transaction
    const payment = new FeePayment({
      feeId: invoice._id,
      amountPaid: Number(amountPaid),
      paymentMethod,
      transactionId: transactionId || `TXN-MOCK-${Date.now()}`,
      collectedBy: req.user?._id
    });
    await payment.save();

    // 2. Accumulate payment total in primary invoice document
    invoice.amountPaid = (invoice.amountPaid || 0) + Number(amountPaid);
    
    if (invoice.amountPaid >= invoice.amount) {
      invoice.status = 'Paid';
    } else if (invoice.amountPaid > 0) {
      invoice.status = 'Partially Paid';
    } else {
      invoice.status = 'Unpaid';
    }

    const updatedInvoice = await invoice.save();
    res.json({ updatedInvoice, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// FEE CATEGORIES CRUD
// ==========================================
export const createFeeCategory = async (req, res) => {
  try {
    const { name, amount, description } = req.body;
    const cat = new FeeCategory({ name, amount, description });
    await cat.save();
    res.status(201).json({ message: 'Fee category created', data: cat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeeCategories = async (req, res) => {
  try {
    const cats = await FeeCategory.find();
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFeeCategory = async (req, res) => {
  try {
    await FeeCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fee category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// MOCK ONLINE PAYMENT ORDER GENERATION (Razorpay integration)
// ==========================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;
    // Generate a mock Razorpay order structure
    const orderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
    res.json({
      success: true,
      orderId,
      amount,
      currency: 'INR',
      key: 'rzp_test_mockkey12345'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { invoiceId, paymentId, orderId, signature, amount } = req.body;
    
    const invoice = await Fee.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Mark paid online
    const payment = new FeePayment({
      feeId: invoice._id,
      amountPaid: Number(amount),
      paymentMethod: 'UPI',
      transactionId: paymentId || `UPI-TXN-${Date.now()}`,
      collectedBy: invoice.student // paid by student
    });
    await payment.save();

    invoice.amountPaid = (invoice.amountPaid || 0) + Number(amount);
    invoice.status = invoice.amountPaid >= invoice.amount ? 'Paid' : 'Partially Paid';
    await invoice.save();

    res.json({ success: true, message: 'Payment verified and recorded', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// RECEIPT GENERATION & FEE REMINDER DISPATCH
// ==========================================
export const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id)
      .populate({
        path: 'feeId',
        populate: { path: 'student', select: 'name email phone' }
      })
      .populate('collectedBy', 'name');

    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendFeeReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Fee.findById(id).populate('student', 'name email phone');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    console.log(`[FEE REMINDER SIMULATION] Message dispatched to student ${invoice.student.name} (${invoice.student.phone || 'no phone'}): "Dear student/parent, payment of Rs ${invoice.amount - invoice.amountPaid} is pending for '${invoice.title}'. Due date: ${invoice.dueDate.toDateString()}."`);

    res.json({ success: true, message: 'Fee reminder sent successfully (Simulated)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

