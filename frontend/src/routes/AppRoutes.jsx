import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Jobs
import JobList from '../pages/jobs/JobList';
import JobDetail from '../pages/jobs/JobDetail';
import JobForm from '../pages/jobs/JobForm';
import MyJobs from '../pages/jobs/MyJobs';

// Proposals
import MyProposals from '../pages/proposals/MyProposals';
import ProposalDetail from '../pages/proposals/ProposalDetail';

// Contracts
import ContractList from '../pages/contracts/ContractList';
import ContractDetail from '../pages/contracts/ContractDetail';

// Messages
import MessageThreads from '../pages/messages/MessageThreads';
import ChatRoom from '../pages/messages/ChatRoom';

// Profile
import Profile from '../pages/profile/Profile';

// Admin
import AdminUsers from '../pages/admin/AdminUsers';
import AdminReports from '../pages/admin/AdminReports';
import AdminDisputes from '../pages/admin/AdminDisputes';
import AdminWithdrawals from '../pages/admin/AdminWithdrawals';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminSkills from '../pages/admin/Adminskills'; // ADDED

// Other
import Notifications from '../pages/notifications/Notifications';
import Settings from '../pages/settings/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />

        {/* Jobs */}
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/my" element={<MyJobs />} />
        <Route path="/jobs/create" element={<ProtectedRoute roles={['CLIENT']}><JobForm /></ProtectedRoute>} />
        <Route path="/jobs/:id/edit" element={<ProtectedRoute roles={['CLIENT']}><JobForm /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Proposals */}
        <Route path="/proposals/my" element={<MyProposals />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />

        {/* Contracts */}
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />

        {/* Messages */}
        <Route path="/messages" element={<MessageThreads />} />
        <Route path="/messages/:threadId" element={<ChatRoom />} />

        {/* Profile & Settings */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />

        {/* Admin */}
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/skills" element={<ProtectedRoute roles={['ADMIN']}><AdminSkills /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['ADMIN']}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/disputes" element={<ProtectedRoute roles={['ADMIN']}><AdminDisputes /></ProtectedRoute>} />
        <Route path="/admin/withdrawals" element={<ProtectedRoute roles={['ADMIN']}><AdminWithdrawals /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['ADMIN']}><AdminPayments /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}