import React, { useState, useEffect } from "react";

const EditCustomer = ({
  isOpen,
  onClose,
  prefill = {},
  notify,
  customerId, // ID of the customer to update
}) => {
  const bankOptions = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Other",
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
    "Other",
  ];

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
    telecallerName: "",
  });

  const [customFields, setCustomFields] = useState([]);
  const [files, setFiles] = useState({
    aadhaarDoc: null,
    panDoc: null,
    accountStatementDoc: null,
    additionalDoc: null,
  });
  const [errors, setErrors] = useState({});
  const [showIssuesDropdown, setShowIssuesDropdown] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load customer data when component mounts or customerId changes
  useEffect(() => {
    if (!customerId) {
      setIsLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/customers/${customerId}`
        );
        if (!response.ok) throw new Error("Failed to fetch customer data");
        const data = await response.json();

        // 1. Prepare bankDetails
        const rawBanks = data.banks || [];
        const rawOtherBanks = data.otherBanks || [];
        
        // CIBIL score is stored as cibilBefore on the backend, map it back to the frontend's 'cibil'
        const cibilScore = data.cibilBefore !== undefined ? data.cibilBefore : "";

        // Ensure bankDetails map is structured correctly for editing
        let bankDetails = new Map(Object.entries(data.bankDetails || {}));

        // 2. Check "Other" if there are any dynamically added banks
        const isOtherSelected = rawBanks.includes("Other") || rawOtherBanks.length > 0;
        const finalBanks = isOtherSelected ? [...new Set([...rawBanks, "Other"])] : rawBanks.filter(b => b !== "Other");


        setFormData((prev) => ({
          ...prev,
          ...data,
          banks: finalBanks,
          otherBanks: rawOtherBanks,
          cibil: cibilScore, // Map backend cibilBefore to frontend cibil
          bankDetails: Object.fromEntries(bankDetails), // Convert Map back to Object for state
          telecallerId: data.telecallerId || prev.telecallerId,
          telecallerName: data.telecallerName || prev.telecallerName,
        }));

        setCustomFields(data.customFields || []);
      } catch (error) {
        notify?.("Failed to load customer data", "error");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, notify]);

  // Handler for adding a new 'Other' bank input field
  const addOtherBank = () => {
    // Generate a temporary unique key for the new bank until the user enters a real name
    const tempBankName = `__temp_other_bank_${Date.now()}__`; 
    
    // Ensure 'Other' is checked if adding a new custom bank
    const banks = formData.banks.includes("Other") ? formData.banks : [...formData.banks, "Other"];
    
    setFormData(prev => ({
      ...prev,
      banks,
      otherBanks: [...prev.otherBanks, tempBankName],
      bankDetails: {
          ...prev.bankDetails,
          [tempBankName]: { accountNumber: "", loanType: "", issues: [] }
      }
    }));
  };

  // Handler for removing a dynamically added 'Other' bank
  const removeOtherBank = (bankName) => {
    setFormData(prev => {
        const updatedOtherBanks = prev.otherBanks.filter(b => b !== bankName);
        const updatedBankDetails = { ...prev.bankDetails };
        delete updatedBankDetails[bankName]; // Remove details for this bank
        
        return {
            ...prev,
            otherBanks: updatedOtherBanks,
            bankDetails: updatedBankDetails
        };
    });
  };

  // *** UPDATED HANDLER LOGIC ***
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;

    if (type === "checkbox" && name === "banks") {
      const selectedBanks = checked
        ? [...formData.banks, value]
        : formData.banks.filter((b) => b !== value);

      let updatedBankDetails = { ...formData.bankDetails };
      let updatedOtherBanks = [...formData.otherBanks];

      if (checked) {
        // PREVENT ADDING "Other" TO bankDetails
        if (value !== "Other") {
          updatedBankDetails[value] =
            updatedBankDetails[value] || { accountNumber: "", loanType: "", issues: [] };
        }
      } else {
        delete updatedBankDetails[value];
        
        // If "Other" is unchecked, clear all dynamically added other banks and their details
        if (value === "Other") {
            updatedOtherBanks.forEach(otherBankName => {
                delete updatedBankDetails[otherBankName];
            });
            updatedOtherBanks = [];
        }
      }

      setFormData((prev) => ({
        ...prev,
        banks: selectedBanks,
        otherBanks: updatedOtherBanks,
        bankDetails: updatedBankDetails,
      }));
    } 
    // Handle changing the name of a dynamically added "Other" bank
    else if (name.startsWith("otherBank_")) {
        const idx = Number(dataset.index);
        const prevBankName = formData.otherBanks[idx];
        const otherBanksCopy = [...formData.otherBanks];
        otherBanksCopy[idx] = value; 

        let bankDetailsCopy = { ...formData.bankDetails };
        
        if (prevBankName !== value) {
            const detailsToKeep = bankDetailsCopy[prevBankName] || { accountNumber: "", loanType: "", issues: [] };
            delete bankDetailsCopy[prevBankName];
            bankDetailsCopy[value] = detailsToKeep;
        }

        setFormData(prev => ({
            ...prev,
            otherBanks: otherBanksCopy,
            bankDetails: bankDetailsCopy
        }));
    } 
    // Handlers for bank details (accountNumber, loanType, issues) - use data-bank attribute (UNCHANGED)
    else if (name.startsWith("accountNumber_")) {
      const bank = dataset.bank;
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            accountNumber: value,
          },
        },
      }));
    } else if (name.startsWith("loanType_")) {
      const bank = dataset.bank;
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            loanType: value,
          },
        },
      }));
    } else if (type === "checkbox" && name.startsWith("issues_")) {
      const bank = dataset.bank;
      const issue = value;
      const issues = formData.bankDetails[bank]?.issues || [];
      const updatedIssues = checked
        ? [...issues, issue]
        : issues.filter((i) => i !== issue);

      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bank]: {
            ...prev.bankDetails[bank],
            issues: updatedIssues,
          },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ... (rest of helper functions remain unchanged)

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { label: "", type: "text", value: "" }]);
  };

  const updateCustomField = (index, field, val) => {
    const updated = [...customFields];

    if (field === "value" && updated[index].type === "file") {
      updated[index][field] = val;
    } else {
      updated[index][field] = val;
    }

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
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const toggleIssuesDropdown = (bank) => {
    setShowIssuesDropdown((prev) => ({
      ...prev,
      [bank]: !prev[bank],
    }));
  };

  // Validation logic (UNCHANGED)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.problem.trim()) newErrors.problem = "Problem description is required";
    
    // Banks validation logic
    const hasStandardBanks = formData.banks.filter(b => b !== "Other").length > 0;
    const hasOtherBanks = formData.otherBanks.filter(b => b && !b.startsWith("__temp_other_bank_")).length > 0;
    
    if (!hasStandardBanks && !hasOtherBanks) {
      newErrors.banks = "At least one bank (standard or custom) must be specified";
    }

    const allBanks = formData.banks.filter(b => b !== "Other").concat(formData.otherBanks);
    
    allBanks.forEach((bank, idx) => {
      const details = formData.bankDetails[bank] || {};
      
      // Validation for dynamically added bank names
      // NOTE: We rely on array index for error message placement here, which is risky
      if (formData.otherBanks.includes(bank)) {
          if (!bank || bank.startsWith("__temp_other_bank_")) {
              newErrors[`otherBank_name_${idx}`] = "Specify a valid bank name";
          }
      }

      if (!details.accountNumber || !/^\d{9,18}$/.test(details.accountNumber)) {
        newErrors[`accountNumber_${bank}`] = `Valid account number required for ${bank}`;
      }
      if (!details.loanType) {
        newErrors[`loanType_${bank}`] = `Loan type required for ${bank}`;
      }
      if (!details.issues || details.issues.length === 0) {
        newErrors[`issues_${bank}`] = `At least one issue required for ${bank}`;
      }
    });

    customFields.forEach((field, idx) => {
      if (!field.label.trim()) newErrors[`customFieldLabel_${idx}`] = "Custom field label is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // Resetting form data is less critical for an Edit modal, but useful for cleanup
    // We retain the logic to reset files and errors.
    setCustomFields([]);
    setFiles({
      aadhaarDoc: null,
      panDoc: null,
      accountStatementDoc: null,
      additionalDoc: null,
    });
    setErrors({});
    setShowIssuesDropdown({});
    // Typically, you'd trigger fetchCustomer again or close the modal instead of full reset
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

      // Append standard fields
      Object.entries(formData)
        .filter(([k]) => k !== "bankDetails" && k !== "banks" && k !== "otherBanks")
        .forEach(([key, value]) => {
          formPayload.append(key, value);
        });

      // Filter out 'Other' before sending the bank list
      formData.banks.filter(b => b !== "Other").forEach((bank) => formPayload.append("banks", bank));
      
      // Append only valid, non-temp other banks
      formData.otherBanks.filter(b => b && !b.startsWith("__temp_other_bank_")).forEach((otherBank) => formPayload.append("otherBanks", otherBank));

      formPayload.append("bankDetails", JSON.stringify(formData.bankDetails || {}));
      formPayload.append("customFields", JSON.stringify(customFields || []));

      // Append files
      customFields.forEach((field, idx) => {
        if (field.type === "file" && field.value instanceof File) {
          formPayload.append(`customFieldFile_${idx}`, field.value);
        }
      });

      if (files.aadhaarDoc) formPayload.append("aadhaarDoc", files.aadhaarDoc);
      if (files.panDoc) formPayload.append("panDoc", files.panDoc);
      if (files.accountStatementDoc) formPayload.append("accountStatementDoc", files.accountStatementDoc);
      if (files.additionalDoc) formPayload.append("additionalDoc", files.additionalDoc);

      const response = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          method: "PUT", // Use PUT for updating
          body: formPayload,
        }
      );

      const result = await response.json();

      if (response.ok) {
        notify?.("Customer updated successfully! 🎉", "success");
        onClose?.();
      } else {
        console.error("Backend error:", result);
        notify?.(`Error: ${result.message || result.error || "Unknown error"}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      notify?.("Failed to update customer. Please try again. 😟", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center font-semibold text-green-600">
          Loading customer data...
        </div>
      </div>
    );

  // Combine all banks for iteration in the details section, filtering out 'Other'
  const allSelectedBanks = formData.banks
    .filter(bank => bank !== "Other")
    .concat(formData.otherBanks)
    .filter(Boolean); // Filter out any empty names

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Edit Customer ({customerId})</h2>
              {formData.telecallerName && (
                <div className="text-green-100 text-sm mt-1">
                  Logged in as: {formData.telecallerName} (ID: {formData.telecallerId})
                </div>
              )}
            </div>
            <button
              type="button"
              className="text-white hover:bg-green-700 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
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
            
            {/* Personal Information Section (UNCHANGED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
              </div>
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="text-red-500 text-sm mt-1">{errors.phone}</span>}
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., rajesh@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
              </div>
              {/* Aadhaar */}
              <div>
                <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  id="aadhaar"
                  name="aadhaar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 1234 5678 9012"
                  value={formData.aadhaar}
                  onChange={handleChange}
                />
              </div>
              {/* PAN */}
              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  id="pan"
                  name="pan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </div>
              {/* CIBIL */}
              <div>
                <label htmlFor="cibil" className="block text-sm font-medium text-gray-700 mb-1">CIBIL Score</label>
                <input
                  type="number"
                  id="cibil"
                  name="cibil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 750"
                  min="300"
                  max="900"
                  value={formData.cibil}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Address & Problem (UNCHANGED) */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="address"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter complete address with city and pincode"
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
              <textarea
                id="problem"
                name="problem"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.problem ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe the issue the customer is facing"
                rows="3"
                value={formData.problem}
                onChange={handleChange}
              ></textarea>
              {errors.problem && <span className="text-red-500 text-sm mt-1">{errors.problem}</span>}
            </div>

            {/* Banks Selection (UNCHANGED) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banks *</label>
              <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-lg ${errors.banks ? 'border-red-500' : 'border-gray-300'}`}>
                {bankOptions.map(bank => (
                  <label key={bank} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="banks"
                      value={bank}
                      checked={formData.banks.includes(bank)}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{bank}</span>
                  </label>
                ))}
              </div>
              {errors.banks && <span className="text-red-500 text-sm mt-1">{errors.banks}</span>}
            </div>

            {/* Other Banks INPUT Section (CLEANED UP JSX) */}
            {formData.banks.includes("Other") && (
              <div className="border border-gray-300 rounded-lg p-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Specify Other Banks</h3>
                
                {formData.otherBanks.map((otherBankName, idx) => (
                    <div key={otherBankName} className="flex items-end space-x-2">
                        <div className="flex-1">
                            <label htmlFor={`otherBank_${idx}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                name={`otherBank_${idx}`}
                                data-index={idx}
                                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                  errors[`otherBank_name_${idx}`] ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Enter other bank name"
                                value={
                                    // Display empty string if it's a temp name, otherwise display the current name
                                    otherBankName.startsWith("__temp_other_bank_") ? "" : otherBankName
                                }
                                onChange={handleChange}
                            />
                            {/* NOTE: Error display relies on the 'otherBank_name_' key generated in validateForm */}
                            {errors[`otherBank_name_${idx}`] && (
                                <span className="text-red-500 text-sm mt-1">{errors[`otherBank_name_${idx}`]}</span>
                            )}
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => removeOtherBank(otherBankName)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors h-10"
                        >
                            Remove
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addOtherBank}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Add Another Bank
                </button>
              </div>
            )}

            {/* Bank Details (Uses allSelectedBanks, which is correct) */}
            {allSelectedBanks.map(bank => (
              <div key={bank} className="border border-gray-300 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">{bank}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      name={`accountNumber_${bank}`}
                      data-bank={bank}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[`accountNumber_${bank}`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Account Number (9-18 digits)"
                      maxLength="18"
                      value={formData.bankDetails[bank]?.accountNumber || ""}
                      onChange={handleChange}
                    />
                    {errors[`accountNumber_${bank}`] && (<span className="text-red-500 text-sm mt-1">{errors[`accountNumber_${bank}`]}</span>)}
                  </div>
                  {/* Loan Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type *</label>
                    <select
                      name={`loanType_${bank}`}
                      data-bank={bank}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[`loanType_${bank}`] ? 'border-red-500' : 'border-gray-300'}`}
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
                    {errors[`loanType_${bank}`] && (<span className="text-red-500 text-sm mt-1">{errors[`loanType_${bank}`]}</span>)}
                  </div>
                  {/* Issues */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issues *</label>
                    <button
                      type="button"
                      className={`w-full px-3 py-2 border rounded-lg text-left flex justify-between items-center ${errors[`issues_${bank}`] ? 'border-red-500' : 'border-gray-300'}`}
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
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">{issue}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {errors[`issues_${bank}`] && (<span className="text-red-500 text-sm mt-1">{errors[`issues_${bank}`]}</span>)}
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Fields (UNCHANGED) */}
            <div className="border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Custom Fields</label>
              {customFields.map((field, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-3 items-end">
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      placeholder="Label"
                      value={field.label}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors[`customFieldLabel_${idx}`] ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={(e) => updateCustomField(idx, "label", e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <select
                      value={field.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => updateCustomField(idx, "type", e.target.value)}
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
                    {field.type === "file" ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { updateCustomField(idx, "value", file); }
                          }}
                        />
                        {field.value && (<span className="text-sm text-gray-600 truncate">{field.value.name || field.value}</span>)}
                      </div>
                    ) : field.type !== "textarea" ? (
                      <input
                        type={field.type}
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={field.value}
                        onChange={(e) => updateCustomField(idx, "value", e.target.value)}
                      />
                    ) : (
                      <textarea
                        placeholder="Value"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={field.value}
                        onChange={(e) => updateCustomField(idx, "value", e.target.value)}
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

            {/* Page Number & Referred By (UNCHANGED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pageNumber" className="block text-sm font-medium text-gray-700 mb-1">Page Number</label>
                <input
                  id="pageNumber"
                  name="pageNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g., 3"
                  value={formData.pageNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="referredPerson" className="block text-sm font-medium text-gray-700 mb-1">Referred By</label>
                <input
                  id="referredPerson"
                  name="referredPerson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Type referral name"
                  value={formData.referredPerson}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* File Uploads (UNCHANGED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aadhaar */}
              <div>
                <label htmlFor="aadhaarDoc" className="block text-sm font-medium text-gray-700 mb-1">Upload Aadhaar (PDF/Image)</label>
                <input
                  type="file"
                  id="aadhaarDoc"
                  name="aadhaarDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {files.aadhaarDoc && (<span className="text-sm text-green-600 mt-1">{files.aadhaarDoc.name}</span>)}
              </div>
              {/* PAN */}
              <div>
                <label htmlFor="panDoc" className="block text-sm font-medium text-gray-700 mb-1">Upload PAN (PDF/Image)</label>
                <input
                  type="file"
                  id="panDoc"
                  name="panDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {files.panDoc && (<span className="text-sm text-green-600 mt-1">{files.panDoc.name}</span>)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Statement */}
              <div>
                <label htmlFor="accountStatementDoc" className="block text-sm font-medium text-gray-700 mb-1">Upload Account Statement (PDF/Image)</label>
                <input
                  type="file"
                  id="accountStatementDoc"
                  name="accountStatementDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {files.accountStatementDoc && (<span className="text-sm text-green-600 mt-1">{files.accountStatementDoc.name}</span>)}
              </div>
              {/* Additional Doc */}
              <div>
                <label htmlFor="additionalDoc" className="block text-sm font-medium text-gray-700 mb-1">Upload Additional Document (Optional)</label>
                <input
                  type="file"
                  id="additionalDoc"
                  name="additionalDoc"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {files.additionalDoc && (<span className="text-sm text-green-600 mt-1">{files.additionalDoc.name}</span>)}
              </div>
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {isSubmitting ? "Updating..." : "Update Customer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;