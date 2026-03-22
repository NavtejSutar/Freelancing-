import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { freelancerService } from '../../api/freelancerService';
import { clientService } from '../../api/clientService';
import { skillService } from '../../api/skillService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPencil, HiSave, HiX, HiPlus } from 'react-icons/hi';

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildFreelancerForm = (d) => ({
  title: d?.title || '',
  bio: d?.bio || '',
  hourlyRate: d?.hourlyRate || '',
  availabilityStatus: d?.availabilityStatus || 'AVAILABLE',
  jobStatus: d?.jobStatus || 'FULL_TIME',
  city: d?.city || '',
  country: d?.country || '',
});

const buildClientForm = (d) => ({
  industry: d?.industry || '',
  website: d?.website || '',
  city: d?.city || '',
  country: d?.country || '',
  bio: d?.bio || '',
  location: d?.location || '',
  phone: d?.phone || '',
});

const jobStatusLabel = (val) =>
  val === 'PART_TIME' ? 'Part Time Freelancer' : 'Full Time Freelancer';

const COUNTRY_OPTIONS = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czechia',
  'Democratic Republic of the Congo',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user } = useAuth();
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
  const [addingSkill, setAddingSkill] = useState(null);
  const [removingSkill, setRemovingSkill] = useState(null);

  // ── Re-sync formData every time profile changes (after load or save) ─────────
  useEffect(() => {
    if (user?.role === 'FREELANCER') {
      setFormData(buildFreelancerForm(profile));
    } else if (user?.role === 'CLIENT') {
      setFormData(buildClientForm(profile));
    }
  }, [profile, user?.role]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'FREELANCER') {
          const { data } = await freelancerService.getMe();
          setProfile(data.data);
        } else if (user?.role === 'CLIENT') {
          const { data } = await clientService.getMe();
          setProfile(data.data);
        }
      } catch {
        // Profile may not exist yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ── Cancel: discard edits ─────────────────────────────────────────────────────
  const handleCancel = () => {
    // reset formData back to whatever is currently saved in profile
    if (user?.role === 'FREELANCER') setFormData(buildFreelancerForm(profile));
    else setFormData(buildClientForm(profile));
    setEditing(false);
  };

  // ── Skills ────────────────────────────────────────────────────────────────────
  const loadAllSkills = async () => {
    if (allSkills.length > 0) return;
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
      const { data } = await freelancerService.getMe();
      setProfile(data.data);
      toast.success('Skill removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove skill');
    } finally {
      setRemovingSkill(null);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'FREELANCER') {
        const payload = {
          ...formData,
          hourlyRate: parseFloat(formData.hourlyRate) || 0,
          // Ensure jobStatus is always sent as the exact enum string the backend expects
          jobStatus: formData.jobStatus || 'FULL_TIME',
        };
        const { data } = profile
          ? await freelancerService.updateMe(payload)
          : await freelancerService.createMe(payload);
        setProfile(data.data); // triggers useEffect above → formData re-synced automatically
      } else if (user?.role === 'CLIENT') {
        const { data } = profile
          ? await clientService.updateMe(formData)
          : await clientService.createMe(formData);
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

  // ── Render ────────────────────────────────────────────────────────────────────
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
                onClick={handleCancel}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {user?.role === 'FREELANCER' && (
          <div className="space-y-4">

            {/* Title */}
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

            {/* Bio */}
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

            {/* Hourly Rate + Availability */}
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

            {/* ── Job Status ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
              {editing ? (
                <div className="flex gap-3">
                  {[
                    { value: 'FULL_TIME', label: 'Full Time Freelancer', icon: '💼' },
                    { value: 'PART_TIME', label: 'Part Time Freelancer', icon: '🕐' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jobStatus: option.value }))}
                      className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${formData.jobStatus === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                    >
                      <span className="text-base">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                  <span>{profile?.jobStatus === 'PART_TIME' ? '🕐' : '💼'}</span>
                  {jobStatusLabel(profile?.jobStatus || 'FULL_TIME')}
                </div>
              )}
            </div>

            {/* City + Country */}
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
                  <select
                    value={formData.country || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.country || 'Not set'}</p>
                )}
              </div>
            </div>

            {/* Stats (read-only) */}
            {profile && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg Rating</p>
                  <p className="text-lg font-bold text-gray-900">
                    {profile.avgRating ? `${profile.avgRating.toFixed(1)}/10` : '—'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Jobs Completed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Array.isArray(profile.contracts)
                      ? profile.contracts.filter(c => c.status === 'COMPLETED').length
                      : 0}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {user?.role === 'CLIENT' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                {editing ? (
                  <input
                    value={formData.industry || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Technology, Design"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.industry || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                {editing ? (
                  <input
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. https://example.com"
                  />
                ) : (
                  <p className="text-gray-900">{profile?.website || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {editing ? (
                  <input
                    value={formData.city || ''}
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
                  <select
                    value={formData.country || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select country</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.country || 'Not set'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Us</label>
              {editing ? (
                <textarea
                  value={formData.bio || ''}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    value={formData.location || ''}
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
                    value={formData.phone || ''}
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

          {(!profile?.skills || profile.skills.length === 0) && !showSkillPicker ? (
            <p className="text-sm text-gray-400">No skills added yet. Click "Add Skills" to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {(profile?.skills || []).map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {skill.name}
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    disabled={removingSkill === skill.id}
                    className="text-indigo-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Remove skill"
                  >
                    {removingSkill === skill.id
                      ? <span className="text-xs">...</span>
                      : <HiX className="w-3.5 h-3.5" />}
                  </button>
                </span>
              ))}
            </div>
          )}

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
                      {addingSkill === skill.id
                        ? <span className="text-xs">Adding...</span>
                        : <><HiPlus className="w-3.5 h-3.5" /> {skill.name}</>}
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