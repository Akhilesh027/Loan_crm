import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import AddCustomer from "./AddCustomer";
import EditCustomer from "./EditCustomer";
import { FaUserPlus, FaWhatsapp, FaEye, FaEdit, FaPhone, FaTimes, FaSearch, FaSyncAlt, FaFilter, FaUser, FaMobileAlt, FaInfoCircle, FaCalendar, FaMapMarkerAlt, FaSave, FaUndo, FaUserTie } from "react-icons/fa";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`bg-white rounded-xl p-4 sm:p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 ease-in-out animate-slideUp`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Reusable Input Components
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = false, min, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-sm sm:text-base ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, required = false, rows = 3, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      disabled={disabled}
      className={`w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white resize-vertical text-sm sm:text-base ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
      }`}
    />
  </div>
);

// Detail Item Component for View Modal
const DetailItem = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start space-x-3 p-3 bg-gray-50 rounded-lg ${className}`}>
    <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value || "-"}</p>
    </div>
  </div>
);

// Helper to check if a date is today
const isToday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch (e) {
      console.error("Invalid date string for isToday:", dateString);
      return false;
    }
};

const Followups = () => {
  const { addCallLog } = useOutletContext();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All Leads"); 
  const [callingCustomer, setCallingCustomer] = useState(null);
  const [notification, setNotification] = useState(null);

  // Add Lead Modal states
  const [addLeadModal, setAddLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    issueType: "",
    village: "",
    status: "Pending",
  });

  // Call Feedback states
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [responseText, setResponseText] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  // Customer modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerPrefill, setCustomerPrefill] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  
  // States for customer data fetch/viewing
  const [viewingCustomerData, setViewingCustomerData] = useState(null); 
  const [isCustomerDataLoading, setIsCustomerDataLoading] = useState(false); 

  // Status colors for badges
  const statusColors = {
    Success: "bg-green-100 text-green-800 border border-green-300",
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    Rejected: "bg-red-100 text-red-800 border border-red-300",
    "Call Back": "bg-blue-100 text-blue-800 border border-blue-300",
    "Converted": "bg-purple-100 text-purple-800 border border-purple-300",
    "Not Connected": "bg-gray-100 text-gray-800 border border-gray-300",
    "Not Responded": "bg-red-50 text-red-700 border border-red-200",
    "Assigned": "bg-indigo-100 text-indigo-800 border border-indigo-300", 
  };

  // Fetch followups
  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/followups`);
        if (!response.ok) throw new Error("Failed to fetch followups");
        const data = await response.json();
        setFollowups(data);
      } catch (error) {
        console.error("Error fetching followups:", error);
        notify("Error loading followups", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, [notification]);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMessage = (phone) =>
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank");

  // Filtering logic
  const filteredFollowups = followups.filter((f) => {
    const matchesSearch = 
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone?.includes(searchTerm) ||
      f.issueType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.village?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || f.status === filterStatus;
    
    let matchesCategory = true;
    switch (filterCategory) {
      case "Today's Follow-ups":
        const loggedToday = f.createdAt ? isToday(f.createdAt) : false; 
        const scheduledCallbackToday = f.callbackTime ? isToday(f.callbackTime) : false;
        matchesCategory = ((loggedToday && (f.status === "Pending" || f.status === "Call Back")) || scheduledCallbackToday) && f.status !== "Rejected" && f.status !== "Converted";
        break;
      case "Call Back":
        matchesCategory = f.status === "Call Back";
        break;
      case "Pending":
        matchesCategory = f.status === "Pending";
        break;
      case "All Leads":
      default:
        matchesCategory = true;
        break;
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const initiateCall = (customer) => {
    window.open(`tel:${customer.phone}`, "_self");
    setCallingCustomer(customer);
    setCallInProgress(true);
    notify(`Calling ${customer.name} at ${customer.phone}...`);
    setTimeout(() => {
      setCallInProgress(false);
      notify("Call completed. Please provide feedback.", "success");
    }, 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      setFollowups((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: newStatus } : f))
      );
      setEditingStatus(null);
      notify("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      notify("Error updating status", "error");
    }
  };

  const handleCallSave = async () => {
    if (!callStatus) {
      notify("Please select call status.", "error");
      return;
    }
    if (callStatus === "Call Back" && !callbackTime.trim()) {
      notify("Please enter callback time.", "error");
      return;
    }

    try {
      // 1. Update the Followup (Lead)
      const updatedFollowup = {
          response: responseText,
          status: callStatus,
          callbackTime: callStatus === "Call Back" ? callbackTime : "",
      };
      
      const updateResponse = await fetch(
        `${API_BASE_URL}/followups/${callingCustomer._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFollowup),
        }
      );
      if (!updateResponse.ok) throw new Error("Failed to update followup");

      setFollowups((prev) =>
        prev.map((f) =>
          f._id === callingCustomer._id ? { ...f, ...updatedFollowup } : f
        )
      );

      // 2. Log the Call
      const callTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const callLogResponse = await fetch(`${API_BASE_URL}/calllogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time: callTime,
          customer: callingCustomer.name,
          phone: callingCustomer.phone,
          duration: callDuration,
          status: callStatus,
          response: responseText,
          callbackTime: callStatus === "Call Back" ? callbackTime : "",
        }),
      });
      if (!callLogResponse.ok) console.error("Failed to save call log silently");

      // Open AddCustomer modal if status is Success
      if (callStatus === "Success") {
        handleConvertToCustomer(callingCustomer);
      }

      // Reset Call Feedback states
      setCallStatus("");
      setCallDuration("");
      setResponseText("");
      setCallbackTime("");
      setCallingCustomer(null);
      notify("Call info saved successfully!");
    } catch (error) {
      console.error("Error saving call:", error);
      notify("Error saving call information", "error");
    }
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.phone) {
      notify("Name and phone are required.", "error");
      return;
    }
    try {
      const lead = {
        ...newLead,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: new Date().toISOString(),
        response: "",
      };
      const response = await fetch(`${API_BASE_URL}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!response.ok) throw new Error("Failed to add lead");
      const savedLead = await response.json();
      setFollowups((prev) => [savedLead, ...prev]);
      setNewLead({
        name: "",
        phone: "",
        issueType: "",
        village: "",
        status: "Pending",
      });
      setAddLeadModal(false);
      notify("New lead added successfully!");
    } catch (error) {
      console.error("Error adding lead:", error);
      notify("Error adding new lead", "error");
    }
  };

  // Handle edit lead details
  const handleEditLead = (followup) => {
    // Prevent editing if assigned
    if (followup.assignedToName) {
        notify(`Cannot edit: Lead is already assigned to ${followup.assignedToName}.`, 'error');
        return;
    }
    setEditingLead({ ...followup });
  };

  const handleSaveEditLead = async () => {
    if (!editingLead.name || !editingLead.phone) {
      notify("Name and phone are required.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/followups/${editingLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingLead),
      });

      if (!response.ok) throw new Error("Failed to update lead");

      setFollowups(prev => 
        prev.map(f => f._id === editingLead._id ? editingLead : f)
      );
      setEditingLead(null);
      notify("Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      notify("Error updating lead", "error");
    }
  };

  // handleViewLead now checks for customer conversion
  const handleViewLead = async (followup) => {
    setViewingLead(followup);
    setViewingCustomerData(null);
    setIsCustomerDataLoading(false);

    // Check if the lead is a candidate for conversion display
    if (followup.status === "Success" || followup.status === "Converted") {
      try {
        setIsCustomerDataLoading(true);
        const res = await fetch(`${API_BASE_URL}/customers/byLead/${followup._id}`); 
        
        if (res.ok) {
          const customerData = await res.json();
          setViewingCustomerData(customerData);
          notify(`Linked Customer details found! Case ID: ${customerData.caseId}`, 'success');
        } else {
          notify('Lead marked successful, but could not retrieve linked customer data.', 'error');
        }
      } catch (error) {
        console.error("Fetch customer error:", error);
        notify('Error retrieving linked customer data.', 'error');
      } finally {
        setIsCustomerDataLoading(false);
      }
    }
  };

  /**
   * Handles the click of the Edit button within the View Modal.
   * Redirects flow to Edit Lead or Edit Customer based on data availability.
   */
  const handleEditFromView = () => {
    // 1. Check for assignment status before proceeding to edit lead
    if (viewingLead && !viewingCustomerData && viewingLead.assignedToName) {
        notify(`Cannot edit: Lead is already assigned to ${viewingLead.assignedToName}.`, 'error');
        setViewingLead(null);
        return;
    }
      
    // 2. Proceed with edit flow
    if (viewingCustomerData) {
        // Case 1: Editing Customer
        setViewingLead(null);
        
        setCustomerPrefill({
            ...viewingCustomerData,
            leadId: viewingLead._id, 
            isEditing: true,
        });
        setShowCustomerModal(true);
        notify(`Opening Edit Customer Mode for Case ${viewingCustomerData.caseId}.`, 'info');

    } else if (viewingLead) {
        // Case 2: Editing Lead (passed assignment check)
        setViewingLead(null);
        handleEditLead(viewingLead);
        notify(`Opening Edit Lead Mode for ${viewingLead.name}.`, 'info');
    }
  };

  // Check for existing customer record before opening the Add/Edit modal
  const handleConvertToCustomer = async (followup) => {
    
    // 1. Check if a Customer record already exists for this Lead ID
    try {
        setIsCustomerDataLoading(true);
        const res = await fetch(`${API_BASE_URL}/customers/byLead/${followup._id}`); 
        
        if (res.ok) {
            // CUSTOMER EXISTS: Open Edit Modal
            const existingCustomer = await res.json();
            
            setCustomerPrefill({
                ...existingCustomer,
                leadId: followup._id,
                isEditing: true,
            });
            setShowCustomerModal(true);
            notify(`Customer ${existingCustomer.name} already exists. Opening Edit Mode.`, 'info');
        } else {
            // CUSTOMER DOES NOT EXIST: Open Add Modal
            setCustomerPrefill({
                name: followup.name,
                phone: followup.phone,
                issueType: followup.issueType || "",
                village: followup.village || "",
                leadId: followup._id,
                isEditing: false,
            });
            setShowCustomerModal(true);
            notify(`Preparing to convert ${followup.name} to a new Customer.`, 'success');
        }
    } catch (error) {
        console.error("Error checking existing customer:", error);
        notify("Error checking customer status. Please try again.", "error");
    } finally {
        setIsCustomerDataLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border ${
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        {status}
      </span>
    );
  };
  
  // Helper for Customer Detail items in the Customer View Modal
  const CustomerDetailItem = ({ icon, label, value }) => (
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-2">
      <div className="text-sm pt-0.5 text-blue-500">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-words">{value || "N/A"}</p>
      </div>
    </div>
  );

  // Check if the lead is assigned
  const isAssigned = (lead) => !!lead.assignedToName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:top-5 p-3 sm:p-4 rounded-xl shadow-lg text-white font-medium z-50 transform transition-all duration-300 ease-in-out ${
            notification.type === "success" 
              ? "bg-gradient-to-r from-green-500 to-green-600" 
              : "bg-gradient-to-r from-red-500 to-red-600"
          }`}
          role="alert"
        >
          <div className="text-center sm:text-left">{notification.msg}</div>
        </div>
      )}

      {/* Header Section and Filters */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Lead Follow-ups</h2>
        <p className="text-gray-600 text-sm sm:text-base">Showing {filteredFollowups.length} leads (Total: {followups.length})</p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2 xl:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Leads</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, issue type or village..."
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl pl-10 pr-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Follow-up Category</label>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl pl-10 pr-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm sm:text-base"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setFilterStatus("All");
                }}
              >
                <option value="All Leads">All Leads</option>
                <option value="Today's Follow-ups">Today's Follow-ups</option>
                <option value="Pending">Pending Follow-ups</option>
                <option value="Call Back">Callback Scheduled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full border border-gray-300 rounded-lg sm:rounded-xl pl-10 pr-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer text-sm sm:text-base"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => setAddLeadModal(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg flex items-center justify-center font-semibold text-sm sm:text-base"
            >
              <FaUserPlus className="mr-2 text-sm" /> Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Time</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Name</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Mobile</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Response</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Issue Type</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Village</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Status</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-left text-sm sm:text-base border-b border-gray-200">Callback</th>
                <th className="p-3 sm:p-4 font-semibold text-gray-700 text-center text-sm sm:text-base border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">Loading leads...</td></tr>
              ) : filteredFollowups.length > 0 ? (
                filteredFollowups.map((f) => (
                  <tr
                    key={f._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <td className="p-3 sm:p-4 font-medium text-gray-600 text-sm sm:text-base">{f.time}</td>
                    <td className="p-3 sm:p-4 font-semibold text-gray-800 text-sm sm:text-base">{f.name}</td>
                    <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">{f.phone}</td>
                    <td className="p-3 sm:p-4 max-w-xs">
                      <div className="text-gray-700 line-clamp-2 text-sm sm:text-base">{f.response || "-"}</div>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">{f.issueType}</td>
                    <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">{f.village}</td>
                    <td className="p-3 sm:p-4">
                      {editingStatus === f._id ? (
                        <select
                          value={f.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(f._id, e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onBlur={() => setEditingStatus(null)}
                          autoFocus
                        >
                          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <div
                          className="cursor-pointer"
                          onClick={() => setEditingStatus(f._id)}
                        >
                          {getStatusBadge(f.status || "Pending")}
                        </div>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 text-sm sm:text-base">{f.callbackTime || "-"}</td>
                    <td className="p-3 sm:p-4">
                      <div className="flex justify-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => initiateCall(f)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 group relative"
                          disabled={callInProgress}
                          title="Call"
                        >
                          <FaPhone className="text-sm sm:text-base" />
                        </button>
                        <button
                          onClick={() => handleMessage(f.phone)}
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 group relative"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={15} className="sm:size-[17px]" />
                        </button>
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewLead(f)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 group relative"
                          title="View Details"
                        >
                          <FaEye size={16} className="sm:size-[18px]" />
                        </button>

                        {/* Convert to Customer Button */}
                        {(f.status === "Success" || f.status === "Pending") && (
                          <button
                            onClick={() => handleConvertToCustomer(f)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 group relative"
                            title="Convert to Customer"
                          >
                            <FaUserPlus size={16} className="sm:size-[18px]" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="p-8 text-center text-gray-500">No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading leads...</div>
          ) : filteredFollowups.length > 0 ? (
            filteredFollowups.map((f) => (
              <div key={f._id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{f.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => initiateCall(f)}
                      className="p-1 text-green-600"
                      title="Call"
                    >
                      <FaPhone size={14} />
                    </button>
                    <button
                      onClick={() => handleMessage(f.phone)}
                      className="p-1 text-green-500"
                      title="WhatsApp"
                    >
                      <FaWhatsapp size={14} />
                    </button>
                    <button
                      onClick={() => handleViewLead(f)}
                      className="p-1 text-blue-600"
                      title="View Details"
                    >
                      <FaEye size={14} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📞 {f.phone}</p>
                  <p>📝 {f.issueType || "-"}</p>
                  <p>🏠 {f.village || "-"}</p>
                  <p>⏰ {f.time}</p>
                  <div className="mt-2">{getStatusBadge(f.status || "Pending")}</div>
                  {f.callbackTime && <p className="text-xs text-blue-600">Callback: {f.callbackTime}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No leads found.</div>
          )}
        </div>
      </div>

      {/* Call Feedback Modal */}
      <Modal 
        isOpen={!!callingCustomer && !callInProgress} 
        onClose={() => setCallingCustomer(null)} 
        title={`Call Feedback: ${callingCustomer?.name}`}
        size="md"
      >
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Call Status</label>
            <select
              value={callStatus}
              onChange={(e) => setCallStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-sm sm:text-base"
            >
              <option value="">Select status</option>
              <option value="Success">Success</option>
              <option value="Not Connected">Not Connected</option>
              <option value="Not Responded">Not Responded</option>
              <option value="Call Back">Call Back</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <InputField
            label="Call Duration (minutes)"
            name="callDuration"
            type="number"
            value={callDuration}
            onChange={(e) => setCallDuration(e.target.value)}
            placeholder="e.g., 5"
            min="0"
          />
          
          <TextAreaField
            label="Response / Notes"
            name="responseText"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Enter customer response and notes..."
            rows={3}
          />

          {callStatus === "Call Back" && (
            <InputField
              label="Callback Date & Time"
              name="callbackTime"
              type="datetime-local"
              value={callbackTime}
              onChange={(e) => setCallbackTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setCallingCustomer(null);
                setCallStatus("");
                setCallDuration("");
                setResponseText("");
                setCallbackTime("");
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCallSave}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-2"
            >
              Save Feedback
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Lead Modal */}
      <Modal 
        isOpen={addLeadModal} 
        onClose={() => setAddLeadModal(false)} 
        title="Add New Lead"
        size="md"
      >
        <div className="space-y-4 sm:space-y-6">
          <InputField
            label="Name"
            name="name"
            value={newLead.name}
            onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter lead name"
            required
          />
          <InputField
            label="Phone"
            name="phone"
            value={newLead.phone}
            onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
            required
          />
          <InputField
            label="Issue Type"
            name="issueType"
            value={newLead.issueType}
            onChange={(e) => setNewLead(prev => ({ ...prev, issueType: e.target.value }))}
            placeholder="Enter issue type"
          />
          <InputField
            label="Village"
            name="village"
            value={newLead.village}
            onChange={(e) => setNewLead(prev => ({ ...prev, village: e.target.value }))}
            placeholder="Enter village"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={newLead.status}
              onChange={(e) => setNewLead(prev => ({ ...prev, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-sm sm:text-base"
            >
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Rejected">Rejected</option>
              <option value="Call Back">Call Back</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={() => setAddLeadModal(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLead}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-2"
            >
              Save Lead
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Lead Modal */}
      <Modal 
        isOpen={!!editingLead} 
        onClose={() => setEditingLead(null)} 
        title={`Edit Lead: ${editingLead?.name}`}
        size="lg"
      >
        {editingLead && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Name"
                  name="name"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter lead name"
                  required
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
                <InputField
                  label="Issue Type"
                  name="issueType"
                  value={editingLead.issueType}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, issueType: e.target.value }))}
                  placeholder="Enter issue type"
                />
                <InputField
                  label="Village"
                  name="village"
                  value={editingLead.village}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, village: e.target.value }))}
                  placeholder="Enter village"
                />
            </div>
            
            <TextAreaField
              label="Response / Notes"
              name="response"
              value={editingLead.response || ""}
              onChange={(e) => setEditingLead(prev => ({ ...prev, response: e.target.value }))}
              placeholder="Enter response notes"
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={editingLead.status}
                    onChange={(e) => setEditingLead(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white text-sm sm:text-base"
                  >
                    {Object.keys(statusColors).filter(s => s !== 'Converted').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {editingLead.status === "Call Back" && (
                    <InputField
                      label="Callback Date & Time"
                      name="callbackTime"
                      type="datetime-local"
                      value={editingLead.callbackTime || ""}
                      onChange={(e) => setEditingLead(prev => ({ ...prev, callbackTime: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                )}
            </div>
            

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base order-2 sm:order-1"
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              <button
                onClick={handleSaveEditLead}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-2"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Lead/Customer Details Modal */}
      <Modal 
        isOpen={!!viewingLead} 
        onClose={() => {
          setViewingLead(null);
          setViewingCustomerData(null);
        }} 
        title={viewingCustomerData ? `Customer Details (Case: ${viewingCustomerData.caseId})` : "Lead Details"}
        size="xl"
      >
        {viewingLead && (
          <div className="space-y-6">
            {/* Loading State for Customer Data */}
            {isCustomerDataLoading && (
              <div className="p-4 bg-yellow-100 rounded-xl text-center text-yellow-800 flex items-center justify-center space-x-2">
                <FaSyncAlt className="animate-spin" />
                <span>Checking for linked customer record...</span>
              </div>
            )}

            {/* Display Customer Data (if found) */}
            {viewingCustomerData ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="text-xl font-bold text-green-800">Customer Conversion Successful!</h4>
                    <p className="text-sm text-gray-600 mt-1">Original Lead ID: {viewingCustomerData.convertedFromLeadId}</p>
                </div>

                <h5 className="text-lg font-semibold text-gray-800 border-b pb-2">Customer Information</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <CustomerDetailItem icon={<FaUser />} label="Full Name" value={viewingCustomerData.name} />
                  <CustomerDetailItem icon={<FaMobileAlt />} label="Phone" value={viewingCustomerData.phone} />
                  <CustomerDetailItem icon={<FaTimes />} label="Case Status" value={viewingCustomerData.status} />
                  <CustomerDetailItem icon={<FaInfoCircle />} label="Problem" value={viewingCustomerData.problem} />
                  <CustomerDetailItem icon={<FaSearch />} label="CIBIL Score" value={viewingCustomerData.cibilBefore || 'N/A'} />
                  <CustomerDetailItem icon={<FaCalendar />} label="Created At" value={new Date(viewingCustomerData.createdAt).toLocaleDateString()} />
                  <CustomerDetailItem icon={<FaUser />} label="Telecaller" value={viewingCustomerData.telecallerName} />
                  <CustomerDetailItem icon={<FaMapMarkerAlt />} label="Address" value={viewingCustomerData.address} className="md:col-span-2" />
                </div>

                <h5 className="text-lg font-semibold text-gray-800 border-b pt-4 pb-2">Bank & Loan Details</h5>
                <div className="space-y-4">
                  {Object.entries(viewingCustomerData.bankDetails || {}).map(([bankName, details]) => (
                    <div key={bankName} className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <h6 className="font-bold text-blue-800 mb-2">{bankName}</h6>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <p className="col-span-1">A/C Number: <span className="font-mono text-gray-700">{details.accountNumber}</span></p>
                        <p className="col-span-1">Loan Type: <span className="font-medium text-gray-700">{details.loanType}</span></p>
                        <p className="col-span-2">Issues: <span className="text-red-600">{details.issues?.join(', ') || 'None reported'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (
              /* Display Original Lead Data */
              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h4 className="text-xl font-bold text-yellow-800">Lead Details: {viewingLead.name}</h4>
                    {(viewingLead.status === "Success" || viewingLead.status === "Converted") && 
                      <p className="text-sm text-red-600 mt-1">Status is '{viewingLead.status}', but linked customer data was not found.</p>
                    }
                </div>

                {/* Lead Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <DetailItem icon={<FaUser />} label="Name" value={viewingLead.name} />
                    <DetailItem icon={<FaMobileAlt />} label="Phone" value={viewingLead.phone} />
                    <DetailItem icon={<FaInfoCircle />} label="Issue Type" value={viewingLead.issueType} />
                    <DetailItem icon={<FaMapMarkerAlt />} label="Village" value={viewingLead.village} />
                    <DetailItem icon={<FaCalendar />} label="Status" value={viewingLead.status} />
                    <DetailItem icon={<FaCalendar />} label="Callback Time" value={viewingLead.callbackTime} />

                    {/* Display Assigned Details if available */}
                    {viewingLead.assignedToName && (
                        <div className="sm:col-span-2">
                           <DetailItem 
                             icon={<FaUserTie className="text-indigo-500" />} 
                             label="Assigned To" 
                             value={viewingLead.assignedToName} 
                             className="bg-indigo-50 border border-indigo-200"
                           />
                        </div>
                    )}
                </div>

                {viewingLead.response && (
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Last Response / Notes</p>
                    <p className="text-gray-800 italic text-sm sm:text-base whitespace-pre-wrap">{viewingLead.response}</p>
                  </div>
                )}
              </div>
            )}

            {/* View Modal Footer with Edit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                    onClick={handleEditFromView}
                    disabled={viewingLead && !viewingCustomerData && isAssigned(viewingLead)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg sm:rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-1 flex items-center justify-center ${
                      viewingLead && !viewingCustomerData && isAssigned(viewingLead) 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600'
                    }`}
                >
                    <FaEdit className="mr-2" /> 
                    {viewingCustomerData ? "Edit Customer" : "Edit Lead"}
                </button>
                <button
                    onClick={() => {
                        setViewingLead(null);
                        setViewingCustomerData(null); 
                    }}
                    className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-semibold text-sm sm:text-base order-2 sm:order-2"
                >
                    Close View
                </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      {showCustomerModal && customerPrefill && !customerPrefill.isEditing && (
        <AddCustomer
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            setCustomerPrefill(null);
            setNotification({ msg: "Customer conversion/update complete, refreshing leads...", type: "success" }); 
          }}
          prefill={customerPrefill}
          notify={notify}
        />
      )}
      
      {/* Edit Customer Modal */}
      {showCustomerModal && customerPrefill && customerPrefill.isEditing && (
        <EditCustomer
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            setCustomerPrefill(null);
            setNotification({ msg: "Customer conversion/update complete, refreshing leads...", type: "success" }); 
          }}
          customerData={customerPrefill}
          customerId={customerPrefill._id} 
          notify={notify}
        />
      )}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Followups;