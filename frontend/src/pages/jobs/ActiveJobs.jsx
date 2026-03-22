import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contractService } from '../../api/contractService';
import { paymentService } from '../../api/paymentService';
import { submissionService } from '../../api/submissionService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  HiChevronDown, HiChevronUp, HiPlus, HiUpload,
  HiCheckCircle, HiX, HiExternalLink
} from 'react-icons/hi';

// Replace with your actual UPI ID
const UPI_ID = 'YOUR_UPI_ID@upi';
const UPI_NAME = 'FreelanceHub';

export default function ActiveJobs() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [milestones, setMilestones] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [acting, setActing] = useState({});

  // Milestone form state per contract
  const [showMilestoneForm, setShowMilestoneForm] = useState({});
  const [milestoneData, setMilestoneData] = useState({});

  // Work submission state per milestone
  const [showSubmitWork, setShowSubmitWork] = useState(null);
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitLinks, setSubmitLinks] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  // UPI Payment modal state
  const [paymentModal, setPaymentModal] = useState(null); // { contractId, totalAmount }
  const [upiTxnId, setUpiTxnId] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const loadContracts = useCallback(() => {
    contractService.getAll(0, 50)
      .then(({ data }) => {
        const all = data.data?.content || [];
        const active = all.filter(c => c.status === 'ACTIVE' || c.status === 'DISPUTED');
        setContracts(active);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  const toggleExpand = async (contractId) => {
    setExpanded(prev => ({ ...prev, [contractId]: !prev[contractId] }));
    if (!milestones[contractId]) {
      try {
        const [msRes, subRes] = await Promise.all([
          contractService.getMilestones(contractId),
          submissionService.getByContract(contractId).catch(() => ({ data: { data: [] } })),
        ]);
        setMilestones(prev => ({ ...prev, [contractId]: msRes.data.data || [] }));
        setSubmissions(prev => ({ ...prev, [contractId]: subRes.data.data || [] }));
      } catch {
        toast.error('Failed to load milestone details');
      }
    }
  };

  const refreshContractData = async (contractId) => {
    try {
      const [msRes, subRes] = await Promise.all([
        contractService.getMilestones(contractId),
        submissionService.getByContract(contractId).catch(() => ({ data: { data: [] } })),
      ]);
      setMilestones(prev => ({ ...prev, [contractId]: msRes.data.data || [] }));
      setSubmissions(prev => ({ ...prev, [contractId]: subRes.data.data || [] }));
    } catch {}
  };

  const setActingFor = (contractId, val) =>
    setActing(prev => ({ ...prev, [contractId]: val }));

  // ── UPI Payment Modal ──
  const openPaymentModal = (contractId, totalAmount) => {
    document.body.style.overflow = 'hidden';
    setPaymentModal({ contractId, totalAmount });
    setUpiTxnId('');
  };

  const closePaymentModal = () => {
    document.body.style.overflow = '';
    setPaymentModal(null);
    setUpiTxnId('');
  };

  const handleSubmitPayment = async () => {
    if (!upiTxnId.trim()) { toast.error('Please enter your UPI transaction ID'); return; }
    setPaymentSubmitting(true);
    try {
      await paymentService.initiate(paymentModal.contractId, upiTxnId.trim());
      toast.success('Payment submitted! Admin will confirm within 24 hours.');
      closePaymentModal();
      loadContracts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // ── Mark Complete ──
  const handleMarkComplete = async (contractId) => {
    setActingFor(contractId, true);
    try {
      await contractService.complete(contractId);
      toast.success('Contract marked as complete!');
      loadContracts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete contract');
    } finally {
      setActingFor(contractId, false);
    }
  };

  const handleApproveMilestone = async (contractId, milestoneId) => {
    try {
      await contractService.completeMilestone(contractId, milestoneId);
      toast.success('Milestone approved');
      refreshContractData(contractId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddMilestone = async (e, contractId) => {
    e.preventDefault();
    const d = milestoneData[contractId] || {};
    if (!d.title?.trim() || !d.amount) { toast.error('Title and amount are required'); return; }
    setActingFor(contractId, true);
    try {
      await contractService.createMilestone(contractId, {
        title: d.title.trim(),
        description: d.description?.trim() || '',
        amount: parseFloat(d.amount),
        dueDate: d.dueDate || null,
      });
      toast.success('Milestone added');
      setShowMilestoneForm(prev => ({ ...prev, [contractId]: false }));
      setMilestoneData(prev => ({ ...prev, [contractId]: { title: '', description: '', amount: '', dueDate: '' } }));
      refreshContractData(contractId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add milestone');
    } finally {
      setActingFor(contractId, false);
    }
  };

  const handleSubmitWork = async (contractId, milestoneId) => {
    if (!submitDesc.trim()) { toast.error('Please describe your submission'); return; }
    setSubmitting(true);
    try {
      const validLinks = submitLinks.filter(l => l.trim());
      await submissionService.create({ milestoneId, description: submitDesc.trim(), attachmentUrls: validLinks });
      toast.success('Work submitted! Awaiting client review.');
      setShowSubmitWork(null);
      setSubmitDesc('');
      setSubmitLinks(['']);
      refreshContractData(contractId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveSubmission = async (contractId, subId) => {
    try {
      await submissionService.approve(subId);
      toast.success('Submission approved');
      refreshContractData(contractId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRejectSubmission = async (contractId, subId) => {
    try {
      await submissionService.reject(subId);
      toast.success('Revision requested');
      refreshContractData(contractId);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {contracts.length === 0
            ? 'No active jobs at the moment.'
            : `${contracts.length} active contract${contracts.length !== 1 ? 's' : ''} in progress`}
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiCheckCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">No active jobs</p>
          <p className="text-sm text-gray-400 mt-1">
            {isFreelancer
              ? 'Active contracts will appear here once both parties sign.'
              : 'Post a job and accept a proposal to get started.'}
          </p>
          {isClient && (
            <Link to="/jobs/create" className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Post a Job
            </Link>
          )}
          {isFreelancer && (
            <Link to="/jobs" className="mt-4 inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Browse Jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const isOpen = expanded[contract.id];
            const cMilestones = milestones[contract.id] || [];
            const cSubmissions = submissions[contract.id] || [];
            const isActing = acting[contract.id];
            const cMilestoneForm = milestoneData[contract.id] || { title: '', description: '', amount: '', dueDate: '' };
            const completedMilestones = cMilestones.filter(m => m.status === 'APPROVED').length;
            const isDisputed = contract.status === 'DISPUTED';
            const paymentStatus = contract.paymentStatus; // null | PENDING | COMPLETED

            return (
              <div key={contract.id} className={`bg-white rounded-xl shadow-sm border ${isDisputed ? 'border-red-300' : 'border-gray-200'} overflow-hidden`}>

                {/* ── Contract Header ── */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-gray-900 truncate">{contract.title}</h2>
                        <StatusBadge status={contract.status} />
                        {isDisputed && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            ⚠️ Disputed — actions paused
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {isClient ? `Freelancer: ${contract.freelancerName}` : `Client: ${contract.clientName}`}
                      </p>
                      {contract.jobPostTitle && (
                        <p className="text-xs text-gray-400 mt-0.5">Job: {contract.jobPostTitle}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-gray-400">Contract Value</p>
                        <p className="text-base font-bold text-gray-900">₹{contract.totalAmount}</p>
                      </div>
                      {contract.milestones?.length > 0 && (
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-400">Milestones</p>
                          <p className="text-base font-bold text-gray-900">
                            {completedMilestones}/{contract.milestones.length}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => toggleExpand(contract.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {isOpen ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Client payment actions (replaces old Initiate Payment + Mark Complete) ── */}
                  {isClient && !isDisputed && (
                    <div className="flex gap-2 mt-4 flex-wrap items-center">
                      {/* No payment yet — show Pay button */}
                      {!paymentStatus && (
                        <button
                          onClick={() => openPaymentModal(contract.id, contract.totalAmount)}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                          💳 Pay via UPI
                        </button>
                      )}
                      {/* Payment pending admin confirmation */}
                      {paymentStatus === 'PENDING' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          <span className="text-yellow-700 font-medium">Payment pending admin confirmation</span>
                        </div>
                      )}
                      {/* Payment confirmed — show Mark Complete */}
                      {paymentStatus === 'COMPLETED' && (
                        <>
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                            <span className="text-green-600">✓</span>
                            <span className="text-green-700 font-medium">Payment confirmed</span>
                          </div>
                          <button
                            onClick={() => handleMarkComplete(contract.id)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                          >
                            <HiCheckCircle className="w-4 h-4" /> Mark Complete
                          </button>
                        </>
                      )}
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <HiExternalLink className="w-4 h-4" /> Full Details
                      </Link>
                    </div>
                  )}

                  {isFreelancer && (
                    <div className="flex gap-2 mt-4 flex-wrap items-center">
                      {/* Show payment status to freelancer too */}
                      {paymentStatus === 'PENDING' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          <span className="text-yellow-700 font-medium">Client payment pending confirmation</span>
                        </div>
                      )}
                      {paymentStatus === 'COMPLETED' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                          <span className="text-green-600">✓</span>
                          <span className="text-green-700 font-medium">Payment confirmed</span>
                        </div>
                      )}
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium"
                      >
                        <HiExternalLink className="w-4 h-4" /> Full Contract Details
                      </Link>
                    </div>
                  )}
                </div>

                {/* ── Expanded Milestones Panel ── */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Milestones {cMilestones.length > 0 && `(${completedMilestones}/${cMilestones.length} done)`}
                      </h3>
                      {!isDisputed && (
                        <button
                          onClick={() => setShowMilestoneForm(prev => ({ ...prev, [contract.id]: !prev[contract.id] }))}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          <HiPlus className="w-4 h-4" /> Add Milestone
                        </button>
                      )}
                    </div>

                    {showMilestoneForm[contract.id] && (
                      <form onSubmit={(e) => handleAddMilestone(e, contract.id)}
                        className="p-4 bg-white rounded-lg border border-indigo-100 space-y-3 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={cMilestoneForm.title}
                            onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, title: e.target.value } }))}
                            placeholder="Milestone title *" required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <input
                            type="number"
                            value={cMilestoneForm.amount}
                            onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, amount: e.target.value } }))}
                            placeholder="Amount (₹) *" required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <textarea
                          value={cMilestoneForm.description}
                          onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, description: e.target.value } }))}
                          placeholder="Description (optional)" rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            value={cMilestoneForm.dueDate}
                            onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, dueDate: e.target.value } }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <div className="flex gap-2">
                            <button type="submit" disabled={isActing}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                              Add
                            </button>
                            <button type="button"
                              onClick={() => setShowMilestoneForm(prev => ({ ...prev, [contract.id]: false }))}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {cMilestones.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">
                        No milestones yet. Add one to track deliverables.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {cMilestones.map((ms) => {
                          const msSubmissions = cSubmissions.filter(s => s.milestoneId === ms.id);
                          const latestSub = msSubmissions[msSubmissions.length - 1];
                          const statusColor = {
                            APPROVED: 'border-green-200 bg-green-50',
                            IN_PROGRESS: 'border-blue-200 bg-blue-50',
                            PENDING: 'border-gray-200 bg-white',
                          }[ms.status] || 'border-gray-200 bg-white';

                          return (
                            <div key={ms.id} className={`rounded-lg border p-4 ${statusColor}`}>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-gray-900">{ms.title}</p>
                                    <StatusBadge status={ms.status} />
                                  </div>
                                  {ms.description && (
                                    <p className="text-sm text-gray-600 mt-1">{ms.description}</p>
                                  )}
                                  <div className="flex gap-4 mt-1.5 text-sm text-gray-500">
                                    <span className="font-medium text-gray-800">₹{ms.amount}</span>
                                    {ms.dueDate && (
                                      <span>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                {isClient && ms.status === 'IN_PROGRESS' && (
                                  <button
                                    onClick={() => handleApproveMilestone(contract.id, ms.id)}
                                    className="ml-3 px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex-shrink-0"
                                  >
                                    ✓ Approve
                                  </button>
                                )}
                              </div>

                              {!isDisputed && (
                                <div className="mt-3 pt-3 border-t border-current border-opacity-10 space-y-2">
                                  {isFreelancer && (ms.status === 'PENDING' || ms.status === 'IN_PROGRESS') && (
                                    showSubmitWork === ms.id ? (
                                      <div className="space-y-2 bg-white rounded-lg p-3 border border-gray-200">
                                        <textarea
                                          value={submitDesc}
                                          onChange={(e) => setSubmitDesc(e.target.value)}
                                          placeholder="Describe what you've completed for this milestone..."
                                          rows={2}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <div>
                                          <p className="text-xs text-gray-500 font-medium mb-1.5">
                                            📁 Attach file/folder links (Google Drive, GitHub, Dropbox...)
                                          </p>
                                          {submitLinks.map((link, idx) => (
                                            <div key={idx} className="flex gap-2 mb-1.5">
                                              <input
                                                value={link}
                                                onChange={(e) => {
                                                  const updated = [...submitLinks];
                                                  updated[idx] = e.target.value;
                                                  setSubmitLinks(updated);
                                                }}
                                                placeholder="https://drive.google.com/... or https://github.com/..."
                                                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                                              />
                                              {submitLinks.length > 1 && (
                                                <button type="button"
                                                  onClick={() => setSubmitLinks(submitLinks.filter((_, i) => i !== idx))}
                                                  className="text-gray-400 hover:text-red-500">
                                                  <HiX className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button type="button"
                                            onClick={() => setSubmitLinks([...submitLinks, ''])}
                                            className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                                            <HiPlus className="w-3 h-3" /> Add another link
                                          </button>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleSubmitWork(contract.id, ms.id)}
                                            disabled={submitting}
                                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                                          >
                                            <HiUpload className="w-3.5 h-3.5" />
                                            {submitting ? 'Submitting...' : 'Submit Work'}
                                          </button>
                                          <button
                                            onClick={() => { setShowSubmitWork(null); setSubmitDesc(''); setSubmitLinks(['']); }}
                                            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => { setShowSubmitWork(ms.id); setSubmitDesc(''); setSubmitLinks(['']); }}
                                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500"
                                      >
                                        <HiUpload className="w-4 h-4" /> Submit Work
                                      </button>
                                    )
                                  )}

                                  {latestSub && (
                                    <div className={`p-3 rounded-lg text-sm ${
                                      latestSub.status === 'APPROVED' ? 'bg-green-100 border border-green-200' :
                                      latestSub.status === 'REJECTED' ? 'bg-red-50 border border-red-200' :
                                      'bg-blue-50 border border-blue-200'
                                    }`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-semibold text-gray-600 uppercase">Latest Submission</p>
                                        <StatusBadge status={latestSub.status} />
                                      </div>
                                      <p className="text-gray-700">{latestSub.description}</p>
                                      {latestSub.attachmentUrls?.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                          <p className="text-xs text-gray-500 font-medium">📁 Attached:</p>
                                          {latestSub.attachmentUrls.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline break-all">
                                              🔗 {url}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(latestSub.createdAt || latestSub.submittedAt).toLocaleString()}
                                      </p>
                                      {isClient && latestSub.status === 'PENDING' && (
                                        <div className="flex gap-2 mt-2">
                                          <button onClick={() => handleApproveSubmission(contract.id, latestSub.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">
                                            ✓ Approve
                                          </button>
                                          <button onClick={() => handleRejectSubmission(contract.id, latestSub.id)}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">
                                            Request Revision
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                      <Link to={`/contracts/${contract.id}`}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
                        <HiExternalLink className="w-4 h-4" /> View Full Contract & Sign
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── UPI Payment Modal ── */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5 my-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">💳 Pay via UPI</h2>
              <button onClick={closePaymentModal} className="text-gray-400 hover:text-gray-600">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center p-4 bg-indigo-50 rounded-xl">
              <p className="text-3xl font-bold text-indigo-700">₹{paymentModal.totalAmount}</p>
              <p className="text-sm text-gray-500 mt-1">Total contract amount</p>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-gray-700">Scan QR code to pay</p>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}%26pn=${UPI_NAME}%26am=${paymentModal.totalAmount}%26cu=INR`}
                  alt="UPI QR Code"
                  className="w-48 h-48 border-2 border-indigo-100 rounded-xl"
                />
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-2 inline-block">
                <p className="text-xs text-gray-500">UPI ID</p>
                <p className="font-mono font-semibold text-gray-900">{UPI_ID}</p>
              </div>
              <p className="text-xs text-gray-400">Use GPay, PhonePe, Paytm, BHIM or any UPI app</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter UPI Transaction ID after payment <span className="text-red-500">*</span>
              </label>
              <input
                value={upiTxnId}
                onChange={(e) => setUpiTxnId(e.target.value)}
                placeholder="e.g. 316894521234"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
              <p className="text-xs text-gray-400">Find this in your UPI app under transaction history</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitPayment}
                disabled={paymentSubmitting || !upiTxnId.trim()}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {paymentSubmitting ? 'Submitting...' : 'I have paid — Submit'}
              </button>
              <button onClick={closePaymentModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">
                Cancel
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Admin will verify your payment within 24 hours using the transaction ID.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}