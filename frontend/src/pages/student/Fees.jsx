import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { feeService } from '../../services/feeService.js';
import { CreditCard, CheckCircle, Loader2, Lock, X, Smartphone, Globe } from 'lucide-react';

export const Fees = ({ studentId }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Razorpay simulated checkout states
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select_method'); // select_method, details, processing, success
  const [selectedMethod, setSelectedMethod] = useState(''); // card, upi, netbanking
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [netbankSelected, setNetbankSelected] = useState('SBI');

  const loadInvoices = async () => {
    try {
      const data = await studentService.getStudentFees(studentId);
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch billing invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [studentId]);

  const handlePayClick = (invoice) => {
    setPayingInvoice(invoice);
    setPaymentStep('select_method');
    setSelectedMethod('');
    setCardNo('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setUpiId('');
    setNetbankSelected('SBI');
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentStep('details');
  };

  const handleSimulatePayment = async () => {
    setPaymentStep('processing');
    
    // Simulate Razorpay network processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const balance = payingInvoice.amount - (payingInvoice.amountPaid || 0);
      await feeService.recordPayment(payingInvoice._id, {
        amountPaid: balance,
        paymentMethod: `Razorpay Online (${selectedMethod.toUpperCase()})`
      });
      setPaymentStep('success');
      loadInvoices();
    } catch (err) {
      setError('Failed to update billing details on server.');
      setPayingInvoice(null);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h2>Fee Invoices & Receipts</h2>
        <p style={{ color: 'var(--text-muted)' }}>List of outstanding invoices, bills, and payment histories.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', height: '40vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving billing data...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice Title</th>
                <th>Billed Amount</th>
                <th>Amount Paid</th>
                <th>Balance Due</th>
                <th>Due Date</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const balance = inv.amount - (inv.amountPaid || 0);
                  return (
                    <tr key={inv._id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{inv.title}</strong></td>
                      <td>${inv.amount}</td>
                      <td style={{ color: 'var(--success)' }}>${inv.amountPaid || 0}</td>
                      <td style={{ color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        ${balance}
                      </td>
                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td>{inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : '-'}</td>
                      <td>{inv.paymentMethod || 'None'}</td>
                      <td>
                        <span className={`badge ${
                          inv.status === 'Paid' ? 'badge-success' : 
                          inv.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {balance > 0 ? (
                          <button 
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => handlePayClick(inv)}
                          >
                            <CreditCard size={14} /> Pay Online
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem' }}>Paid</span>
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

      {payingInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '0', overflow: 'hidden', border: 'none', background: '#0b0f19', color: '#f3f4f6', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            {/* Razorpay Header */}
            <div style={{ background: '#111827', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#2563eb', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '800', letterSpacing: '1px', fontSize: '1.25rem', color: '#fff' }}>R</span>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>Dakshkumar Academy</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>ERP Fee Payment Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setPayingInvoice(null)} 
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {paymentStep === 'select_method' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>PAYING AMOUNT</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#38bdf8' }}>${payingInvoice.amount - (payingInvoice.amountPaid || 0)}</span>
                  </div>

                  <h5 style={{ marginBottom: '16px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>Select Payment Option</h5>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      onClick={() => handleMethodSelect('card')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                    >
                      <CreditCard size={20} style={{ color: '#3b82f6' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>Card</strong>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Pay via Visa, Mastercard, RuPay</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleMethodSelect('upi')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                    >
                      <Smartphone size={20} style={{ color: '#10b981' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>UPI</strong>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Google Pay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleMethodSelect('netbanking')} 
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
                    >
                      <Globe size={20} style={{ color: '#fbbf24' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>Net Banking</strong>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>All major Indian banks available</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'details' && (
                <div>
                  {selectedMethod === 'card' && (
                    <div>
                      <h5 style={{ marginBottom: '16px', color: '#fff', fontSize: '0.95rem' }}>Enter Card Details</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Card Number</label>
                          <input 
                            type="text" 
                            placeholder="4111 2222 3333 4444" 
                            value={cardNo} 
                            onChange={e => setCardNo(e.target.value)} 
                            style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '14px' }}>
                          <div style={{ width: '50%' }}>
                            <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Expiry Date</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              value={cardExpiry} 
                              onChange={e => setCardExpiry(e.target.value)} 
                              style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
                            />
                          </div>
                          <div style={{ width: '50%' }}>
                            <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>CVV</label>
                            <input 
                              type="password" 
                              placeholder="***" 
                              value={cardCvv} 
                              onChange={e => setCardCvv(e.target.value)} 
                              style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Card Holder Name</label>
                          <input 
                            type="text" 
                            placeholder="John Doe" 
                            value={cardName} 
                            onChange={e => setCardName(e.target.value)} 
                            style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'upi' && (
                    <div>
                      <h5 style={{ marginBottom: '16px', color: '#fff', fontSize: '0.95rem' }}>Enter UPI ID</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>VPA / UPI ID</label>
                        <input 
                          type="text" 
                          placeholder="username@bank" 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)} 
                          style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
                        />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '12px', lineHeight: '1.4' }}>A payment request will be sent to your UPI app. Approve the transaction to complete payment.</p>
                    </div>
                  )}

                  {selectedMethod === 'netbanking' && (
                    <div>
                      <h5 style={{ marginBottom: '16px', color: '#fff', fontSize: '0.95rem' }}>Select Bank</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Popular Banks</label>
                        <select 
                          value={netbankSelected} 
                          onChange={e => setNetbankSelected(e.target.value)} 
                          style={{ width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                        >
                          <option value="SBI">State Bank of India</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button 
                      onClick={() => setPaymentStep('select_method')} 
                      style={{ width: '30%', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', background: 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSimulatePayment} 
                      style={{ width: '70%', padding: '12px', border: 'none', borderRadius: '8px', background: '#2563eb', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                    >
                      Pay ${payingInvoice.amount - (payingInvoice.amountPaid || 0)}
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <Loader2 className="animate-spin" size={48} style={{ color: '#2563eb', margin: '0 auto 20px', display: 'block' }} />
                  <h5 style={{ color: '#fff', marginBottom: '8px', fontSize: '1rem', fontWeight: '600' }}>Processing Payment</h5>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>Communicating with Razorpay servers...</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '36px 0' }}>
                  <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 20px', display: 'block' }} />
                  <h5 style={{ color: '#fff', marginBottom: '8px', fontSize: '1.1rem', fontWeight: '700' }}>Payment Successful</h5>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '24px' }}>Transaction ID: pay_sim_{Math.floor(Math.random() * 1000000000)}</p>
                  <button 
                    onClick={() => setPayingInvoice(null)} 
                    style={{ padding: '10px 28px', border: 'none', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Razorpay Footer */}
            <div style={{ background: '#0b0f19', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <Lock size={12} style={{ color: '#9ca3af' }} />
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', letterSpacing: '0.5px', fontWeight: '600' }}>SECURE PAYMENTS BY RAZORPAY</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
