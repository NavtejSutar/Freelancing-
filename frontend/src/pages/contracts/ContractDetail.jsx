import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../../api/contractService';
import { paymentService } from '../../api/paymentService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPlus } from 'react-icons/hi';

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneData, setMilestoneData] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [acting, setActing] = useState(false);

  const loadData = () => {
    Promise.all([
      contractService.getById(id),
      contractService.getMilestones(id),
    ]).then(([contRes, msRes]) => {
      setContract(contRes.data.data);
      setMilestones(msRes.data.data || contRes.data.data?.milestones || []);
    }).catch(() => toast.error('Failed to load contract'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  const handleContractAction = async (action) => {
    setActing(true);
    try {
      if (action === 'complete') await contractService.complete(id);
      if (action === 'cancel') await contractService.cancel(id);
      toast.success(`Contract ${action}d`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActing(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setActing(true);
    try {
      await contractService.createMilestone(id, { ...milestoneData, amount: parseFloat(milestoneData.amount) });
      toast.success('Milestone added');
      setShowMilestoneForm(false);
      setMilestoneData({ title: '', description: '', amount: '', dueDate: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setActing(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try {
      await contractService.completeMilestone(id, milestoneId);
      toast.success('Milestone completed');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleInitiatePayment = async () => {
    try {
      await paymentService.initiate(id);
      toast.success('Payment initiated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!contract) return <div className="text-center py-12 text-gray-500">Contract not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Contract #{contract.id}</h1>
          <StatusBadge status={contract.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">${contract.totalAmount}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="text-sm font-medium text-gray-900">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500">End Date</p>
            <p className="text-sm font-medium text-gray-900">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '—'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500">Milestones</p>
            <p className="text-lg font-bold text-gray-900">{milestones.length}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {contract.status === 'ACTIVE' && user?.role === 'CLIENT' && (
            <>
              <button onClick={() => handleContractAction('complete')} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                Mark Complete
              </button>
              <button onClick={() => handleContractAction('cancel')} disabled={acting} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleInitiatePayment} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Initiate Payment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
          {contract.status === 'ACTIVE' && user?.role === 'CLIENT' && (
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
              <HiPlus className="w-4 h-4" /> Add Milestone
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={handleAddMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              value={milestoneData.title}
              onChange={(e) => setMilestoneData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Milestone title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <textarea
              value={milestoneData.description}
              onChange={(e) => setMilestoneData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={milestoneData.amount}
                onChange={(e) => setMilestoneData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount ($)"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="date"
                value={milestoneData.dueDate}
                onChange={(e) => setMilestoneData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                Add
              </button>
              <button type="button" onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {milestones.length === 0 ? (
          <p className="text-gray-500 text-sm">No milestones yet.</p>
        ) : (
          <div className="space-y-3">
            {milestones.map((ms) => (
              <div key={ms.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{ms.title}</p>
                    {ms.description && <p className="text-sm text-gray-600 mt-1">{ms.description}</p>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>${ms.amount}</span>
                      {ms.dueDate && <span>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ms.status} />
                    {ms.status === 'IN_PROGRESS' && user?.role === 'CLIENT' && (
                      <button onClick={() => handleCompleteMilestone(ms.id)} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
