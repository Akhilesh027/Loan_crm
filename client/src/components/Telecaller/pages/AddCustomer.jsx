import React, { useState, useEffect } from 'react';
import './AddCustomer.css';

const AddCustomer = ({ isOpen, onClose, prefill = {}, notify }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    aadhaar: '',
    pan: '',
    cibil: '',
    address: '',
    problem: '',
    banks: [],
    otherBanks: [],
    loanType: '',
    accountNumbers: {},
    issues: [],
    pageNumber: '',
    referredPerson: '',
    telecallerId: '',
    telecallerName: '',
  });

  const [customFields, setCustomFields] = useState([]);

  const [files, setFiles] = useState({
    aadhaarDoc: null,
    panDoc: null,
    accountStatementDoc: null,
    additionalDoc: null,
  });

  const [errors, setErrors] = useState({});
  const [showIssuesDropdown, setShowIssuesDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bankOptions = [
    'State Bank of India (SBI)',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Other',
  ];

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

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    let telecallerId = '';
    let telecallerName = '';

    if (userData) {
      try {
        const user = JSON.parse(userData);
        telecallerId = user.id || '';
        telecallerName = user.username || '';
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }

    setFormData(prev => ({
      ...prev,
      telecallerId,
      telecallerName,
      ...prefill,
      banks: prefill.banks || [],
      otherBanks: prefill.otherBanks || [],
      accountNumbers: prefill.accountNumbers || {},
      issues: prefill.issues || [],
    }));

    setCustomFields(prefill.customFields || []);
  }, [prefill]);

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;

    if (type === 'checkbox' && name === 'issues') {
      const updatedIssues = checked
        ? [...formData.issues, value]
        : formData.issues.filter(issue => issue !== value);
      setFormData(prev => ({ ...prev, issues: updatedIssues }));
    } else if (type === 'checkbox' && name === 'banks') {
      const selectedBanks = checked
        ? [...formData.banks, value]
        : formData.banks.filter(b => b !== value);

      let updatedOtherBanks = [...formData.otherBanks];
      let updatedAccountNumbers = { ...formData.accountNumbers };

      if (!checked) {
        if (value === 'Other') {
          updatedOtherBanks = [];
        }
        delete updatedAccountNumbers[value];
      }

      setFormData(prev => ({
        ...prev,
        banks: selectedBanks,
        otherBanks: updatedOtherBanks,
        accountNumbers: updatedAccountNumbers,
      }));
    } else if (name.startsWith('otherBank_')) {
      const idx = Number(dataset.index);
      const otherBanksCopy = [...formData.otherBanks];
      otherBanksCopy[idx] = value;
      setFormData(prev => ({ ...prev, otherBanks: otherBanksCopy }));
    } else if (name.startsWith('accountNumber_')) {
      const bank = dataset.bank;
      const updatedAccNos = { ...formData.accountNumbers, [bank]: value };
      setFormData(prev => ({ ...prev, accountNumbers: updatedAccNos }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Custom fields handlers
  const addCustomField = () => {
    setCustomFields(prev => [...prev, { label: '', type: 'text', value: '' }]);
  };

  const updateCustomField = (index, field, val) => {
    const updated = [...customFields];
    updated[index][field] = val;
    setCustomFields(updated);
  };

  const removeCustomField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const toggleIssuesDropdown = () => {
    setShowIssuesDropdown(prev => !prev);
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

    if (!formData.banks.length) newErrors.banks = 'At least one bank must be selected';

    if (formData.banks.includes('Other')) {
      formData.otherBanks.forEach((otherBankName, idx) => {
        if (!otherBankName.trim()) {
          newErrors[`otherBank_${idx}`] = 'Specify other bank name';
        }
        const accNo = formData.accountNumbers[otherBankName];
        if (!accNo || !/^\d{9,18}$/.test(accNo)) {
          newErrors[`accountNumber_${otherBankName}`] = 'Valid account number required for other bank';
        }
      });
      if (formData.otherBanks.length === 0) {
        newErrors.otherBanks = 'Please add at least one other bank';
      }
    }

    formData.banks.forEach(bank => {
      if (bank !== 'Other') {
        const accNo = formData.accountNumbers[bank];
        if (!accNo || !/^\d{9,18}$/.test(accNo)) {
          newErrors[`accountNumber_${bank}`] = `Valid account number required for ${bank}`;
        }
      }
    });

    if (!formData.loanType) newErrors.loanType = 'Loan type is required';

    if (!formData.issues.length) newErrors.issues = 'At least one issue must be selected';
    if (!formData.telecallerId.trim()) newErrors.telecallerId = 'Telecaller information is missing';
    if (!formData.telecallerName.trim()) newErrors.telecallerName = 'Telecaller information is missing';

    customFields.forEach((field, idx) => {
      if (!field.label.trim()) {
        newErrors[`customFieldLabel_${idx}`] = 'Custom field label is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(prev => ({
      name: '',
      phone: '',
      email: '',
      aadhaar: '',
      pan: '',
      cibil: '',
      address: '',
      problem: '',
      banks: [],
      otherBanks: [],
      loanType: '',
      accountNumbers: {},
      issues: [],
      pageNumber: '',
      referredPerson: '',
      telecallerId: prev.telecallerId,
      telecallerName: prev.telecallerName,
    }));
    setCustomFields([]);
    setFiles({
      aadhaarDoc: null,
      panDoc: null,
      accountStatementDoc: null,
      additionalDoc: null,
    });
    setErrors({});
    setShowIssuesDropdown(false);
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

      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      formPayload.append('email', formData.email);
      formPayload.append('aadhaar', formData.aadhaar);
      formPayload.append('pan', formData.pan);
      formPayload.append('cibil', formData.cibil);
      formPayload.append('address', formData.address);
      formPayload.append('problem', formData.problem);

      formData.banks.forEach(bank => formPayload.append('banks', bank));
      formData.otherBanks.forEach(otherBank => formPayload.append('otherBanks', otherBank));

      formPayload.append('loanType', formData.loanType);

      Object.entries(formData.accountNumbers).forEach(([bank, accNo]) => {
        formPayload.append(`accountNumbers[${bank}]`, accNo);
      });

      formData.issues.forEach(issue => formPayload.append('issues', issue));

      formPayload.append('pageNumber', formData.pageNumber || '');
      formPayload.append('referredPerson', formData.referredPerson || '');
      formPayload.append('telecallerId', formData.telecallerId);
      formPayload.append('telecallerName', formData.telecallerName);

      // Handle custom fields files and serialize customFields
      const customFieldsCopy = [];
      customFields.forEach((field, idx) => {
        if (field.type === 'file' && field.value instanceof File) {
          formPayload.append(`customFieldFile_${idx}`, field.value);
          customFieldsCopy.push({ ...field, value: '' });
        } else {
          customFieldsCopy.push(field);
        }
      });
      formPayload.append('customFields', JSON.stringify(customFieldsCopy));

      if (files.aadhaarDoc) formPayload.append('aadhaarDoc', files.aadhaarDoc);
      if (files.panDoc) formPayload.append('panDoc', files.panDoc);
      if (files.accountStatementDoc) formPayload.append('accountStatementDoc', files.accountStatementDoc);
      if (files.additionalDoc) formPayload.append('additionalDoc', files.additionalDoc);

      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();

      if (response.ok) {
        notify?.('Customer added successfully!', 'success');
        resetForm();
        onClose?.();
      } else {
        notify?.(`Error: ${result.error || result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      notify?.('Failed to save customer. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            <button
              type="button"
              className="close-button"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Name and Phone */}
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

            {/* Email and Aadhaar */}
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

            {/* PAN and CIBIL */}
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

            {/* Address */}
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

            {/* Problem Description */}
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

            {/* Banks multi-select */}
            <div className="form-group">
              <label>Banks *</label>
              <div className={`checkbox-group ${errors.banks ? 'error' : ''}`}>
                {bankOptions.map(bank => (
                  <label key={bank} className="checkbox-label">
                    <input
                      type="checkbox"
                      name="banks"
                      value={bank}
                      checked={formData.banks.includes(bank)}
                      onChange={handleChange}
                    />
                    {bank}
                  </label>
                ))}
              </div>
              {errors.banks && <span className="error-text">{errors.banks}</span>}
            </div>

            {/* Other Banks */}
            {formData.banks.includes('Other') && (
              <div className="form-group">
                <label>Specify Other Bank(s) *</label>
                {formData.otherBanks.map((otherBankName, idx) => (
                  <div key={idx} className="other-bank-input-group">
                    <input
                      type="text"
                      name={`otherBank_${idx}`}
                      data-index={idx}
                      className={`form-control ${errors[`otherBank_${idx}`] ? 'error' : ''}`}
                      placeholder="Enter other bank name"
                      value={otherBankName}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name={`accountNumber_${otherBankName || idx}`}
                      data-bank={otherBankName}
                      className={`form-control account-number ${errors[`accountNumber_${otherBankName}`] ? 'error' : ''}`}
                      placeholder="Account Number (9-18 digits)"
                      maxLength="18"
                      value={formData.accountNumbers[otherBankName] || ''}
                      onChange={handleChange}
                    />
                    <button type="button" onClick={() => {
                      const otherBanksCopy = [...formData.otherBanks];
                      otherBanksCopy.splice(idx, 1);
                      const accNos = { ...formData.accountNumbers };
                      delete accNos[otherBankName];

                      setFormData(prev => ({ ...prev, otherBanks: otherBanksCopy, accountNumbers: accNos }));
                    }} className="btn btn-danger btn-sm">Remove</button>
                    {errors[`otherBank_${idx}`] && <span className="error-text">{errors[`otherBank_${idx}`]}</span>}
                    {errors[`accountNumber_${otherBankName}`] && <span className="error-text">{errors[`accountNumber_${otherBankName}`]}</span>}
                  </div>
                ))}
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, otherBanks: [...prev.otherBanks, ''] }))} className="btn btn-secondary btn-sm mt-1">Add Another Other Bank</button>
                {errors.otherBanks && <span className="error-text">{errors.otherBanks}</span>}
              </div>
            )}

            {/* Account Numbers for banks */}
            {formData.banks.filter(b => b !== 'Other').length > 0 && (
              <div className="form-group">
                <label>Account Number(s) *</label>
                {formData.banks.filter(b => b !== 'Other').map(bank => (
                  <div key={bank} className="account-number-input-group">
                    <label>{bank}</label>
                    <input
                      type="text"
                      name={`accountNumber_${bank}`}
                      data-bank={bank}
                      placeholder="Account Number (9-18 digits)"
                      className={`form-control ${errors[`accountNumber_${bank}`] ? 'error' : ''}`}
                      maxLength="18"
                      value={formData.accountNumbers[bank] || ''}
                      onChange={handleChange}
                    />
                    {errors[`accountNumber_${bank}`] && <span className="error-text">{errors[`accountNumber_${bank}`]}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Loan Type */}
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

            {/* Issues */}
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
                  <div className="dropdown-menu" role="listbox">
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

            {/* Custom Fields */}
            <div className="form-group custom-fields-section">
              <label className="form-label">Custom Fields</label>
              {customFields.map((field, idx) => (
                <div key={idx} className="custom-field-row">
                  <input
                    type="text"
                    aria-label={`Custom field label ${idx + 1}`}
                    placeholder="Label"
                    value={field.label}
                    className={`form-control ${errors[`customFieldLabel_${idx}`] ? 'error' : ''}`}
                    onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                  />
                  <select
                    aria-label={`Custom field input type ${idx + 1}`}
                    value={field.type}
                    className="form-control"
                    onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="textarea">Textarea</option>
                    <option value="file">File</option>
                  </select>

                  {field.type === 'file' ? (
                    <>
                      <input
                        type="file"
                        aria-label={`Custom field file input ${idx + 1}`}
                        className="form-control-file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          updateCustomField(idx, 'value', file);
                        }}
                      />
                      {field.value && typeof field.value === 'object' && (
                        <span className="file-name">{field.value.name}</span>
                      )}
                    </>
                  ) : field.type !== 'textarea' ? (
                    <input
                      type={field.type}
                      aria-label={`Custom field value ${idx + 1}`}
                      placeholder="Value"
                      className="form-control"
                      value={field.value}
                      onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                    />
                  ) : (
                    <textarea
                      aria-label={`Custom field value ${idx + 1}`}
                      placeholder="Value"
                      className="form-control"
                      value={field.value}
                      onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                      rows={3}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeCustomField(idx)}
                    className="btn btn-danger btn-sm mt-1"
                    aria-label={`Remove custom field ${idx + 1}`}
                  >
                    Remove
                  </button>
                  {errors[`customFieldLabel_${idx}`] && (
                    <span className="error-text">{errors[`customFieldLabel_${idx}`]}</span>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomField}
                className="btn btn-secondary btn-sm mt-2"
                aria-label="Add custom field"
              >
                Add Field
              </button>
            </div>

            {/* Page No & Referred By */}
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

            {/* File uploads */}
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
              {files.accountStatementDoc && (
                <span className="file-name">{files.accountStatementDoc.name}</span>
              )}
            </div>

            {/* Hidden telecaller inputs */}
            <input type="hidden" name="telecallerId" value={formData.telecallerId} />
            <input type="hidden" name="telecallerName" value={formData.telecallerName} />

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
