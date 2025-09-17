import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Telecaller imports
import TelecallerApp from './components/Telecaller/TelecallerApp';
import Dashboard from './components/Telecaller/pages/Dashboard.jsx';
import AddCustomer from './components/Telecaller/pages/AddCustomer.jsx';
import FollowUps from './components/Telecaller/pages/FollowUps.jsx';
import CallLogs from './components/Telecaller/pages/CallLogs.jsx';
import CustomerResponse from './components/Telecaller/pages/CustomerResponse.jsx';
import Reports from './components/Telecaller/pages/Reports.jsx';

// Marketing imports
import MarketingApp from './components/Marketing/MarketingApp';
import MarketingDashboard from './components/Marketing/MarketingDashboard.jsx';
import FieldDataCollection from './components/Marketing/FieldDataCollation.jsx';
import MarketingReports from './components/Marketing/MarketingReport.jsx';
import ExpenseTracking from './components/Marketing/ExpenseTracking.jsx';

// Officer imports
import OfficerApp from './components/Officer/OfficerApp';
import OfficerDashboard from './components/Officer/OfficerDashboard.jsx';
import CaseOffers from './components/Officer/CaseOffers.jsx';
import Payments from './components/Officer/Payments.jsx';
import AssignedCases from './components/Officer/AsssignedCases.jsx';

// Admin imports
import AdminApp from './components/Admin/AdminApp.jsx';
import AdminDashboard from './components/Admin/AdminDashboard.jsx';
import AllCases from './components/Admin/AllCases.jsx';
import UserManagement from './components/Admin/UserManagement.jsx';
import ReferralManagement from './components/Admin/Referral.jsx';
import FinancialReport from './components/Admin/FinancialReport.jsx';

// Shared imports
import RequestsPage from './components/Shared/RequestPage.js';

import './App.css';
import CustomerList from './components/Admin/Customers.jsx';
import FieldData from './components/Admin/FieldData.jsx';
import Leads from './components/Marketing/Leads.jsx';
import LeadsAdmin from './components/Admin/Leads.jsx';
import TelecallerUsers from './components/Admin/TelecallerUser.jsx';
import MarketingUsers from './components/Admin/MarketingUser.jsx';
import AgentUsers from './components/Admin/AgentUser.jsx';
import TodaysFollowups from './components/Telecaller/pages/Todayfollowups.jsx';
import FieldDataa from './components/Telecaller/pages/FieldDataa.jsx';
import Followups from './components/Telecaller/pages/FollowUps.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Telecaller Routes */}
            <Route path="/telecaller/*" element={<TelecallerApp />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-customer" element={<AddCustomer />} />
              <Route path="today-followup" element={<TodaysFollowups />} />
              <Route path="followups" element={<Followups />} />
              <Route path="call-logs" element={<CallLogs />} />
              <Route path="field-data" element={<FieldDataa />} />
              <Route path="responses" element={<CustomerResponse />} />
              <Route path="reports" element={<Reports />} />
              <Route path="request" element={<RequestsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Marketing Routes */}
            <Route path="/marketing/*" element={<MarketingApp />}>
              <Route index element={<MarketingDashboard />} />
              <Route path="dashboard" element={<MarketingDashboard />} />
              <Route path="field-data" element={<FieldDataCollection />} />
              <Route path="Leads" element={<Leads />} />
              <Route path="expenses" element={<ExpenseTracking />} />
              <Route path="marketing-reports" element={<MarketingReports />} />
              <Route path="request" element={<RequestsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Officer Routes */}
            <Route path="/agent/*" element={<OfficerApp />}>
              <Route index element={<OfficerDashboard />} />
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="assigned-cases" element={<AssignedCases />} />
              <Route path="case-offers" element={<CaseOffers />} />
              <Route path="Leads" element={<Leads />} />
              <Route path="payments" element={<Payments />} />
              <Route path="request" element={<RequestsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminApp />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="all-cases" element={<AllCases />} />
              <Route path="field-data" element={<FieldData />} />
              <Route path="telecaller" element={<TelecallerUsers />} />
              <Route path="marketing" element={<MarketingUsers />} />
              <Route path="agent" element={<AgentUsers />} />
              <Route path="Leadss" element={<LeadsAdmin/>} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="financial-reports" element={<FinancialReport />} />
              <Route path="referral-management" element={<ReferralManagement />} />
              <Route path="Customers" element={<CustomerList />} />
              <Route path="request" element={<RequestsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Role-based Dashboard Redirects */}
            <Route path="/telecaller-dashboard" element={<Navigate to="/telecaller/dashboard" replace />} />
            <Route path="/marketing-dashboard" element={<Navigate to="/marketing/dashboard" replace />} />
            <Route path="/agent-dashboard" element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
