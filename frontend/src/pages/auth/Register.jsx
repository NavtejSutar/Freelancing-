import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm your password'),
  role: yup.string().oneOf(['CLIENT', 'FREELANCER']).required('Select a role'),
  aadhaarNumber: yup.string().when('role', {
    is: 'FREELANCER',
    then: (s) => s
      .required('Aadhaar number is required for freelancers')
      .matches(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
    otherwise: (s) => s.notRequired(),
  }),
  aadhaarConsent: yup.boolean().when('role', {
    is: 'FREELANCER',
    then: (s) => s.oneOf([true], 'You must confirm your Aadhaar details'),
    otherwise: (s) => s.notRequired(),
  }),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'FREELANCER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, aadhaarConsent, ...payload } = data;
      // Only send aadhaarNumber for freelancers
      if (payload.role !== 'FREELANCER') delete payload.aadhaarNumber;
      await registerUser(payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">FreelanceHub</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                {...register('firstName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                {...register('lastName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" value="FREELANCER" {...register('role')} className="peer hidden" />
                <div className="p-3 border-2 border-gray-200 rounded-lg text-center cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-colors">
                  <p className="font-medium text-gray-900">Work as Freelancer</p>
                  <p className="text-xs text-gray-500">Find projects & earn</p>
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" value="CLIENT" {...register('role')} className="peer hidden" />
                <div className="p-3 border-2 border-gray-200 rounded-lg text-center cursor-pointer peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-colors">
                  <p className="font-medium text-gray-900">Hire as Client</p>
                  <p className="text-xs text-gray-500">Post jobs & hire talent</p>
                </div>
              </label>
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
          </div>

          {/* Aadhaar section — only shown for FREELANCER */}
          {selectedRole === 'FREELANCER' && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">🪪</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Identity Verification Required</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Freelancers must provide their Aadhaar number. An admin will verify your identity before you can submit proposals.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('aadhaarNumber')}
                  maxLength={12}
                  placeholder="Enter 12-digit Aadhaar number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none tracking-widest font-mono"
                />
                {errors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber.message}</p>}
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('aadhaarConsent')}
                  className="mt-0.5 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-xs text-gray-600">
                  I confirm that the Aadhaar number provided is mine and the details are authentic. I consent to identity verification by the platform admin.
                </span>
              </label>
              {errors.aadhaarConsent && <p className="text-red-500 text-sm mt-1">{errors.aadhaarConsent.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}