import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { freelancerService } from '../../api/freelancerService';
import { clientService } from '../../api/clientService';
import { userService } from '../../api/userService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPencil, HiSave, HiX } from 'react-icons/hi';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

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
            experienceLevel: data.data?.experienceLevel || 'INTERMEDIATE',
            availabilityStatus: data.data?.availabilityStatus || 'AVAILABLE',
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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'FREELANCER') {
        const { data } = await freelancerService.updateMe({ ...formData, hourlyRate: parseFloat(formData.hourlyRate) || 0 });
        setProfile(data.data);
      } else if (user?.role === 'CLIENT') {
        const { data } = await clientService.updateMe(formData);
        setProfile(data.data);
      }
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
              <HiPencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-500 disabled:opacity-50">
                <HiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                {editing ? (
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ENTRY">Entry</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{profile?.experienceLevel?.replace(/_/g, ' ') || 'Not set'}</p>
                )}
              </div>
            </div>
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

      {/* Skills for freelancers */}
      {user?.role === 'FREELANCER' && profile?.skills && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span key={skill.id || skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
