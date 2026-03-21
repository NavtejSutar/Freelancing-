import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { freelancerService } from '../../api/freelancerService';
import { clientService } from '../../api/clientService';
import { skillService } from '../../api/skillService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPencil, HiSave, HiX, HiPlus, HiTrash } from 'react-icons/hi';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Skills state
  const [allSkills, setAllSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [addingSkill, setAddingSkill] = useState(null); // skillId being added
  const [removingSkill, setRemovingSkill] = useState(null); // skillId being removed

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'FREELANCER') {
          const { data } = await freelancerService.getMe();
          setProfile(data.data);
          setFormData({
            title: data.data?.title || '',
            bio: data.data?.bio || '',
            hourlyRate: data.data?.hourlyRate || '',
            availabilityStatus: data.data?.availabilityStatus || 'AVAILABLE',
            city: data.data?.city || '',
            country: data.data?.country || '',
          });
        } else if (user?.role === 'CLIENT') {
          const { data } = await clientService.getMe();
          setProfile(data.data);
          setFormData({
            bio: data.data?.bio || '',
            location: data.data?.location || '',
            phone: data.data?.phone || '',
          });
        }
      } catch {
        // Profile may not exist yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Load all available skills when freelancer opens the skill picker
  const loadAllSkills = async () => {
    if (allSkills.length > 0) return; // already loaded
    setSkillsLoading(true);
    try {
      const { data } = await skillService.getAll();
      setAllSkills(data.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleOpenSkillPicker = () => {
    setShowSkillPicker(true);
    loadAllSkills();
  };

  const handleAddSkill = async (skillId) => {
    setAddingSkill(skillId);
    try {
      await freelancerService.addSkill(skillId);
      // Refresh profile to get updated skills list
      const { data } = await freelancerService.getMe();
      setProfile(data.data);
      toast.success('Skill added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    } finally {
      setAddingSkill(null);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    setRemovingSkill(skillId);
    try {
      await freelancerService.removeSkill(skillId);
      // Refresh profile to get updated skills list
      const { data } = await freelancerService.getMe();
      setProfile(data.data);
      toast.success('Skill removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove skill');
    } finally {
      setRemovingSkill(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'FREELANCER') {
        let data;
        if (!profile) {
          ({ data } = await freelancerService.createMe({
            ...formData,
            hourlyRate: parseFloat(formData.hourlyRate) || 0,
          }));
        } else {
          ({ data } = await freelancerService.updateMe({
            ...formData,
            hourlyRate: parseFloat(formData.hourlyRate) || 0,
          }));
        }
        setProfile(data.data);
      } else if (user?.role === 'CLIENT') {
        let data;
        if (!profile) {
          ({ data } = await clientService.createMe(formData));
        } else {
          ({ data } = await clientService.updateMe(formData));
        }
        setProfile(data.data);
      }
      toast.success('Profile saved!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const mySkillIds = new Set((profile?.skills || []).map(s => s.id));
  const filteredSkills = allSkills.filter(s =>
    !mySkillIds.has(s.id) &&
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── User Info Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-xl">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* ── Profile Details Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
              <HiPencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
              >
                <HiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {user?.role === 'FREELANCER' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
              {editing ? (
                <input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Full Stack Developer"
                />
              ) : (
                <p className="text-gray-900">{profile?.title || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Tell clients about yourself..."
                />
              ) : (
                <p className="text-gray-900">{profile?.bio || 'No bio added'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-900">${profile?.hourlyRate || 0}/hr</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                {editing ? (
                  <select
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, availabilityStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="NOT_AVAILABLE">Not Available</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.availabilityStatus?.replace(/_/g, ' ') || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {editing ? (
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Mumbai"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.city || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                {editing ? (
                  <input
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. India"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.country || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Stats (read-only) */}
            {profile && (
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-lg font-bold text-gray-900">₹{profile.totalEarnings || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.avgRating ? `${profile.avgRating.toFixed(1)} ⭐` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Reviews</p>
                  <p className="text-lg font-bold text-gray-900">{profile.totalReviews || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {user?.role === 'CLIENT' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {editing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              ) : (
                <p className="text-gray-900">{profile?.bio || 'No bio added'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                {editing ? (
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.location || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.phone || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Skills Card (Freelancer only) ── */}
      {user?.role === 'FREELANCER' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
              <p className="text-xs text-gray-500 mt-0.5">Skills shown on your profile and matched to job listings</p>
            </div>
            {!showSkillPicker && (
              <button
                onClick={handleOpenSkillPicker}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                <HiPlus className="w-4 h-4" /> Add Skills
              </button>
            )}
          </div>

          {/* Current skills */}
          {(!profile?.skills || profile.skills.length === 0) && !showSkillPicker ? (
            <p className="text-sm text-gray-400">No skills added yet. Click "Add Skills" to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {(profile?.skills || []).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium group"
                >
                  {skill.name}
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    disabled={removingSkill === skill.id}
                    className="text-indigo-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove skill"
                  >
                    {removingSkill === skill.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <HiX className="w-3.5 h-3.5" />
                    )}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Skill picker */}
          {showSkillPicker && (
            <div className="border border-gray-200 rounded-lg p-4 mt-3 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Select skills to add</p>
                <button
                  onClick={() => { setShowSkillPicker(false); setSkillSearch(''); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3"
                autoFocus
              />

              {skillsLoading ? (
                <p className="text-sm text-gray-400 text-center py-4">Loading skills...</p>
              ) : filteredSkills.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  {allSkills.length === 0
                    ? 'No skills available. Ask an admin to add skills first.'
                    : 'No matching skills found.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => handleAddSkill(skill.id)}
                      disabled={addingSkill === skill.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {addingSkill === skill.id ? (
                        <span className="text-xs">Adding...</span>
                      ) : (
                        <>
                          <HiPlus className="w-3.5 h-3.5" /> {skill.name}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Click a skill to add it instantly. Skills are grouped by category in the admin panel.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}