import React, { useState, useEffect } from "react";

// Everything else (bankOptions, issuesOptions) stays the same

const AddCustomer = ({
  isOpen,
  onClose,
  prefill = {},
  notify
}) => {
  const bankOptions = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Other"
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

  // State declarations remain the same
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaar: "",
    pan: "",
    cibil: "",
    address: "",
    problem: "",
    banks: [],
    otherBanks: [],
    bankDetails: {},
    pageNumber: "",
    referredPerson: "",
    telecallerId: "",
    telecallerName: ""
  });

  const [customFields, setCustomFields] = useState([]);
  const [files, setFiles] = useState({
    aadhaarDoc: null,
    panDoc: null,
    accountStatementDoc: null,
    additionalDoc: null
  });
  const [errors, setErrors] = useState({});
  const [showIssuesDropdown, setShowIssuesDropdown] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill logic (unchanged)
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    let telecallerId = "";
    let telecallerName = "";

    if (userData) {
      try {
        const user = JSON.parse(userData);
        telecallerId = user.id || "";
        telecallerName = user.username || "";
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    let banks = prefill.banks || [];
    let otherBanks = prefill.otherBanks || [];
    let bankDetails = {};

    if (prefill.bankDetails) {
      bankDetails = prefill.bankDetails;
    } else {
      banks.concat(otherBanks).forEach(bank => {
        bankDetails[bank] = { accountNumber: "", loanType: "", issues: [] };
      });
    }

    setFormData(prev => ({
      ...prev,
      telecallerId,
      telecallerName,
      ...prefill,
      banks,
      otherBanks,
      bankDetails
    }));

    setCustomFields(prefill.customFields || []);
  }, [prefill]);

  // All handler functions remain exactly the same
  const handleChange = e => {
    const { name, value, type, checked, dataset } = e.target;

    if (type === "checkbox" && name === "banks") {
      const selectedBanks = checked
        ? [...formData.banks, value]
        : formData.banks.filter(b => b !== value);

      let updatedBankDetails = { ...formData.bankDetails };
      if (checked) {
        updatedBankDetails[value] = updatedBankDetails[value] || { accountNumber: "", loanType: "", issues: [] };
      } else {
        delete updatedBankDetails[value];
      }

      let updatedOtherBanks = [...formData.otherBanks];
      if (!checked && value === "Other") updatedOtherBanks = [];

      setFormData(prev => ({
        ...prev,
        banks: selectedBanks,
        otherBanks: updatedOtherBanks,
        bankDetails: updatedBankDetails
      }));
    }
    else if (name.startsWith("otherBank_")) {
      const idx = Number(dataset.index);
      const otherBanksCopy = [...formData.otherBanks];
      otherBanksCopy[idx] = value;

      let bankDetailsCopy = { ...formData.bankDetails };
      const prevBankName = bankDetailsCopy[formData.otherBanks[idx]];
      delete bankDetailsCopy[formData.otherBanks[idx]];

      bankDetailsCopy[value] = prevBankName || { accountNumber: "", loanType: "", issues: [] };

      setFormData(prev => ({
        ...prev,
        otherBanks: otherBanksCopy,
        bankDetails: bankDetailsCopy
      }));
    }
    else if (name.startsWith("accountNumber_")) {
      const bank = dataset.bank;
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            accountNumber: value
          }
        }
      }));
    }
    else if (name.startsWith("loanType_")) {
      const bank = dataset.bank;
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            loanType: value
          }
        }
      }));
    }
    else if (type === "checkbox" && name.startsWith("issues_")) {
      const bank = dataset.bank;
      const issue = value;
      const issues = formData.bankDetails[bank]?.issues || [];
      const updatedIssues = checked
        ? [...issues, issue]
        : issues.filter(i => i !== issue);

      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            issues: updatedIssues
          }
        }
      }));
    }
    else if (name === "otherBanksAdd") {
      setFormData(prev => ({
        ...prev,
        otherBanks: [...prev.otherBanks, ""]
      }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { label: "", type: "text", value: "" }]);
  };

  const updateCustomField = (index, field, val) => {
    const updated = [...customFields];
    
    if (field === 'value' && updated[index].type === 'file') {
      updated[index][field] = val;
    } else {
      updated[index][field] = val;
    }
    
    setCustomFields(updated);
  };

  const removeCustomField = index => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

  const handleFileChange = e => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const toggleIssuesDropdown = bank => {
    setShowIssuesDropdown(prev => ({
      ...prev,
      [bank]: !prev[bank]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.problem.trim()) newErrors.problem = "Problem description is required";
    if (!formData.banks.length) newErrors.banks = "At least one bank must be selected";
    if (!formData.telecallerId.trim()) newErrors.telecallerId = "Telecaller information is missing";
    if (!formData.telecallerName.trim()) newErrors.telecallerName = "Telecaller information is missing";

    const allBanks = formData.banks.concat(formData.otherBanks);
    allBanks.forEach((bank, idx) => {
      const details = formData.bankDetails[bank] || {};
      if (!details.accountNumber || !/^\d{9,18}$/.test(details.accountNumber)) {
        newErrors[`accountNumber_${bank}`] = `Valid account number required for ${bank}`;
      }
      if (!details.loanType) {
        newErrors[`loanType_${bank}`] = `Loan type required for ${bank}`;
      }
      if (!details.issues || details.issues.length === 0) {
        newErrors[`issues_${bank}`] = `At least one issue required for ${bank}`;
      }
      if (bank === "" || (formData.banks.includes("Other") && (!bank || !bank.trim()))) {
        newErrors[`otherBank_${idx}`] = "Specify other bank name";
      }
    });

    customFields.forEach((field, idx) => {
      if (!field.label.trim()) newErrors[`customFieldLabel_${idx}`] = "Custom field label is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(prev => ({
      name: "",
      phone: "",
      email: "",
      aadhaar: "",
      pan: "",
      cibil: "",
      address: "",
      problem: "",
      banks: [],
      otherBanks: [],
      bankDetails: {},
      pageNumber: "",
      referredPerson: "",
      telecallerId: prev.telecallerId,
      telecallerName: prev.telecallerName
    }));
    setCustomFields([]);
    setFiles({
      aadhaarDoc: null,
      panDoc: null,
      accountStatementDoc: null,
      additionalDoc: null
    });
    setErrors({});
    setShowIssuesDropdown({});
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

      Object.entries(formData)
        .filter(([k]) => k !== "bankDetails" && k !== "banks" && k !== "otherBanks")
        .forEach(([key, value]) => {
          formPayload.append(key, value);
        });

      formData.banks.forEach(bank => formPayload.append("banks", bank));
      formData.otherBanks.forEach(otherBank => formPayload.append("otherBanks", otherBank));

      formPayload.append("bankDetails", JSON.stringify(formData.bankDetails || {}));
      formPayload.append("customFields", JSON.stringify(customFields || []));

      customFields.forEach((field, idx) => {
        if (field.type === "file" && field.value instanceof File) {
          formPayload.append(`customFieldFile_${idx}`, field.value);
        }
      });

      if (files.aadhaarDoc) formPayload.append("aadhaarDoc", files.aadhaarDoc);
      if (files.panDoc) formPayload.append("panDoc", files.panDoc);
      if (files.accountStatementDoc) formPayload.append("accountStatementDoc", files.accountStatementDoc);
      if (files.additionalDoc) formPayload.append("additionalDoc", files.additionalDoc);

      const response = await fetch("http://localhost:5000/api/customers", {
        method: "POST",
        body: formPayload,
      });

      const result = await response.json();

      if (response.ok) {
        notify?.("Customer added successfully!", "success");
        resetForm();
        onClose?.();
      } else {
        console.error("Backend error:", result);
        notify?.(`Error: ${result.message || result.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      notify?.("Failed to save customer. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Add New Customer</h2>
              {formData.telecallerName && (
                <div className="text-blue-100 text-sm mt-1">
                  Logged in as: {formData.telecallerName} (ID: {formData.telecallerId})
                </div>
              )}
            </div>
            <button
              type="button"
              className="text-white hover:bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., rajesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
              </div>

              {/* Aadhaar */}
              <div>
                <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  id="aadhaar"
                  name="aadhaar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1234 5678 9012"
                  value={formData.aadhaar}
                  onChange={handleChange}
                />
              </div>

              {/* PAN */}
              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  id="pan"
                  name="pan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </div>

              {/* CIBIL */}
              <div>
                <label htmlFor="cibil" className="block text-sm font-medium text-gray-700 mb-1">
                  CIBIL Score
                </label>
                <input
                  type="number"
                  id="cibil"
                  name="cibil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 750"
                  min="300"
                  max="900"
                  value={formData.cibil}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete address with city and pincode"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Problem Description */}
            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description *
              </label>
              <textarea
                id="problem"
                name="problem"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.problem ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the issue the customer is facing"
                rows="3"
                value={formData.problem}
                onChange={handleChange}
              ></textarea>
              {errors.problem && <span className="text-red-500 text-sm mt-1">{errors.problem}</span>}
            </div>

            {/* Banks Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banks *
              </label>
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-lg ${
                errors.banks ? 'border-red-500' : 'border-gray-300'
              }`}>
                {bankOptions.map(bank => (
                  <label key={bank} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="banks"
                      value={bank}
                      checked={formData.banks.includes(bank)}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{bank}</span>
                  </label>
                ))}
              </div>
              {errors.banks && <span className="text-red-500 text-sm mt-1">{errors.banks}</span>}
            </div>

            {/* Other Banks */}
            {formData.banks.includes("Other") && (
              <div className="border border-gray-300 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Other Bank(s) *
                </label>
                {formData.otherBanks.map((otherBankName, idx) => (
                  <div key={idx} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      name={`otherBank_${idx}`}
                      data-index={idx}
                      className={`flex-1 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`otherBank_${idx}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter other bank name"
                      value={otherBankName}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const otherBanksCopy = [...formData.otherBanks];
                        const bankName = otherBanksCopy[idx];
                        otherBanksCopy.splice(idx, 1);

                        const bankDetailsCopy = { ...formData.bankDetails };
                        delete bankDetailsCopy[bankName];

                        setFormData(prev => ({
                          ...prev,
                          otherBanks: otherBanksCopy,
                          bankDetails: bankDetailsCopy
                        }));
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  name="otherBanksAdd"
                  onClick={handleChange}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add Another Other Bank
                </button>
              </div>
            )}

            {/* Bank Details */}
            {formData.banks.concat(formData.otherBanks).filter(Boolean).map(bank => (
              <div key={bank} className="border border-gray-300 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">{bank}</h4>
                
                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name={`accountNumber_${bank}`}
                    data-bank={bank}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`accountNumber_${bank}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Account Number (9-18 digits)"
                    maxLength="18"
                    value={formData.bankDetails[bank]?.accountNumber || ""}
                    onChange={handleChange}
                  />
                  {errors[`accountNumber_${bank}`] && (
                    <span className="text-red-500 text-sm mt-1">{errors[`accountNumber_${bank}`]}</span>
                  )}
                </div>

                {/* Loan Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loan Type *
                  </label>
                  <select
                    name={`loanType_${bank}`}
                    data-bank={bank}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`loanType_${bank}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.bankDetails[bank]?.loanType || ""}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select loan type</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Business Loan">Business Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Gold Loan">Gold Loan</option>
                    <option value="Loan Against Property (LAP)">Loan Against Property (LAP)</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  {errors[`loanType_${bank}`] && (
                    <span className="text-red-500 text-sm mt-1">{errors[`loanType_${bank}`]}</span>
                  )}
                </div>

                {/* Issues */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issues *
                  </label>
                  <button
                    type="button"
                    className={`w-full px-3 py-2 border rounded-lg text-left flex justify-between items-center ${
                      errors[`issues_${bank}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onClick={() => toggleIssuesDropdown(bank)}
                  >
                    <span>
                      {formData.bankDetails[bank]?.issues?.length > 0
                        ? `${formData.bankDetails[bank].issues.length} issue(s) selected`
                        : "Select issues faced by customer"}
                    </span>
                    <span>▼</span>
                  </button>
                  
                  {showIssuesDropdown[bank] && (
                    <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white shadow-lg z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {issuesOptions.map(issue => (
                          <label key={issue} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              name={`issues_${bank}`}
                              data-bank={bank}
                              value={issue}
                              checked={formData.bankDetails[bank]?.issues.includes(issue)}
                              onChange={handleChange}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{issue}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors[`issues_${bank}`] && (
                    <span className="text-red-500 text-sm mt-1">{errors[`issues_${bank}`]}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Custom Fields */}
            <div className="border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Custom Fields
              </label>
              {customFields.map((field, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3 items-end">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="Label"
                      value={field.label}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`customFieldLabel_${idx}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onChange={(e) => updateCustomField(idx, 'label', e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <select
                      value={field.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => updateCustomField(idx, 'type', e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                      <option value="file">File</option>
                    </select>
                  </div>

                  <div className="md:col-span-6">
                    {field.type === 'file' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              updateCustomField(idx, 'value', file);
                            }
                          }}
                        />
                        {field.value && (
                          <span className="text-sm text-gray-600 truncate">
                            {field.value.name || field.value}
                          </span>
                        )}
                      </div>
                    ) : field.type !== 'textarea' ? (
                      <input
                        type={field.type}
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field.value}
                        onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                      />
                    ) : (
                      <textarea
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={field.value}
                        onChange={(e) => updateCustomField(idx, 'value', e.target.value)}
                        rows={3}
                      />
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeCustomField(idx)}
                      className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCustomField}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Add Field
              </button>
            </div>

            {/* Page Number & Referred By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pageNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Page Number
                </label>
                <input
                  id="pageNumber"
                  name="pageNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g., 3"
                  value={formData.pageNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="referredPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Referred By
                </label>
                <input
                  id="referredPerson"
                  name="referredPerson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type referral name"
                  value={formData.referredPerson}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="aadhaarDoc" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Aadhaar (PDF/Image)
                </label>
                <input
                  type="file"
                  id="aadhaarDoc"
                  name="aadhaarDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.aadhaarDoc && (
                  <span className="text-sm text-green-600 mt-1">{files.aadhaarDoc.name}</span>
                )}
              </div>
              
              <div>
                <label htmlFor="panDoc" className="block text-sm font-medium text-gray-700 mb-1">
                  Upload PAN (PDF/Image)
                </label>
                <input
                  type="file"
                  id="panDoc"
                  name="panDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {files.panDoc && (
                  <span className="text-sm text-green-600 mt-1">{files.panDoc.name}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="accountStatementDoc" className="block text-sm font-medium text-gray-700 mb-1">
                Upload Account Statement (PDF/Image)
              </label>
              <input
                type="file"
                id="accountStatementDoc"
                name="accountStatementDoc"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {files.accountStatementDoc && (
                <span className="text-sm text-green-600 mt-1">{files.accountStatementDoc.name}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 mr-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;