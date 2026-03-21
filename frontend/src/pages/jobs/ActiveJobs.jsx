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
  HiChevronDown, HiChevronUp, HiPlus, HiUpload, HiDownload,
  HiCheckCircle, HiX, HiExternalLink, HiCurrencyRupee
} from 'react-icons/hi';

export default function ActiveJobs() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // contractId → true/false
  const [milestones, setMilestones] = useState({}); // contractId → []
  const [submissions, setSubmissions] = useState({}); // contractId → []
  const [acting, setActing] = useState({}); // contractId → bool

  // Milestone form state per contract
  const [showMilestoneForm, setShowMilestoneForm] = useState({}); // contractId → bool
  const [milestoneData, setMilestoneData] = useState({}); // contractId → { title, description, amount, dueDate }

  // Work submission form state per milestone
  const [showSubmitWork, setShowSubmitWork] = useState(null); // milestoneId
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitLinks, setSubmitLinks] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  const loadContracts = useCallback(() => {
    contractService.getAll(0, 50)
      .then(({ data }) => {
        const all = data.data?.content || [];
        // Only active + disputed contracts (in-progress work)
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
      // Lazy load milestones + submissions when expanding
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

  const setActingFor = (contractId, val) => setActing(prev => ({ ...prev, [contractId]: val }));

  const handleInitiatePayment = async (contractId, totalAmount) => {
    if (!window.confirm(`Initiate payment of ₹${totalAmount}?\n\nThis creates a payment record. After admin confirmation you can mark the contract complete.`)) return;
    setActingFor(contractId, true);
    try {
      await paymentService.initiate(contractId);
      toast.success('Payment initiated — admin will confirm it shortly');
      loadContracts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setActingFor(contractId, false);
    }
  };

  const handleMarkComplete = async (contractId) => {
    if (!window.confirm('Mark this contract as complete? Make sure payment has been initiated first.')) return;
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contracts.length === 0
              ? 'No active jobs at the moment.'
              : `${contracts.length} active contract${contracts.length !== 1 ? 's' : ''} in progress`}
          </p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <HiCheckCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">No active jobs</p>
          <p className="text-sm text-gray-400 mt-1">
            {isFreelancer ? 'Active contracts will appear here once both parties sign.' : 'Post a job and accept a proposal to get started.'}
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

                    {/* Quick stats */}
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
                        title={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Client quick actions */}
                  {isClient && !isDisputed && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button
                        onClick={() => handleInitiatePayment(contract.id, contract.totalAmount)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <HiCurrencyRupee className="w-4 h-4" /> Initiate Payment
                      </button>
                      <button
                        onClick={() => handleMarkComplete(contract.id)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <HiCheckCircle className="w-4 h-4" /> Mark Complete
                      </button>
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <HiExternalLink className="w-4 h-4" /> Full Details
                      </Link>
                    </div>
                  )}

                  {isFreelancer && (
                    <div className="flex gap-2 mt-4 flex-wrap">
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

                    {/* Milestone list header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Milestones {cMilestones.length > 0 && `(${completedMilestones}/${cMilestones.length} done)`}
                      </h3>
                      {/* Both parties can add milestones */}
                      {!isDisputed && (
                        <button
                          onClick={() => setShowMilestoneForm(prev => ({ ...prev, [contract.id]: !prev[contract.id] }))}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          <HiPlus className="w-4 h-4" /> Add Milestone
                        </button>
                      )}
                    </div>

                    {/* Add milestone form */}
                    {showMilestoneForm[contract.id] && (
                      <form onSubmit={(e) => handleAddMilestone(e, contract.id)}
                        className="p-4 bg-white rounded-lg border border-indigo-100 space-y-3 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            value={cMilestoneForm.title}
                            onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, title: e.target.value } }))}
                            placeholder="Milestone title *"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <input
                            type="number"
                            value={cMilestoneForm.amount}
                            onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, amount: e.target.value } }))}
                            placeholder="Amount (₹) *"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                        <textarea
                          value={cMilestoneForm.description}
                          onChange={(e) => setMilestoneData(p => ({ ...p, [contract.id]: { ...cMilestoneForm, description: e.target.value } }))}
                          placeholder="Description (optional)"
                          rows={2}
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

                    {/* Milestone cards */}
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
                                {/* Client: approve milestone */}
                                {isClient && ms.status === 'IN_PROGRESS' && (
                                  <button
                                    onClick={() => handleApproveMilestone(contract.id, ms.id)}
                                    className="ml-3 px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex-shrink-0"
                                  >
                                    ✓ Approve
                                  </button>
                                )}
                              </div>

                              {/* Work submission section */}
                              {!isDisputed && (
                                <div className="mt-3 pt-3 border-t border-current border-opacity-10 space-y-2">
                                  {/* Freelancer: submit work */}
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
                                                <button
                                                  type="button"
                                                  onClick={() => setSubmitLinks(submitLinks.filter((_, i) => i !== idx))}
                                                  className="text-gray-400 hover:text-red-500"
                                                >
                                                  <HiX className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button
                                            type="button"
                                            onClick={() => setSubmitLinks([...submitLinks, ''])}
                                            className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                                          >
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
                                            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                          >
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

                                  {/* Latest submission card */}
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
                                          <button
                                            onClick={() => handleApproveSubmission(contract.id, latestSub.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                                          >
                                            ✓ Approve
                                          </button>
                                          <button
                                            onClick={() => handleRejectSubmission(contract.id, latestSub.id)}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                                          >
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

                    {/* Bottom quick links */}
                    <div className="flex gap-3 pt-2 border-t border-gray-200 flex-wrap">
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        <HiExternalLink className="w-4 h-4" /> View Full Contract & Sign
                      </Link>
                      {isClient && !isDisputed && (
                        <>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={() => handleInitiatePayment(contract.id, contract.totalAmount)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
                          >
                            <HiCurrencyRupee className="w-4 h-4" /> Initiate Payment
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={() => handleMarkComplete(contract.id)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                          >
                            <HiCheckCircle className="w-4 h-4" /> Mark Complete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}