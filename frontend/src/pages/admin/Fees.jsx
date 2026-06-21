import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/feeService.js';
import { studentService } from '../../services/studentService.js';
import { Plus, CreditCard, DollarSign, X } from 'lucide-react';

export const Fees = () => {
  const [invoices, setInvoices] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal controls
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // New Invoice form states
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState(''); // Empty means bulk class invoice
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Collect Payment form states
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await feeService.getInvoices();
      setInvoices(data);

      const classData = await studentService.getClasses();
      setClasses(classData);

      const studentData = await studentService.getUsersByRole('student');
      setStudents(studentData);
    } catch (err) {
      setError(err.message || 'Failed to fetch financial data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      studentId: studentId || undefined,
      classId: studentId ? undefined : classId,
      title: invoiceTitle,
      amount: Number(invoiceAmount),
      dueDate
    };

    try {
      await feeService.createInvoice(payload);
      setSuccess('Invoice(s) generated successfully.');
      setShowInvoiceModal(false);
      // Reset fields
      setClassId('');
      setStudentId('');
      setInvoiceTitle('');
      setInvoiceAmount('');
      setDueDate('');
      fetchInvoices();
    } catch (err) {
      setError(err.message || 'Failed to create fee invoices.');
    }
  };

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setAmountPaid(invoice.amount - invoice.amountPaid); // Default to remaining balance
    setShowPaymentModal(true);
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedInvoice) return;

    try {
      await feeService.recordPayment(selectedInvoice._id, {
        amountPaid: Number(amountPaid) + selectedInvoice.amountPaid,
        paymentMethod
      });
      setSuccess(`Payment recorded successfully for ${selectedInvoice.student?.name}`);
      setShowPaymentModal(false);
      fetchInvoices();
    } catch (err) {
      setError(err.message || 'Failed to record payment.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Fee Registers & Billing</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate class invoices, track balances, and collect payments.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
          <Plus size={18} />
          <span>New Invoice</span>
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Loading billing ledgers...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice Title</th>
                <th>Student</th>
                <th>Total Bill</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center" style={{ color: 'var(--text-muted)' }}>
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const balance = inv.amount - inv.amountPaid;
                  return (
                    <tr key={inv._id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{inv.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{inv.student?.name || 'Unknown Student'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Roll: {inv.student?.studentInfo?.rollNumber || '-'}
                          </span>
                        </div>
                      </td>
                      <td>${inv.amount}</td>
                      <td style={{ color: 'var(--success)' }}>${inv.amountPaid || 0}</td>
                      <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ${balance}
                      </td>
                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          inv.status === 'Paid' ? 'badge-success' : 
                          inv.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        {inv.status !== 'Paid' ? (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleOpenPayment(inv)}
                          >
                            <CreditCard size={14} />
                            <span>Collect</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowInvoiceModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <DollarSign size={20} color="var(--primary)" />
              <span>Create Fee Invoice</span>
            </h3>

            <form onSubmit={handleCreateInvoice}>
              <div className="form-group">
                <label className="form-label">Billing Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={invoiceTitle} 
                  onChange={(e) => setInvoiceTitle(e.target.value)} 
                  placeholder="e.g. Tuition Fee Q1"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Billing Amount ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={invoiceAmount} 
                    onChange={(e) => setInvoiceAmount(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '16px 0', paddingTop: '16px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Target Invoice Recipients:
                </p>
                
                <div className="form-group">
                  <label className="form-label">Specific Student (Optional)</label>
                  <select 
                    className="form-control" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)}
                  >
                    <option value="">Apply to Whole Class (choose below)</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} (Roll: {s.studentInfo?.rollNumber})</option>
                    ))}
                  </select>
                </div>

                {!studentId && (
                  <div className="form-group">
                    <label className="form-label">Target Grade Class</label>
                    <select 
                      className="form-control" 
                      value={classId} 
                      onChange={(e) => setClassId(e.target.value)}
                      required={!studentId}
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <CreditCard size={20} color="var(--success)" />
              <span>Record Fee Payment</span>
            </h3>

            <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>
              Invoice: <strong>{selectedInvoice.title}</strong> for <strong>{selectedInvoice.student?.name}</strong>
            </p>

            <form onSubmit={handleCollectPayment}>
              <div className="form-group">
                <label className="form-label">Amount Collected ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={amountPaid} 
                  onChange={(e) => setAmountPaid(e.target.value)} 
                  max={selectedInvoice.amount - selectedInvoice.amountPaid}
                  required 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Remaining balance due: ${selectedInvoice.amount - selectedInvoice.amountPaid}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select 
                  className="form-control" 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="UPI">UPI (Online Payment)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-full mt-4">
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
