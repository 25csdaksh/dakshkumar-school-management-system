import React, { useState, useEffect } from 'react';
import { resourceService } from '../../services/resourceService.js';
import { Package, Plus, Edit, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';

export const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [stockQty, setStockQty] = useState(0);
  const [thresholdQty, setThresholdQty] = useState(5);
  const [category, setCategory] = useState('Stationery');

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getInventory();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve inventory listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resourceService.createInventoryItem({
        name,
        stockQty: Number(stockQty),
        thresholdQty: Number(thresholdQty),
        category
      });
      setSuccess('Inventory item added successfully.');
      setShowAddModal(false);
      setName('');
      setStockQty(0);
      setThresholdQty(5);
      setCategory('Stationery');
      loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to add item.');
    }
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resourceService.updateInventoryItem(selectedItem._id, {
        name,
        stockQty: Number(stockQty),
        thresholdQty: Number(thresholdQty),
        category
      });
      setSuccess('Inventory item updated successfully.');
      setShowEditModal(false);
      setSelectedItem(null);
      setName('');
      setStockQty(0);
      setThresholdQty(5);
      loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to update item.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    setError('');
    setSuccess('');
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await resourceService.deleteInventoryItem(itemId);
      setSuccess('Item deleted successfully.');
      loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setName(item.name);
    setStockQty(item.stockQty);
    setThresholdQty(item.thresholdQty);
    setCategory(item.category);
    setShowEditModal(true);
  };

  // Get categories list
  const categories = ['All', ...new Set(items.map(item => item.category))];

  // Filtering items
  const filteredItems = filterCategory === 'All' 
    ? items 
    : items.filter(item => item.category === filterCategory);

  // Stats
  const criticalItems = items.filter(item => item.stockQty <= item.thresholdQty);
  const outOfStockItems = items.filter(item => item.stockQty === 0);

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>School Supply & Inventory Tracker</h2>
          <p style={{ color: 'var(--text-muted)' }}>Monitor lab equipment, stationary supplies, sport assets, and critical stock levels.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Supply Item
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

      {/* Critical stock alerts */}
      {criticalItems.length > 0 && (
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--danger)', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <AlertTriangle style={{ color: 'var(--danger)' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 2px 0' }}>Critical Stock Alert</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              There are {criticalItems.length} items running low or out of stock. Please restock soon.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper primary">
            <Package size={24} />
          </div>
          <div>
            <div className="stat-value">{items.length}</div>
            <div className="stat-label">Total Unique Supplies</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper danger">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{criticalItems.length}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper success">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{items.length - criticalItems.length}</div>
            <div className="stat-label">Sufficient Stock</div>
          </div>
        </div>
      </div>

      {/* Category filter selectors */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span>Filter Category:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {categories.map((cat, idx) => (
            <button 
              key={idx} 
              className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Listings */}
      {loading ? (
        <div style={{ display: 'flex', height: '30vh', alignItems: 'center', justifyContent: 'center' }}>
          <h4>Retrieving stock catalog...</h4>
        </div>
      ) : (
        <div className="glass-panel table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Threshold Level</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center" style={{ color: 'var(--text-muted)', padding: '24px' }}>
                    No inventory records matches the filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.stockQty <= item.thresholdQty;
                  const isOut = item.stockQty === 0;
                  return (
                    <tr key={item._id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{item.name}</strong></td>
                      <td><span className="badge badge-primary">{item.category}</span></td>
                      <td><strong style={{ color: isCritical ? 'var(--danger)' : 'var(--text-main)', fontSize: '1.05rem' }}>{item.stockQty} units</strong></td>
                      <td><span>{item.thresholdQty} units</span></td>
                      <td>
                        <span className={`badge ${
                          isOut ? 'badge-danger' : 
                          isCritical ? 'badge-warning' : 'badge-success'
                        }`}>
                          {isOut ? 'OUT OF STOCK' : isCritical ? 'CRITICAL LOW' : 'SUFFICIENT'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '6px' }}
                            onClick={() => handleEditClick(item)}
                            title="Restock / Edit item"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            style={{ padding: '6px', background: 'var(--danger)', color: 'white' }}
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Register Supply Asset</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Supply Item Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Science Lab Glass Beakers" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="Stationery">Stationery</option>
                  <option value="Science Lab">Science Lab</option>
                  <option value="Sports Assets">Sports Assets</option>
                  <option value="Office Equipment">Office Equipment</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Initial Stock Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={stockQty} 
                  min="0"
                  onChange={e => setStockQty(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Critical Warning Threshold</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={thresholdQty} 
                  min="0"
                  onChange={e => setThresholdQty(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Register Supply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit / Restock Modal */}
      {showEditModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Restock & Edit Item</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setSelectedItem(null);
              }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditItemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Supply Item Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="Stationery">Stationery</option>
                  <option value="Science Lab">Science Lab</option>
                  <option value="Sports Assets">Sports Assets</option>
                  <option value="Office Equipment">Office Equipment</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Update Stock Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={stockQty} 
                  min="0"
                  onChange={e => setStockQty(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Critical Warning Threshold</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={thresholdQty} 
                  min="0"
                  onChange={e => setThresholdQty(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-full">
                Save Stock Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
