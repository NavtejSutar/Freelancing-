import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { jobService } from '../../api/jobService';
import { skillService } from '../../api/skillService';
import { toast } from 'react-toastify';

const schema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  budgetType: yup.string().oneOf(['FIXED', 'HOURLY']).required(),
  budgetMin: yup.number().positive().required('Min budget is required'),
  budgetMax: yup.number().positive().min(yup.ref('budgetMin'), 'Must be >= min').required('Max budget is required'),
  experienceLevel: yup.string().required('Experience level is required'),
  duration: yup.string(),  // FIXED: was 'expectedDuration', backend field is 'duration'
});

export default function JobForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { budgetType: 'FIXED', experienceLevel: 'INTERMEDIATE' },
  });

  useEffect(() => {
    skillService.getAll().then(({ data }) => setSkills(data.data || [])).catch(() => {});
    if (isEdit) {
      jobService.getById(id).then(({ data }) => {
        const job = data.data;
        reset({
          title: job.title,
          description: job.description,
          budgetType: job.budgetType,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          experienceLevel: job.experienceLevel,
          duration: job.duration,  // FIXED: was job.expectedDuration
        });
        setSelectedSkills(job.skills?.map(s => s.id || s) || []);
      }).catch(() => toast.error('Failed to load job'));
    }
  }, [id, isEdit, reset]);

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await jobService.update(id, { ...data, skillIds: selectedSkills });
        toast.success('Job updated!');
      } else {
        await jobService.create({ ...data, skillIds: selectedSkills });
        toast.success('Job posted!');
      }
      navigate('/jobs/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="e.g. Full Stack Developer Needed"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="Describe the project requirements, deliverables, and expectations..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type</label>
            <select
              {...register('budgetType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="FIXED">Fixed Price</option>
              <option value="HOURLY">Hourly Rate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget ($)</label>
            <input
              type="number"
              {...register('budgetMin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.budgetMin && <p className="text-red-500 text-sm mt-1">{errors.budgetMin.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget ($)</label>
            <input
              type="number"
              {...register('budgetMax')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.budgetMax && <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              {...register('experienceLevel')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="ENTRY">Entry Level</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Duration</label>
            <input
              {...register('duration')}  
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. 1-3 months"
            />
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}