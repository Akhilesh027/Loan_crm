import React from "react";
import { FaFilePdf, FaImage, FaExternalLinkAlt, FaTimes } from "react-icons/fa";

const ViewCustomerModal = ({ customer, isOpen, onClose }) => {
  if (!isOpen || !customer) return null;

  // Utility function to determine file icon
  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf")) return <FaFilePdf className="text-red-500 mr-2" />;
    if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png")) return <FaImage className="text-green-500 mr-2" />;
    return <FaExternalLinkAlt className="text-gray-500 mr-2" />;
  };

  const allBanks = [
    ...(customer.banks || []), 
    ...(customer.otherBanks || [])
  ].filter(bank => bank && bank !== "Other");
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Customer Details: {customer.name}</h2>
          <button
            type="button"
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-8">

          {/* 1. Personal and General Details */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal & Contact Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <DetailItem label="Phone">{customer.phone}</DetailItem>
              <DetailItem label="Email">{customer.email || "-"}</DetailItem>
              <DetailItem label="Aadhaar">{customer.aadhaar || "-"}</DetailItem>
              <DetailItem label="PAN">{customer.pan || "-"}</DetailItem>
              <DetailItem label="CIBIL Score">{customer.cibil || "-"}</DetailItem>
              <DetailItem label="Referred By">{customer.referredPerson || "-"}</DetailItem>
              <DetailItem label="Address" className="col-span-full">{customer.address || "-"}</DetailItem>
              <DetailItem label="Problem Description" className="col-span-full text-red-700 font-medium">
                {customer.problem || "N/A"}
              </DetailItem>
            </div>
          </div>

          {/* 2. Bank Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Bank & Loan Details ({allBanks.length})</h3>
            
            {allBanks.length > 0 ? (
                <div className="space-y-4">
                    {allBanks.map(bank => {
                        const details = customer.bankDetails?.[bank] || {};
                        return (
                            <div key={bank} className="bg-white p-3 border-l-4 border-blue-500 shadow-sm rounded">
                                <h4 className="font-bold text-blue-800 mb-2">{bank}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <DetailItem label="A/C No.">{details.accountNumber || "-"}</DetailItem>
                                    <DetailItem label="Loan Type">{details.loanType || "-"}</DetailItem>
                                    <DetailItem label="Issues" className="col-span-full">
                                        {(details.issues || []).join(', ') || "None recorded."}
                                    </DetailItem>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (<p className="text-gray-500 text-sm">No bank details recorded.</p>)}
          </div>
          
          {/* 3. Custom Fields */}
          {(customer.customFields && customer.customFields.length > 0) && (
            <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {customer.customFields.map((field, index) => (
                        <DetailItem key={index} label={field.label}>
                            {field.value || "-"}
                        </DetailItem>
                    ))}
                </div>
            </div>
          )}

          {/* 4. Documents/Files */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Uploaded Documents</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              
              {/* Standard Docs */}
              <FileDetail label="Aadhaar Doc" link={customer.files?.aadhaarDoc} getIcon={getFileIcon} />
              <FileDetail label="PAN Doc" link={customer.files?.panDoc} getIcon={getFileIcon} />
              <FileDetail label="A/C Statement" link={customer.files?.accountStatementDoc} getIcon={getFileIcon} />
              <FileDetail label="Additional Doc" link={customer.files?.additionalDoc} getIcon={getFileIcon} />

              {/* Custom File Fields */}
              {(customer.customFields || [])
                .filter(f => f.type === 'file' && f.value)
                .map((field, index) => (
                    <FileDetail 
                        key={`custom-${index}`} 
                        label={field.label} 
                        // Assuming file value is the link/name
                        link={field.value} 
                        getIcon={getFileIcon} 
                    />
                ))}

            </div>
            {(!customer.files?.aadhaarDoc && !(customer.customFields || []).some(f => f.type === 'file')) && (
                 <p className="text-gray-500 text-sm">No files uploaded.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for simple detail rows
const DetailItem = ({ label, children, className = '' }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="text-gray-900 break-words">{children || "-"}</span>
    </div>
);

// Helper component for file links
const FileDetail = ({ label, link, getIcon }) => {
    if (!link) return null;
    
    // In a real application, you'd construct the full URL to the file server here
    const fileUrl = `files/${link}`;

    return (
        <div className="flex flex-col">
            <span className="text-gray-500 font-medium">{label}</span>
            <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:underline text-sm truncate"
                title={link}
            >
                {getIcon(link)}
                <span className="truncate">{link.split('/').pop()}</span>
            </a>
        </div>
    );
};

export default ViewCustomerModal;