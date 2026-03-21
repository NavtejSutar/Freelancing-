import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../../api/contractService';
import { paymentService } from '../../api/paymentService';
import { submissionService } from '../../api/submissionService';
import { reviewService } from '../../api/reviewService';
import { disputeService } from '../../api/disputeService';
import { messageService } from '../../api/messageService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPlus, HiCheckCircle, HiDownload, HiUpload, HiStar, HiExclamationCircle, HiChat, HiX } from 'react-icons/hi';

// ── PDF generation ──
const downloadContractPdf = async (contract, milestones) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20; const contentW = pageW - margin * 2; let y = 20;
  const line = (gap = 6) => { y += gap; };
  const text = (str, x, size = 10, style = 'normal', color = [30, 30, 30]) => {
    doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(...color);
    doc.text(String(str ?? ''), x, y);
  };
  const rule = () => { y += 3; doc.setDrawColor(210, 210, 210); doc.line(margin, y, margin + contentW, y); y += 6; };

  doc.setFillColor(67, 56, 202); doc.rect(0, 0, pageW, 28, 'F');
  doc.setFontSize(15); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text('FREELANCE SERVICE AGREEMENT', pageW / 2, 13, { align: 'center' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Contract #${contract.id}  ·  Status: ${contract.status}`, pageW / 2, 22, { align: 'center' });
  y = 40;
  text('PARTIES', margin, 11, 'bold', [67, 56, 202]); line(6);
  text(`Client:      ${contract.clientName}`, margin, 10); line(5);
  text(`Freelancer:  ${contract.freelancerName}`, margin, 10); line(5);
  rule();
  text('1. PROJECT', margin, 11, 'bold', [67, 56, 202]); line(6);
  text(`Title:  ${contract.title}`, margin, 10); line(5);
  if (contract.jobPostTitle) { text(`Job:    ${contract.jobPostTitle}`, margin, 10); line(5); }
  if (contract.description) {
    text('Scope:', margin, 10); line(5);
    const wrapped = doc.splitTextToSize(contract.description, contentW - 4);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(70, 70, 70);
    wrapped.forEach(l => { doc.text(l, margin + 4, y); y += 4.5; }); line(2);
  }
  rule();
  text('2. COMPENSATION', margin, 11, 'bold', [67, 56, 202]); line(6);
  text(`Total Amount:  ₹${contract.totalAmount}`, margin, 10, 'bold'); line(5);
  if (contract.startDate) { text(`Start Date:  ${new Date(contract.startDate).toLocaleDateString()}`, margin, 10); line(5); }
  if (contract.endDate) { text(`End Date:    ${new Date(contract.endDate).toLocaleDateString()}`, margin, 10); line(5); }
  rule();
  text('3. TERMS & CONDITIONS', margin, 11, 'bold', [67, 56, 202]); line(6);
  ['The Freelancer agrees to deliver work as described in the project scope.',
   'The Client agrees to provide timely feedback and required materials.',
   "Payment will be processed through the platform's escrow system.",
   "Either party may raise a dispute through the platform's dispute resolution system.",
   'This agreement is binding upon digital signature by both parties.'
  ].forEach((t, i) => { text(`${i + 1}. ${t}`, margin + 2, 9, 'normal', [60, 60, 60]); line(5); });
  rule();
  if (milestones && milestones.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    text('4. MILESTONES', margin, 11, 'bold', [67, 56, 202]); line(6);
    milestones.forEach((ms, i) => {
      text(`${i + 1}. ${ms.title}`, margin + 2, 10, 'bold'); line(5);
      if (ms.description) { text(`   ${ms.description}`, margin + 2, 9, 'normal', [80, 80, 80]); line(5); }
      const meta = [`Amount: ₹${ms.amount}`, ms.dueDate ? `Due: ${new Date(ms.dueDate).toLocaleDateString()}` : null, `Status: ${ms.status}`].filter(Boolean).join('   ·   ');
      text(`   ${meta}`, margin + 2, 9, 'normal', [110, 110, 110]); line(6);
    });
    rule();
  }
  if (y > 210) { doc.addPage(); y = 20; }
  text('5. SIGNATURES', margin, 11, 'bold', [67, 56, 202]); line(8);
  const boxH = 34; const colW = contentW / 2 - 3;
  [[margin, contract.clientName, contract.clientSignatureUrl, contract.clientSignedAt, 'CLIENT'],
   [margin + contentW / 2 + 3, contract.freelancerName, contract.freelancerSignatureUrl, contract.freelancerSignedAt, 'FREELANCER']
  ].forEach(([cx, name, sig, signedAt, label]) => {
    doc.setDrawColor(200, 200, 200); doc.rect(cx, y, colW, boxH);
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(100, 100, 100);
    doc.text(label, cx + 3, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(name ?? '', cx + 3, y + 11);
    if (sig?.startsWith('data:image')) { try { doc.addImage(sig, 'PNG', cx + 3, y + 13, 42, 12); } catch (_) {} }
    doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
    doc.text(signedAt ? `Signed: ${new Date(signedAt).toLocaleString()}` : 'Awaiting signature', cx + 3, y + 30);
  });
  y += boxH + 10;
  doc.setFontSize(8); doc.setTextColor(170, 170, 170);
  doc.text(`Generated on ${new Date().toLocaleString()}  ·  Nexus Freelancing Platform`, pageW / 2, y, { align: 'center' });
  doc.save(`Contract_${contract.id}_${contract.title.replace(/\s+/g, '_')}.pdf`);
};

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Signature
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [signatureMode, setSignatureMode] = useState('draw');
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);

  // Milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneData, setMilestoneData] = useState({ title: '', description: '', amount: '', dueDate: '' });

  // Work submission
  const [showSubmitWork, setShowSubmitWork] = useState(null);
  const [submitDescription, setSubmitDescription] = useState('');
  const [submitLinks, setSubmitLinks] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  // Review
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', description: '' });
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [resolvingDisputeId, setResolvingDisputeId] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState('');

  const loadData = () => {
    Promise.all([
      contractService.getById(id),
      contractService.getMilestones(id),
      submissionService.getByContract(id).catch(() => ({ data: { data: [] } })),
      reviewService.getByContract(id).catch(() => ({ data: { data: { content: [] } } })),
      disputeService.getByContract(id).catch(() => ({ data: { data: { content: [] } } })),
    ]).then(([contRes, msRes, subRes, revRes, disRes]) => {
      setContract(contRes.data.data);
      setMilestones(msRes.data.data || contRes.data.data?.milestones || []);
      setSubmissions(subRes.data.data || []);
      setReviews(revRes.data.data?.content || revRes.data.data || []);
      setDisputes(disRes.data.data?.content || disRes.data.data || []);
    }).catch(() => toast.error('Failed to load contract'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [id]);

  // Canvas signing
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left, y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top };
  };
  const startDraw = (e) => { e.preventDefault(); setIsDrawing(true); setHasSigned(true); setLastPos(getPos(e, canvasRef.current)); };
  const draw = (e) => {
    e.preventDefault(); if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d'); const pos = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.x, lastPos.y); ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke(); setLastPos(pos);
  };
  const stopDraw = () => setIsDrawing(false);
  const clearSignature = () => {
    if (canvasRef.current) canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasSigned(false); setSignaturePreview(null);
  };

  const handleAcceptContract = async () => {
    if (!hasSigned) { toast.error('Please provide your signature before accepting'); return; }
    setActing(true);
    try {
      const sig = signatureMode === 'upload' && signaturePreview ? signaturePreview : canvasRef.current.toDataURL('image/png');
      const { data } = await contractService.accept(id, sig);
      toast.success(data.message || 'Contract signed!');
      setContract(data.data); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to sign contract'); }
    finally { setActing(false); }
  };

  const handleContractAction = async (action) => {
    setActing(true);
    try {
      if (action === 'complete') await contractService.complete(id);
      if (action === 'cancel') await contractService.cancel(id);
      toast.success(`Contract ${action}d`); loadData();
    } catch (err) { toast.error(err.response?.data?.message || `Failed to ${action}`); }
    finally { setActing(false); }
  };

  const handleInitiatePayment = async () => {
    if (!window.confirm(`Initiate payment of ₹${contract.totalAmount} for this contract?\n\nThis creates a payment record that an admin will confirm. After initiating payment you can then mark the contract complete.`)) return;
    try {
      await paymentService.initiate(id);
      toast.success('Payment initiated — you can now mark the contract as complete after admin confirmation');
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initiate payment'); }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault(); setActing(true);
    try {
      await contractService.createMilestone(id, { ...milestoneData, amount: parseFloat(milestoneData.amount) });
      toast.success('Milestone added'); setShowMilestoneForm(false);
      setMilestoneData({ title: '', description: '', amount: '', dueDate: '' }); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add milestone'); }
    finally { setActing(false); }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    try { await contractService.completeMilestone(id, milestoneId); toast.success('Milestone approved'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSubmitWork = async (milestoneId) => {
    if (!submitDescription.trim()) { toast.error('Please describe your submission'); return; }
    setSubmitting(true);
    try {
      const validLinks = submitLinks.filter(l => l.trim());
      await submissionService.create({ milestoneId, description: submitDescription.trim(), attachmentUrls: validLinks });
      toast.success('Work submitted! Awaiting client review.');
      setShowSubmitWork(null); setSubmitDescription(''); setSubmitLinks(['']); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit work'); }
    finally { setSubmitting(false); }
  };

  const handleApproveSubmission = async (subId) => {
    try { await submissionService.approve(subId); toast.success('Submission approved'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleRejectSubmission = async (subId) => {
    try { await submissionService.reject(subId); toast.success('Revision requested'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault(); setSubmittingReview(true);
    try {
      await reviewService.create({ contractId: parseInt(id), rating: reviewData.rating, comment: reviewData.comment.trim() });
      toast.success('Review submitted!'); setShowReviewForm(false); setReviewData({ rating: 5, comment: '' }); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingReview(false); }
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault(); setSubmittingDispute(true);
    try {
      await disputeService.create({ contractId: parseInt(id), reason: disputeData.reason.trim(), description: disputeData.description.trim() });
      toast.success('Dispute raised — admin has been notified'); setShowDisputeForm(false);
      setDisputeData({ reason: '', description: '' }); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to raise dispute'); }
    finally { setSubmittingDispute(false); }
  };

  const handleResolveDispute = async (disputeId) => {
    if (!disputeResolution.trim()) { toast.error('Please enter a resolution'); return; }
    try {
      await disputeService.resolve(disputeId, disputeResolution.trim());
      toast.success('Dispute resolved — contract is now active again');
      setResolvingDisputeId(null); setDisputeResolution(''); loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to resolve dispute'); }
  };

  const handleMessageOtherParty = async () => {
    const otherUserId = isClient ? contract.freelancerUserId : contract.clientUserId;
    try {
      const { data } = await messageService.createThread({
        subject: `Re: ${contract.title}`,
        participantIds: [otherUserId],
        contractId: parseInt(id),
      });
      navigate(`/messages/${data.data.id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start conversation'); }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try { await downloadContractPdf(contract, milestones); toast.success('Contract PDF downloaded!'); }
    catch (err) { console.error(err); toast.error('Failed to generate PDF'); }
    finally { setDownloading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!contract) return <div className="text-center py-12 text-gray-500">Contract not found</div>;

  const isPendingAcceptance = contract.status === 'PENDING_ACCEPTANCE';
  const isActive = contract.status === 'ACTIVE';
  const isDisputed = contract.status === 'DISPUTED';
  const isCompleted = contract.status === 'COMPLETED';
  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';
  const alreadySigned = (isClient && contract.clientAccepted) || (isFreelancer && contract.freelancerAccepted);
  const mySignatureUrl = isClient ? contract.clientSignatureUrl : contract.freelancerSignatureUrl;
  const mySignedAt = isClient ? contract.clientSignedAt : contract.freelancerSignedAt;
  const hasReviewed = reviews.some(r => r.reviewerId === user?.id);
  // openDispute: if an OPEN dispute exists, hide the "Raise Dispute" button so users can't create duplicates
  const openDispute = disputes.find(d => d.status === 'OPEN');

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Formal Contract Document ── */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
        <div className="bg-indigo-700 text-white px-8 py-6 text-center">
          <h1 className="text-2xl font-bold tracking-wide">FREELANCE SERVICE AGREEMENT</h1>
          <p className="text-indigo-200 text-sm mt-1">Contract #{contract.id}</p>
        </div>

        <div className="px-8 py-6 space-y-5 text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-2 gap-6">
            {[['Client', contract.clientName], ['Freelancer', contract.freelancerName]].map(([role, name]) => (
              <div key={role} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">{role}</p>
                <p className="font-semibold text-gray-900">{name}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-900 mb-2">1. Project</p>
            <p><strong>Title:</strong> {contract.title}</p>
            {contract.description && <p className="mt-1"><strong>Scope:</strong> {contract.description}</p>}
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-900 mb-2">2. Compensation</p>
            <p>The Client agrees to pay the Freelancer a total of <strong>₹{contract.totalAmount}</strong> upon satisfactory completion.</p>
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-900 mb-2">3. Terms</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>The Freelancer agrees to deliver work as described in the project scope.</li>
              <li>The Client agrees to provide timely feedback and required materials.</li>
              <li>Payment will be processed through the platform's escrow system.</li>
              <li>Either party may raise a dispute through the platform's dispute resolution system.</li>
              <li>This agreement is binding upon digital signature by both parties.</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-900 mb-2">4. Job Reference</p>
            <p>This contract is associated with job posting: <strong>{contract.jobPostTitle}</strong></p>
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-900 mb-3">5. Signatures</p>
            <div className="grid grid-cols-2 gap-6">
              {[['Client', contract.clientName, contract.clientSignatureUrl, contract.clientSignedAt],
                ['Freelancer', contract.freelancerName, contract.freelancerSignatureUrl, contract.freelancerSignedAt]
              ].map(([role, name, sigUrl, signedAt]) => (
                <div key={role} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">{role} — {name}</p>
                  {sigUrl ? (
                    <div>
                      <img src={sigUrl} alt={`${role} signature`} className="max-h-16 border border-gray-100 rounded" />
                      <p className="text-xs text-green-600 mt-1">✓ Signed {signedAt ? new Date(signedAt).toLocaleString() : ''}</p>
                    </div>
                  ) : (
                    <div className="h-16 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-xs">Awaiting signature</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={handleDownloadPdf} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors">
            <HiDownload className="w-4 h-4" />
            {downloading ? 'Generating PDF...' : 'Download Contract PDF'}
          </button>
        </div>

        {/* Signature section */}
        {isPendingAcceptance && (
          !alreadySigned ? (
            <div className="border-t bg-blue-50 px-8 py-6">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Sign this Contract</h3>
              <p className="text-sm text-blue-700 mb-4">By signing you agree to all terms in this agreement.</p>
              <div className="flex gap-3 mb-4">
                {['draw', 'upload'].map((mode) => (
                  <button key={mode} type="button" onClick={() => { setSignatureMode(mode); clearSignature(); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${signatureMode === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                    {mode === 'draw' ? 'Draw Signature' : 'Upload Signature Image'}
                  </button>
                ))}
              </div>
              {signatureMode === 'draw' ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Draw your signature:</p>
                  <canvas ref={canvasRef} width={500} height={120}
                    className="border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair w-full max-w-lg"
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
                  <button onClick={clearSignature} className="mt-1 text-xs text-gray-400 hover:text-red-500">Clear</button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload an image of your signature (PNG or JPG):</p>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0]; if (!file) return;
                    setHasSigned(true);
                    const reader = new FileReader();
                    reader.onload = (ev) => setSignaturePreview(ev.target.result);
                    reader.readAsDataURL(file);
                  }} className="block text-sm text-gray-600" />
                  {signaturePreview && <img src={signaturePreview} alt="Signature preview" className="mt-2 max-h-20 border border-gray-200 rounded" />}
                </div>
              )}
              <button onClick={handleAcceptContract} disabled={acting || !hasSigned}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm">
                {acting ? 'Signing...' : 'Sign & Accept Contract'}
              </button>
            </div>
          ) : (
            <div className="border-t bg-green-50 px-8 py-4 flex items-center gap-3">
              <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">You have signed this contract.</p>
                {mySignedAt && <p className="text-xs text-green-600">Signed on {new Date(mySignedAt).toLocaleString()}</p>}
                {mySignatureUrl && <img src={mySignatureUrl} alt="Your signature" className="mt-1 max-h-10" />}
                <p className="text-xs text-gray-500 mt-1">
                  {isClient
                    ? (contract.freelancerAccepted ? 'Freelancer has also signed — contract is now ACTIVE.' : 'Waiting for freelancer to sign.')
                    : (contract.clientAccepted ? 'Client has also signed — contract is now ACTIVE.' : 'Waiting for client to sign.')}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Contract Info Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contract.clientName} ↔ {contract.freelancerName}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Amount', value: `₹${contract.totalAmount}`, big: true },
            { label: 'Start Date', value: contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '—' },
            { label: 'End Date', value: contract.endDate ? new Date(contract.endDate).toLocaleDateString() : '—' },
            { label: 'Milestones', value: milestones.length, big: true },
          ].map(item => (
            <div key={item.label} className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`${item.big ? 'text-lg font-bold' : 'text-sm font-medium'} text-gray-900`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          {isActive && isClient && (
            <>
              <button onClick={handleInitiatePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                💳 Initiate Payment
              </button>
              <button onClick={() => handleContractAction('complete')} disabled={acting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                ✓ Mark Complete
              </button>
              <button onClick={() => handleContractAction('cancel')} disabled={acting}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm">
                Cancel Contract
              </button>
            </>
          )}
          <button onClick={handleDownloadPdf} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm">
            <HiDownload className="w-4 h-4" /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
          {(isActive || isCompleted || isPendingAcceptance) && (isClient || isFreelancer) && (
            <button onClick={handleMessageOtherParty}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm">
              <HiChat className="w-4 h-4" /> Message {isClient ? contract.freelancerName?.split(' ')[0] : contract.clientName?.split(' ')[0]}
            </button>
          )}
          {/* Only show Raise Dispute when contract is active AND there is no open dispute already */}
          {(isActive || isDisputed) && !openDispute && (
            <button onClick={() => setShowDisputeForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
              <HiExclamationCircle className="w-4 h-4" /> Raise Dispute
            </button>
          )}
          {isCompleted && !hasReviewed && (
            <button onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm">
              <HiStar className="w-4 h-4" /> Leave Review
            </button>
          )}
        </div>

        {isDisputed && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">This contract is under dispute. Actions are paused until resolved.</p>
          </div>
        )}
      </div>

      {/* ── Disputes Panel ── */}
      {disputes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <HiExclamationCircle className="w-5 h-5" /> Disputes
          </h2>
          <div className="space-y-4">
            {disputes.map((d) => {
              const isInitiator = d.initiatorId === user?.id;
              // Only the person who raised the dispute can resolve it from here.
              // Admin resolves from the Admin Disputes panel.
              const canResolve = isInitiator && d.status === 'OPEN';
              return (
                <div key={d.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{d.reason}</p>
                      {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Raised by {d.initiatorName} · {new Date(d.createdAt).toLocaleString()}
                      </p>
                      {d.resolution && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700">Resolution:</p>
                          <p className="text-sm text-gray-600">{d.resolution}</p>
                        </div>
                      )}
                    </div>
                    <StatusBadge status={d.status} />
                  </div>

                  {canResolve && (
                    <div className="mt-3 pt-3 border-t border-red-100">
                      {resolvingDisputeId === d.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={disputeResolution}
                            onChange={(e) => setDisputeResolution(e.target.value)}
                            placeholder="Describe how the issue was resolved or why you are withdrawing this dispute..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-300 outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleResolveDispute(d.id)}
                              className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-medium">
                              Confirm Resolution
                            </button>
                            <button onClick={() => { setResolvingDisputeId(null); setDisputeResolution(''); }}
                              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setResolvingDisputeId(d.id)}
                          className="text-sm text-green-700 font-semibold hover:underline">
                          ✓ Mark as Resolved / Withdraw Dispute
                        </button>
                      )}
                    </div>
                  )}

                  {d.status === 'OPEN' && !isInitiator && (
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Only the person who raised this dispute can resolve it. An admin can also intervene from the admin panel.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Raise Dispute form ── */}
      {showDisputeForm && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-1 flex items-center gap-2">
            <HiExclamationCircle className="w-5 h-5" /> Raise a Dispute
          </h2>
          <p className="text-sm text-gray-500 mb-4">Describe the issue. The admin will be notified and will mediate.</p>
          <form onSubmit={handleSubmitDispute} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <input value={disputeData.reason} onChange={(e) => setDisputeData(p => ({ ...p, reason: e.target.value }))}
                required placeholder="e.g. Deliverable not as agreed, Payment not received..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea value={disputeData.description} onChange={(e) => setDisputeData(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Provide as much detail as possible..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submittingDispute}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium">
                {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <button type="button" onClick={() => setShowDisputeForm(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Leave Review ── */}
      {showReviewForm && !hasReviewed && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <HiStar className="w-5 h-5 text-yellow-500" /> Leave a Review
          </h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewData(p => ({ ...p, rating: star }))}
                    className={`text-2xl transition-colors ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
                <span className="ml-2 text-sm text-gray-500 self-center">{reviewData.rating}/5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea value={reviewData.comment} onChange={(e) => setReviewData(p => ({ ...p, comment: e.target.value }))}
                rows={3} placeholder="Describe your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submittingReview}
                className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 text-sm font-medium">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowReviewForm(false)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-gray-500">by {r.reviewerName}</span>
                  <span className="text-xs text-gray-400">· {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Milestones ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
          {isActive && (isClient || isFreelancer) && (
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
              <HiPlus className="w-4 h-4" /> Add Milestone
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={handleAddMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <input value={milestoneData.title} onChange={(e) => setMilestoneData(p => ({ ...p, title: e.target.value }))}
              placeholder="Milestone title" required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            <textarea value={milestoneData.description} onChange={(e) => setMilestoneData(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optional)" rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={milestoneData.amount} onChange={(e) => setMilestoneData(p => ({ ...p, amount: e.target.value }))}
                placeholder="Amount (₹)" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="date" value={milestoneData.dueDate} onChange={(e) => setMilestoneData(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={acting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">Add</button>
              <button type="button" onClick={() => setShowMilestoneForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        )}

        {milestones.length === 0 ? (
          <p className="text-gray-500 text-sm">No milestones yet. {isActive ? 'Add one to track progress.' : ''}</p>
        ) : (
          <div className="space-y-4">
            {milestones.map((ms) => {
              const msSubmissions = submissions.filter(s => s.milestoneId === ms.id);
              const latestSub = msSubmissions[msSubmissions.length - 1];
              return (
                <div key={ms.id} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ms.title}</p>
                      {ms.description && <p className="text-sm text-gray-600 mt-1">{ms.description}</p>}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>₹{ms.amount}</span>
                        {ms.dueDate && <span>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={ms.status} />
                      {ms.status === 'IN_PROGRESS' && isClient && (
                        <button onClick={() => handleCompleteMilestone(ms.id)}
                          className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Approve</button>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                      {isFreelancer && (ms.status === 'PENDING' || ms.status === 'IN_PROGRESS') && (
                        showSubmitWork === ms.id ? (
                          <div className="space-y-2">
                            <textarea value={submitDescription} onChange={(e) => setSubmitDescription(e.target.value)}
                              placeholder="Describe what you've completed..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                                📁 Attach file/folder links (Google Drive, GitHub, Dropbox, etc.)
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
                                    <button type="button" onClick={() => setSubmitLinks(submitLinks.filter((_, i) => i !== idx))}
                                      className="text-gray-400 hover:text-red-500">
                                      <HiX className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button type="button" onClick={() => setSubmitLinks([...submitLinks, ''])}
                                className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1 mt-1">
                                <HiPlus className="w-3.5 h-3.5" /> Add another link
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleSubmitWork(ms.id)} disabled={submitting}
                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                                <HiUpload className="w-3.5 h-3.5" />
                                {submitting ? 'Submitting...' : 'Submit Work'}
                              </button>
                              <button onClick={() => { setShowSubmitWork(null); setSubmitDescription(''); setSubmitLinks(['']); }}
                                className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setShowSubmitWork(ms.id)}
                            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500">
                            <HiUpload className="w-4 h-4" /> Submit Work for this Milestone
                          </button>
                        )
                      )}

                      {latestSub && (
                        <div className={`p-3 rounded-lg text-sm ${
                          latestSub.status === 'APPROVED' ? 'bg-green-50 border border-green-100' :
                          latestSub.status === 'REJECTED' ? 'bg-red-50 border border-red-100' :
                          'bg-blue-50 border border-blue-100'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 text-xs uppercase">Latest Submission</p>
                            <StatusBadge status={latestSub.status} />
                          </div>
                          {latestSub.description && <p className="text-gray-700">{latestSub.description}</p>}
                          {latestSub.attachmentUrls && latestSub.attachmentUrls.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-500 font-medium">📁 Attached files/folders:</p>
                              {latestSub.attachmentUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 underline break-all">
                                  🔗 {url}
                                </a>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(latestSub.createdAt || latestSub.submittedAt).toLocaleString()}
                          </p>
                          {isClient && latestSub.status === 'PENDING' && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleApproveSubmission(latestSub.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Approve</button>
                              <button onClick={() => handleRejectSubmission(latestSub.id)}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100">Request Revision</button>
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
      </div>
    </div>
  );
}