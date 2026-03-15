import { useEffect, useState, useCallback } from 'react';
import { skillService } from '../../api/skillService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { HiPlus, HiTrash, HiTag } from 'react-icons/hi';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0); // FIX: explicit refresh trigger so data reloads after add/delete

  const [newSkill, setNewSkill] = useState({ name: '', categoryId: '' });
  const [addingSkill, setAddingSkill] = useState(false);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [addingCategory, setAddingCategory] = useState(false);

  const [filterCategoryId, setFilterCategoryId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [skillsRes, catsRes] = await Promise.all([
        skillService.getAll(filterCategoryId || undefined),
        skillService.getCategories(),
      ]);
      setSkills(skillsRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filterCategoryId, refresh]); // FIX: refresh in deps so manual trigger works

  useEffect(() => { loadData(); }, [loadData]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim() || !newSkill.categoryId) {
      toast.error('Skill name and category are required');
      return;
    }
    setAddingSkill(true);
    try {
      await skillService.create({ name: newSkill.name.trim(), categoryId: Number(newSkill.categoryId) });
      toast.success(`Skill "${newSkill.name}" created`);
      setNewSkill({ name: '', categoryId: '' });
      setRefresh(r => r + 1); // FIX: trigger reload
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    try {
      await skillService.delete(id);
      toast.success(`Skill "${name}" deleted`);
      setRefresh(r => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setAddingCategory(true);
    try {
      await skillService.createCategory({ name: newCategory.name.trim(), description: newCategory.description.trim() });
      toast.success(`Category "${newCategory.name}" created`);
      setNewCategory({ name: '', description: '' });
      setRefresh(r => r + 1); // FIX: trigger reload so new category appears in skills dropdown immediately
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This will also delete all skills in it.`)) return;
    try {
      await skillService.deleteCategory(id);
      toast.success(`Category "${name}" deleted`);
      setRefresh(r => r + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Skills Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Categories panel ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <HiTag className="w-5 h-5 text-indigo-500" /> Categories
          </h2>

          <form onSubmit={handleAddCategory} className="space-y-2">
            <input
              type="text"
              placeholder="Category name (e.g. Programming)"
              value={newCategory.name}
              onChange={(e) => setNewCategory(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={addingCategory}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <HiPlus className="w-4 h-4" /> {addingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          {loading ? <LoadingSpinner /> : (
            <ul className="divide-y divide-gray-100">
              {categories.length === 0 && (
                <li className="py-3 text-sm text-gray-400 text-center">No categories yet</li>
              )}
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                    {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-red-400 hover:text-red-600 transition-colors">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Skills panel ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <HiTag className="w-5 h-5 text-teal-500" /> Skills
          </h2>

          <form onSubmit={handleAddSkill} className="space-y-2">
            <input
              type="text"
              placeholder="Skill name (e.g. React)"
              value={newSkill.name}
              onChange={(e) => setNewSkill(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <select
              value={newSkill.categoryId}
              onChange={(e) => setNewSkill(p => ({ ...p, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={addingSkill || categories.length === 0}
              className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              <HiPlus className="w-4 h-4" /> {addingSkill ? 'Adding...' : 'Add Skill'}
            </button>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600">Create a category first before adding skills.</p>
            )}
          </form>

          <select
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {loading ? <LoadingSpinner /> : (
            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {skills.length === 0 && (
                <li className="py-3 text-sm text-gray-400 text-center">No skills yet</li>
              )}
              {skills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{skill.name}</p>
                    <p className="text-xs text-gray-400">{skill.categoryName}</p>
                  </div>
                  <button onClick={() => handleDeleteSkill(skill.id, skill.name)} className="text-red-400 hover:text-red-600 transition-colors">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}