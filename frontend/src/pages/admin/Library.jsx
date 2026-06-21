import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService.js';
import { Book, Plus, Search, BookOpen, User, Calendar, Trash2, X } from 'lucide-react';

export const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [copies, setCopies] = useState(1);

  const [studentEmail, setStudentEmail] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch library catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resourceService.createBook({
        title,
        author,
        isbn,
        availableCopies: Number(copies)
      });
      setSuccess('Book added to library successfully.');
      setShowAddModal(false);
      setTitle('');
      setAuthor('');
      setIsbn('');
      setCopies(1);
      loadBooks();
    } catch (err) {
      setError(err.message || 'Failed to add book.');
    }
  };

  const handleIssueBookSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resourceService.issueBook({
        bookId: selectedBook._id,
        studentEmail,
        dueDate
      });
      setSuccess(`Book successfully issued to ${studentEmail}`);
      setShowIssueModal(false);
      setStudentEmail('');
      setDueDate('');
      loadBooks();
    } catch (err) {
      setError(err.message || 'Failed to issue book.');
    }
  };

  const handleReturnBook = async (bookId, studentId) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to log return for this copy?')) return;
    try {
      await resourceService.returnBook({ bookId, studentId });
      setSuccess('Book successfully returned to shelf.');
      loadBooks();
    } catch (err) {
      setError(err.message || 'Failed to process return.');
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics calculation
  const totalBooksCount = books.reduce((acc, curr) => acc + (curr.availableCopies || 0) + (curr.issues?.length || 0), 0);
  const issuedBooksCount = books.reduce((acc, curr) => acc + (curr.issues?.length || 0), 0);
  const availableCopiesCount = books.reduce((acc, curr) => acc + (curr.availableCopies || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Library Catalog Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage textbooks, track issued assets, and add library holdings.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Book
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper primary">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{totalBooksCount}</div>
            <div className="stat-label">Total Books Held</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper warning">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{issuedBooksCount}</div>
            <div className="stat-label">Issued Copies</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper success">
            <Book size={24} />
          </div>
          <div>
            <div className="stat-value">{availableCopiesCount}</div>
            <div className="stat-label">Available on Shelf</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by title, author, or ISBN..." 
          className="form-control" 
          style={{ border: 'none', background: 'transparent', padding: '4px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Books Table */}
      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving library catalog...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Book Details</th>
                <th>ISBN</th>
                <th>Available Copies</th>
                <th>Issued Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No books matches the criteria.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{b.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {b.author}</div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace' }}>{b.isbn}</span></td>
                    <td>
                      <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {b.availableCopies} left
                      </span>
                    </td>
                    <td>
                      {b.issues && b.issues.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {b.issues.map((issue, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem', background: 'var(--border-color)', padding: '4px 8px', borderRadius: '4px' }}>
                              <span>{issue.student?.name} (Due: {new Date(issue.dueDate).toLocaleDateString()})</span>
                              <button 
                                onClick={() => handleReturnBook(b._id, issue.student?._id)} 
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Process Return"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active issues</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        disabled={b.availableCopies <= 0}
                        onClick={() => {
                          setSelectedBook(b);
                          setShowIssueModal(true);
                        }}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      >
                        Issue Copy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Add Book Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Add New Book Listing</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Book Title</label>
                <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Author Name</label>
                <input type="text" className="form-control" value={author} onChange={e => setAuthor(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">ISBN Reference</label>
                <input type="text" className="form-control" value={isbn} onChange={e => setIsbn(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Physical Copies Available</label>
                <input type="number" className="form-control" value={copies} min="1" onChange={e => setCopies(e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Register Book
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Issue Book Modal */}
      {showIssueModal && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Issue Book Copy</h3>
              <button onClick={() => {
                setShowIssueModal(false);
                setSelectedBook(null);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Issuing copy of <strong>{selectedBook.title}</strong> (ISBN: {selectedBook.isbn}).
            </p>

            <form onSubmit={handleIssueBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Student Registered Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="e.g. student@school.com"
                  value={studentEmail} 
                  onChange={e => setStudentEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Return Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Assign Book Copy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
