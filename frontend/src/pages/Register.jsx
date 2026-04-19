import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    orgName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <div className="card-premium">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-10/10 p-4 rounded-2xl">
              <UserPlus className="w-8 h-8 text-brand-10" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-slate-500 text-center mb-8">Join Intellistock and optimize your inventory</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field w-full pl-12"
                  placeholder="John"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field w-full pl-12"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Organization Name</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  className="input-field w-full pl-12"
                  placeholder="Acme Corp"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full pl-12"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account? {' '}
            <Link to="/login" className="text-brand-10 hover:text-brand-10/80 font-bold">
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
