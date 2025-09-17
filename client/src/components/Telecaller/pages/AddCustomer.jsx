import React, { useState, useEffect } from 'react';
import './AddCustomer.css';

const AddCustomer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    cibil: '',
    address: '',
    problem: '',
    bank: '',
    otherBank: '',
    loanType: '',
    accountNumber: '',
    issues: [],
    pageNumber: '',
    referredPerson: '',
    telecallerId: '',
    telecallerName: ''
  });

  const [files, setFiles] = useState({
    aadhaarDoc: null,
    panDoc: null,
    accountStatementDoc: null
  });

  const [errors, setErrors] = useState({});
  const [showOtherBank, setShowOtherBank] = useState(false);
  const [showIssuesDropdown, setShowIssuesDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issuesOptions = [
    "EMI not reflected",
    "Failed transaction",
    "KYC pending",
    "Incorrect charges",
    "Disbursement delay",
    "NACH / ECS issue",
    "Foreclosure statement",
    "Prepayment request",
    "Portal / login access",
    "Other"
  ];

  // Get telecaller details from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({
          ...prev,
          telecallerId: user.id || '',
          telecallerName: user.username || ''
        }));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox changes for issues
      if (name === 'issues') {
        const updatedIssues = checked
          ? [...formData.issues, value]
          : formData.issues.filter(issue => issue !== value);
        
        setFormData({ ...formData, issues: updatedIssues });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Show other bank input if "Other" is selected
      if (name === 'bank') {
        setShowOtherBank(value === 'other');
      }
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles({ ...files, [name]: fileList[0] });
    }
  };

  const toggleIssuesDropdown = () => {
    setShowIssuesDropdown(!showIssuesDropdown);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.problem.trim()) newErrors.problem = 'Problem description is required';
    if (!formData.bank) newErrors.bank = 'Bank selection is required';
    if (formData.bank === 'other' && !formData.otherBank.trim()) {
      newErrors.otherBank = 'Please specify bank name';
    }
    if (!formData.loanType) newErrors.loanType = 'Loan type is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    
    if (!formData.issues.length) newErrors.issues = 'At least one issue must be selected';
    if (!formData.telecallerId.trim()) newErrors.telecallerId = 'Telecaller information is missing';
    if (!formData.telecallerName.trim()) newErrors.telecallerName = 'Telecaller information is missing';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formPayload = new FormData();

      // Add all form data fields
      Object.keys(formData).forEach(key => {
        if (key === 'issues') {
          // Handle array field
          formData.issues.forEach(issue => {
            formPayload.append('issues', issue);
          });
        } else {
          formPayload.append(key, formData[key]);
        }
      });

      // Add files
      if (files.aadhaarDoc) formPayload.append('aadhaarDoc', files.aadhaarDoc);
      if (files.panDoc) formPayload.append('panDoc', files.panDoc);
      if (files.accountStatementDoc) formPayload.append('accountStatementDoc', files.accountStatementDoc);

      const response = await fetch('https://crm-backend-k8of.onrender.com/api/customers', {
        method: 'POST',
        body: formPayload
      });

      const result = await response.json();

      if (response.ok) {
        alert('Customer added successfully!');
        // Reset form (keep telecaller info)
        setFormData({
          name: '',
          phone: '',
          email: '',
          aadhaar: '',
          pan: '',
          cibil: '',
          address: '',
          problem: '',
          bank: '',
          otherBank: '',
          loanType: '',
          accountNumber: '',
          issues: [],
          pageNumber: '',
          referredPerson: '',
          telecallerId: formData.telecallerId,
          telecallerName: formData.telecallerName
        });
        // Reset files
        setFiles({
          aadhaarDoc: null,
          panDoc: null,
          accountStatementDoc: null
        });
      } else {
        alert(`Error: ${result.error || result.message}`);
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-customer-container">
      <div className="page" id="add-customer">
        <div className="page-title">
          <h2>Add New Customer</h2>
          {formData.telecallerName && (
            <div className="telecaller-info">
              Logged in as: {formData.telecallerName} (ID: {formData.telecallerId})
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="card-header">
            <div className="card-title">Customer Information</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className={`form-control ${errors.name ? 'error' : ''}`} 
                  placeholder="e.g., Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  className={`form-control ${errors.phone ? 'error' : ''}`} 
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`} 
                  placeholder="e.g., rajesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="aadhaar">Aadhaar Number</label>
                <input 
                  type="text" 
                  id="aadhaar" 
                  name="aadhaar"
                  className="form-control" 
                  placeholder="e.g., 1234 5678 9012"
                  value={formData.aadhaar}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pan">PAN Number</label>
                <input 
                  type="text" 
                  id="pan" 
                  name="pan"
                  className="form-control" 
                  placeholder="e.g., ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cibil">CIBIL Score</label>
                <input 
                  type="number" 
                  id="cibil" 
                  name="cibil"
                  className="form-control" 
                  placeholder="e.g., 750"
                  min="300"
                  max="900"
                  value={formData.cibil}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea 
                id="address" 
                name="address"
                className="form-control" 
                placeholder="Enter complete address with city and pincode" 
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="problem">Problem Description *</label>
              <textarea 
                id="problem" 
                name="problem"
                className={`form-control ${errors.problem ? 'error' : ''}`} 
                placeholder="Describe the issue the customer is facing" 
                rows="3"
                value={formData.problem}
                onChange={handleChange}
              ></textarea>
              {errors.problem && <span className="error-text">{errors.problem}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="bank">Bank *</label>
              <select 
                id="bank" 
                name="bank" 
                className={`form-control ${errors.bank ? 'error' : ''}`} 
                value={formData.bank}
                onChange={handleChange}
              >
                <option value="" disabled>Select bank name</option>
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="other">Other Bank</option>
              </select>
              {errors.bank && <span className="error-text">{errors.bank}</span>}
            </div>

            {showOtherBank && (
              <div className="form-group">
                <label htmlFor="otherBank">Specify Bank Name *</label>
                <input 
                  type="text" 
                  id="otherBank" 
                  name="otherBank" 
                  className={`form-control ${errors.otherBank ? 'error' : ''}`} 
                  placeholder="Enter bank name"
                  value={formData.otherBank}
                  onChange={handleChange}
                />
                {errors.otherBank && <span className="error-text">{errors.otherBank}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="loanType">Loan Type *</label>
              <select 
                id="loanType" 
                name="loanType" 
                className={`form-control ${errors.loanType ? 'error' : ''}`} 
                value={formData.loanType}
                onChange={handleChange}
              >
                <option value="" disabled>Select type of loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Gold Loan">Gold Loan</option>
                <option value="Loan Against Property (LAP)">Loan Against Property (LAP)</option>
                <option value="Credit Card">Credit Card</option>
              </select>
              {errors.loanType && <span className="error-text">{errors.loanType}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="accountNumber">Account Number *</label>
              <input
                id="accountNumber"
                name="accountNumber"
                className={`form-control ${errors.accountNumber ? 'error' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength="18"
                placeholder="e.g., 123456789012"
                value={formData.accountNumber}
                onChange={handleChange}
              />
              <small className="form-text text-muted">Enter 9-18 digit account number</small>
              {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
            </div>

            <div className="form-group">
              <label>Issues *</label>
              <div className="dropdown-checkboxes">
                <button 
                  type="button" 
                  className={`dropdown-toggle form-control ${errors.issues ? 'error' : ''}`}
                  onClick={toggleIssuesDropdown}
                >
                  {formData.issues.length > 0 
                    ? `${formData.issues.length} issue(s) selected` 
                    : 'Select issues faced by customer'}
                </button>
                
                {showIssuesDropdown && (
                  <div className="dropdown-menu">
                    {issuesOptions.map(issue => (
                      <label key={issue} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="issues"
                          value={issue}
                          checked={formData.issues.includes(issue)}
                          onChange={handleChange}
                        />
                        {issue}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.issues && <span className="error-text">{errors.issues}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pageNumber">Page Number</label>
                <input 
                  id="pageNumber" 
                  name="pageNumber" 
                  className="form-control" 
                  type="number" 
                  min="1" 
                  step="1" 
                  placeholder="e.g., 3"
                  value={formData.pageNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="referredPerson">Referred By</label>
                <input 
                  id="referredPerson" 
                  name="referredPerson" 
                  className="form-control" 
                  placeholder="Type referral name"
                  value={formData.referredPerson}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="aadhaarDoc">Upload Aadhaar (PDF/Image)</label>
                <input 
                  type="file"
                  id="aadhaarDoc"
                  name="aadhaarDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {files.aadhaarDoc && <span className="file-name">{files.aadhaarDoc.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="panDoc">Upload PAN (PDF/Image)</label>
                <input 
                  type="file"
                  id="panDoc"
                  name="panDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {files.panDoc && <span className="file-name">{files.panDoc.name}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="accountStatementDoc">Upload Account Statement (PDF/Image)</label>
              <input 
                type="file"
                id="accountStatementDoc"
                name="accountStatementDoc"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="form-control"
              />
              {files.accountStatementDoc && <span className="file-name">{files.accountStatementDoc.name}</span>}
            </div>

            {/* Hidden fields for telecaller info */}
            <input type="hidden" name="telecallerId" value={formData.telecallerId} />
            <input type="hidden" name="telecallerName" value={formData.telecallerName} />

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;