import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractService } from '../../api/contractService';
import { fileService } from '../../api/fileService';
import { paymentService } from '../../api/paymentService';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPlus, HiCheckCircle, HiClock, HiPencil, HiTrash } from 'react-icons/hi';

export default function ContractDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // Signature state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' or 'upload'
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);

  // Milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneData, setMilestoneData] = useState({ title: '', description: '', amount: '', dueDate: '' });

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

  // Canvas drawing
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    setIsDrawing(true);
    setHasSigned(true);
    setLastPos(getPos(e, canvas));
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSigned(false);
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSignatureFile(file);
    setHasSigned(true);
    const reader = new FileReader();
    reader.onload = (ev) => setSignaturePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const getSignatureBlob = () => {
    return new Promise((resolve) => {
      if (signatureMode === 'upload' && signatureFile) {
        resolve(signatureFile);
      } else {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      }
    });
  };

  const handleAcceptContract = async () => {
    if (!hasSigned) {
      toast.error('Please provide your signature before accepting');
      return;
    }
    setActing(true);
    try {
      // Upload the signature image first
      const blob = await getSignatureBlob();
      const file = blob instanceof File ? blob : new File([blob], 'signature.png', { type: 'image/png' });
      const { data: uploadData } = await fileService.uploadSignature(file);
      const signatureUrl = uploadData.data?.url;

      // Now accept the contract with the signature URL
      const { data } = await contractService.accept(id, signatureUrl);
      toast.success(data.message || 'Contract signed!');
      setContract(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign contract');
    } finally {
      setActing(false);
    }
  };

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
      toast.success('Milestone approved');
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

  const isPendingAcceptance = contract.status === 'PENDING_ACCEPTANCE';
  const isClient = user?.role === 'CLIENT';
  const isFreelancer = user?.role === 'FREELANCER';
  const alreadySigned = (isClient && contract.clientAccepted) || (isFreelancer && contract.freelancerAccepted);
  const mySignatureUrl = isClient ? contract.clientSignatureUrl : contract.freelancerSignatureUrl;
  const mySignedAt = isClient ? contract.clientSignedAt : contract.freelancerSignedAt;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Formal Contract Document ── */}
      {isPendingAcceptance && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-700 text-white px-8 py-6 text-center">
            <h1 className="text-2xl font-bold tracking-wide">FREELANCE SERVICE AGREEMENT</h1>
            <p className="text-indigo-200 text-sm mt-1">Contract #{contract.id}</p>
          </div>

          {/* Contract Body */}
          <div className="px-8 py-6 space-y-5 text-sm text-gray-700 leading-relaxed">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Client</p>
                <p className="font-semibold text-gray-900">{contract.clientName}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Freelancer</p>
                <p className="font-semibold text-gray-900">{contract.freelancerName}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900 mb-2">1. Project</p>
              <p><strong>Title:</strong> {contract.title}</p>
              {contract.description && <p className="mt-1"><strong>Scope:</strong> {contract.description}</p>}
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900 mb-2">2. Compensation</p>
              <p>The Client agrees to pay the Freelancer a total of <strong>₹{contract.totalAmount}</strong> upon satisfactory completion of the agreed deliverables.</p>
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

            {/* Signatures display */}
            <div className="border-t pt-4">
              <p className="font-semibold text-gray-900 mb-3">5. Signatures</p>
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Client — {contract.clientName}</p>
                  {contract.clientSignatureUrl ? (
                    <div>
                      <img src={contract.clientSignatureUrl} alt="Client signature" className="max-h-16 border border-gray-100 rounded" />
                      <p className="text-xs text-green-600 mt-1">✓ Signed {contract.clientSignedAt ? new Date(contract.clientSignedAt).toLocaleString() : ''}</p>
                    </div>
                  ) : (
                    <div className="h-16 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-xs">Awaiting signature</div>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Freelancer — {contract.freelancerName}</p>
                  {contract.freelancerSignatureUrl ? (
                    <div>
                      <img src={contract.freelancerSignatureUrl} alt="Freelancer signature" className="max-h-16 border border-gray-100 rounded" />
                      <p className="text-xs text-green-600 mt-1">✓ Signed {contract.freelancerSignedAt ? new Date(contract.freelancerSignedAt).toLocaleString() : ''}</p>
                    </div>
                  ) : (
                    <div className="h-16 flex items-center justify-center bg-gray-50 rounded text-gray-400 text-xs">Awaiting signature</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          {!alreadySigned ? (
            <div className="border-t bg-blue-50 px-8 py-6">
              <h3 className="text-base font-semibold text-blue-900 mb-1">Sign this Contract</h3>
              <p className="text-sm text-blue-700 mb-4">By signing below you agree to all terms stated in this agreement.</p>

              {/* Mode toggle */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => { setSignatureMode('draw'); clearSignature(); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${signatureMode === 'draw' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => { setSignatureMode('upload'); clearSignature(); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${signatureMode === 'upload' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  Upload Signature Image
                </button>
              </div>

              {signatureMode === 'draw' ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Draw your signature in the box below:</p>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    className="border-2 border-dashed border-gray-300 rounded-lg bg-white cursor-crosshair w-full max-w-lg"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                  <button onClick={clearSignature} className="mt-1 text-xs text-gray-400 hover:text-red-500">Clear</button>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload an image of your signature (PNG or JPG):</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileChange}
                    className="block text-sm text-gray-600"
                  />
                  {signaturePreview && (
                    <img src={signaturePreview} alt="Signature preview" className="mt-2 max-h-20 border border-gray-200 rounded" />
                  )}
                </div>
              )}

              <button
                onClick={handleAcceptContract}
                disabled={acting || !hasSigned}
                className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium text-sm"
              >
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
                  {isClient ? (contract.freelancerAccepted ? 'Freelancer has also signed — contract is now ACTIVE.' : 'Waiting for freelancer to sign.') : (contract.clientAccepted ? 'Client has also signed — contract is now ACTIVE.' : 'Waiting for client to sign.')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Contract Info Card (always shown) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{contract.clientName} ↔ {contract.freelancerName}</p>
          </div>
          <StatusBadge status={contract.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">₹{contract.totalAmount}</p>
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

        <div className="flex gap-3 flex-wrap">
          {contract.status === 'ACTIVE' && isClient && (
            <>
              <button onClick={() => handleContractAction('complete')} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Mark Complete</button>
              <button onClick={() => handleContractAction('cancel')} disabled={acting} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50">Cancel Contract</button>
              <button onClick={handleInitiatePayment} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Initiate Payment</button>
            </>
          )}
        </div>
      </div>

      {/* ── Milestones ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
          {contract.status === 'ACTIVE' && isClient && (
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
              <HiPlus className="w-4 h-4" /> Add Milestone
            </button>
          )}
        </div>

        {showMilestoneForm && (
          <form onSubmit={handleAddMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <input value={milestoneData.title} onChange={(e) => setMilestoneData(p => ({ ...p, title: e.target.value }))} placeholder="Milestone title" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            <textarea value={milestoneData.description} onChange={(e) => setMilestoneData(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={milestoneData.amount} onChange={(e) => setMilestoneData(p => ({ ...p, amount: e.target.value }))} placeholder="Amount (₹)" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="date" value={milestoneData.dueDate} onChange={(e) => setMilestoneData(p => ({ ...p, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">Add</button>
              <button type="button" onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Cancel</button>
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
                      <span>₹{ms.amount}</span>
                      {ms.dueDate && <span>Due: {new Date(ms.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ms.status} />
                    {ms.status === 'IN_PROGRESS' && isClient && (
                      <button onClick={() => handleCompleteMilestone(ms.id)} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Approve</button>
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