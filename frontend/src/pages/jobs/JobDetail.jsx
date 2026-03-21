import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../api/jobService';
import { proposalService } from '../../api/proposalService';
import { fileService } from '../../api/fileService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiCurrencyDollar, HiBriefcase, HiClock, HiUserGroup, HiUpload, HiDocumentText, HiX } from 'react-icons/hi';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({ coverLetter: '', bidAmount: '', estimatedDuration: '' });
  const [submitting, setSubmitting] = useState(false);

  // Cover letter PDF upload state
  const [coverLetterMode, setCoverLetterMode] = useState('type'); // 'type' | 'upload'
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    jobService.getById(id)
      .then(({ data }) => setJob(data.data))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

    if (user?.role === 'CLIENT') {
      proposalService.getByJob(id, 0, 50)
        .then(({ data }) => setProposals(data.data?.content || []))
        .catch(() => {});
    }
  }, [id, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('PDF must be under 10MB');
      e.target.value = '';
      return;
    }
    setCoverLetterFile(file);
  };

  const clearCoverLetterFile = () => {
    setCoverLetterFile(null);
    const input = document.getElementById('coverLetterPdfInput');
    if (input) input.value = '';
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();

    // Validation
    if (coverLetterMode === 'upload' && !coverLetterFile) {
      toast.error('Please select a PDF file for your cover letter');
      return;
    }
    if (coverLetterMode === 'type' && !proposalData.coverLetter.trim()) {
      toast.error('Please write your cover letter');
      return;
    }

    setSubmitting(true);
    let coverLetterPdfUrl = null;
    let coverLetterText = proposalData.coverLetter.trim();

    try {
      // If freelancer uploaded a PDF, upload it first then attach the URL
      if (coverLetterMode === 'upload' && coverLetterFile) {
        setUploading(true);
        try {
          coverLetterPdfUrl = await fileService.uploadPdf(coverLetterFile);
        } catch (uploadErr) {
          toast.error(uploadErr.message || 'Failed to upload PDF. Please try again.');
          setSubmitting(false);
          setUploading(false);
          return;
        }
        setUploading(false);
        // Backend requires coverLetter to be non-blank, so use filename as fallback text
        if (!coverLetterText) {
          coverLetterText = `Cover letter attached as PDF: ${coverLetterFile.name}`;
        }
      }

      await proposalService.create({
        ...proposalData,
        coverLetter: coverLetterText,
        jobPostId: parseInt(id),
        proposedRate: parseFloat(proposalData.bidAmount),
        coverLetterPdfUrl, // null if typed, server URL if uploaded
      });

      toast.success('Proposal submitted!');
      setShowProposalForm(false);
      setProposalData({ coverLetter: '', bidAmount: '', estimatedDuration: '' });
      setCoverLetterFile(null);
      setCoverLetterMode('type');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await jobService.delete(id);
      toast.success('Job deleted');
      navigate('/jobs/my');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: HiCurrencyDollar, label: 'Budget', value: `$${job.budgetMin} - $${job.budgetMax}` },
            { icon: HiBriefcase, label: 'Type', value: job.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly' },
            { icon: HiClock, label: 'Duration', value: job.expectedDuration || 'Not specified' },
            { icon: HiUserGroup, label: 'Experience', value: job.experienceLevel?.replace(/_/g, ' ') || 'Any' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <item.icon className="w-5 h-5 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill.id || skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {user?.role === 'FREELANCER' && job.status === 'OPEN' && (
            <button
              onClick={() => setShowProposalForm(!showProposalForm)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showProposalForm ? 'Cancel' : 'Submit Proposal'}
            </button>
          )}
          {/* Only show Edit/Delete if this client owns the job */}
          {user?.role === 'CLIENT' && job.clientUserId === user?.id && (
            <>
              <Link to={`/jobs/${id}/edit`} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Edit
              </Link>
              <button onClick={handleDeleteJob} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showProposalForm && (
        <form onSubmit={handleSubmitProposal} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Submit Your Proposal</h2>

          {/* Cover Letter Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter</label>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setCoverLetterMode('type'); clearCoverLetterFile(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  coverLetterMode === 'type'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <HiDocumentText className="w-4 h-4" /> Type Cover Letter
              </button>
              <button
                type="button"
                onClick={() => setCoverLetterMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  coverLetterMode === 'upload'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <HiUpload className="w-4 h-4" /> Upload PDF
              </button>
            </div>

            {coverLetterMode === 'type' ? (
              <textarea
                value={proposalData.coverLetter}
                onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Explain why you're the best fit for this project..."
              />
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-5">
                  {!coverLetterFile ? (
                    <div className="text-center">
                      <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">Upload your cover letter as a PDF file</p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                        <HiUpload className="w-4 h-4" /> Choose PDF File
                        <input
                          id="coverLetterPdfInput"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">PDF only · Max 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-2xl">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{coverLetterFile.name}</p>
                          <p className="text-xs text-gray-500">{(coverLetterFile.size / 1024).toFixed(1)} KB · PDF</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearCoverLetterFile}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Optional extra note alongside the PDF */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Optional note to accompany your PDF</label>
                  <textarea
                    value={proposalData.coverLetter}
                    onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Add a brief note alongside your PDF (optional)..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
              <input
                type="number"
                value={proposalData.bidAmount}
                onChange={(e) => setProposalData(prev => ({ ...prev, bidAmount: e.target.value }))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration</label>
              <input
                value={proposalData.estimatedDuration}
                onChange={(e) => setProposalData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="e.g. 2 weeks"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <><span className="animate-spin inline-block">⏳</span> Uploading PDF...</>
            ) : submitting ? (
              'Submitting...'
            ) : (
              'Submit Proposal'
            )}
          </button>
        </form>
      )}

      {user?.role === 'CLIENT' && job.clientUserId === user?.id && proposals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Proposals ({proposals.length})</h2>
          <div className="space-y-3">
            {proposals.map((p) => (
              <Link key={p.id} to={`/proposals/${p.id}`} className="block p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{p.freelancerName || 'Freelancer'}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.coverLetter}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm font-medium text-indigo-600">${p.proposedRate}</p>
                      {p.coverLetterPdfUrl && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                          📄 PDF attached
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}