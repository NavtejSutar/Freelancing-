const variants = {
  OPEN: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  SHORTLISTED: 'bg-purple-100 text-purple-800',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
  TERMINATED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-orange-100 text-orange-800',
  DRAFT: 'bg-gray-100 text-gray-600',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-indigo-100 text-indigo-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-800',
};

export default function StatusBadge({ status }) {
  const cls = variants[status] || 'bg-gray-100 text-gray-800';
  const label = status?.replace(/_/g, ' ') || 'UNKNOWN';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
