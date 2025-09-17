import React, { useState, useEffect } from 'react';
import './CustomerList.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [filterLoanType, setFilterLoanType] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://crm-backend-k8of.onrender.com/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`https://crm-backend-k8of.onrender.com/api/customers/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Customer deleted successfully');
        fetchCustomers();
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Phone', 'Email', 'Aadhaar', 'PAN', 'CIBIL', 'Address',
      'Problem', 'Bank', 'Loan Type', 'Account Number', 'Issues',
      'Page Number', 'Referred Person', 'Telecaller', 'Created Date',
      'Aadhaar Document', 'PAN Document', 'Account Statement', 'Payment Proof'
    ];

    const csvData = customers.map(customer => [
      customer.name,
      customer.phone,
      customer.email,
      customer.aadhaar,
      customer.pan,
      customer.cibil,
      customer.address,
      customer.problem,
      customer.bank,
      customer.loanType,
      customer.accountNumber,
      customer.issues.join(', '),
      customer.pageNumber,
      customer.referredPerson,
      `${customer.telecallerName} (${customer.telecallerId})`,
      new Date(customer.createdAt).toLocaleDateString(),
      customer.documents?.aadhaar || '-',
      customer.documents?.pan || '-',
      customer.documents?.accountStatement || '-',
      customer.documents?.paymentProof || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
      Object.values(customer).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesBank = filterBank === '' || customer.bank === filterBank;
    const matchesLoanType = filterLoanType === '' || customer.loanType === filterLoanType;
    return matchesSearch && matchesBank && matchesLoanType;
  });

  const banks = [...new Set(customers.map(c => c.bank).filter(Boolean))];
  const loanTypes = [...new Set(customers.map(c => c.loanType).filter(Boolean))];

  if (loading) return <div className="loading">Loading customers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="customer-list-container">
      <div className="page-header">
        <h2>Customer Management</h2>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={exportToCSV}>Export to CSV</button>
        </div>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control search-box"
        />
        <select value={filterBank} onChange={(e) => setFilterBank(e.target.value)} className="form-control">
          <option value="">All Banks</option>
          {banks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
        </select>
        <select value={filterLoanType} onChange={(e) => setFilterLoanType(e.target.value)} className="form-control">
          <option value="">All Loan Types</option>
          {loanTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div className="table-responsive">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Bank</th>
              <th>Loan Type</th>
              <th>Account Number</th>
              <th>Telecaller</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr><td colSpan="9" className="no-data">No customers found</td></tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.bank}</td>
                  <td>{customer.loanType}</td>
                  <td>{customer.accountNumber}</td>
                  <td>{customer.telecallerName}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-view" onClick={() => viewCustomerDetails(customer)}>👁️</button>
                      <button className="btn btn-delete" onClick={() => deleteCustomer(customer._id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item"><label>Name:</label><span>{selectedCustomer.name}</span></div>
                <div className="detail-item"><label>Phone:</label><span>{selectedCustomer.phone}</span></div>
                <div className="detail-item"><label>Email:</label><span>{selectedCustomer.email || '-'}</span></div>
                <div className="detail-item">
  <label>Aadhaar:</label>
  {selectedCustomer.documents?.aadhaar ? (
    <img
      src={`https://crm-backend-k8of.onrender.com/uploads/${selectedCustomer.documents.aadhaar}`}
      alt="Aadhaar"
      className="doc-image"
    />
  ) : (
    <span>{selectedCustomer.aadhaar || '-'}</span>
  )}
</div>

<div className="detail-item">
  <label>PAN:</label>
  {selectedCustomer.documents?.pan ? (
    <img
      src={`https://crm-backend-k8of.onrender.com/uploads/${selectedCustomer.documents.pan}`}
      alt="PAN"
      className="doc-image"
    />
  ) : (
    <span>{selectedCustomer.pan || '-'}</span>
  )}
</div>

<div className="detail-item">
  <label>Account Statement:</label>
  {selectedCustomer.documents?.accountStatement ? (
    <img
      src={`https://crm-backend-k8of.onrender.com/uploads/${selectedCustomer.documents.accountStatement}`}
      alt="Account Statement"
      className="doc-image"
    />
  ) : (
    <span>-</span>
  )}
</div>

<div className="detail-item">
  <label>Payment Proof:</label>
  {selectedCustomer.documents?.paymentProof ? (
    <img
      src={`https://crm-backend-k8of.onrender.com/uploads/${selectedCustomer.documents.paymentProof}`}
      alt="Payment Proof"
      className="doc-image"
    />
  ) : (
    <span>-</span>
  )}
</div>

                <div className="detail-item"><label>CIBIL Score:</label><span>{selectedCustomer.cibil || '-'}</span></div>
                <div className="detail-item full-width"><label>Address:</label><span>{selectedCustomer.address || '-'}</span></div>
                <div className="detail-item full-width"><label>Problem Description:</label><span>{selectedCustomer.problem}</span></div>
                <div className="detail-item"><label>Bank:</label><span>{selectedCustomer.bank}</span></div>
                <div className="detail-item"><label>Loan Type:</label><span>{selectedCustomer.loanType}</span></div>
                <div className="detail-item"><label>Account Number:</label><span>{selectedCustomer.accountNumber}</span></div>
                <div className="detail-item full-width"><label>Issues:</label><span>{selectedCustomer.issues.join(', ')}</span></div>
                <div className="detail-item"><label>Page Number:</label><span>{selectedCustomer.pageNumber || '-'}</span></div>
                <div className="detail-item"><label>Referred By:</label><span>{selectedCustomer.referredPerson || '-'}</span></div>
                <div className="detail-item"><label>Telecaller:</label><span>{selectedCustomer.telecallerName} ({selectedCustomer.telecallerId})</span></div>
                <div className="detail-item"><label>Created Date:</label><span>{new Date(selectedCustomer.createdAt).toLocaleString()}</span></div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
