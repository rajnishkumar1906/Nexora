import React, { useState } from 'react';
import { useNexora } from '../context/NexoraContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login, register, isLogin, toggleAuthMode } = useNexora();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center glass relative overflow-hidden text-sharp">
      {/* Background Animated Blobs - Sky Blue tones */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000"></div>

      <div className="w-full max-w-md p-8 glass border border-primary-200 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 mb-4 shadow-lg shadow-primary-500/30">
            <span className="text-2xl font-black text-white italic">NX</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-500 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-dark-400 text-sm">
            {isLogin 
              ? 'Join your community and start chatting' 
              : 'Sign up to connect with friends and communities'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-300 group-focus-within:text-primary-500 transition-colors">
                <FiUser size={18} />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Username (min 3 characters)"
                required
                className={`w-full bg-white border ${errors.username ? 'border-red-400' : 'border-primary-200'} rounded-2xl py-3.5 pl-11 pr-4 text-dark-500 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all`}
                value={formData.username}
                onChange={handleChange}
                minLength={3}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 ml-4">{errors.username}</p>
              )}
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-300 group-focus-within:text-primary-500 transition-colors">
              <FiMail size={18} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className={`w-full bg-white border ${errors.email ? 'border-red-400' : 'border-primary-200'} rounded-2xl py-3.5 pl-11 pr-4 text-dark-500 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>
            )}
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-dark-300 group-focus-within:text-primary-500 transition-colors">
              <FiLock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={!isLogin ? "Password (min 6 characters)" : "Password"}
              required
              minLength={!isLogin ? 6 : undefined}
              className={`w-full bg-white border ${errors.password ? 'border-red-400' : 'border-primary-200'} rounded-2xl py-3.5 pl-11 pr-12 text-dark-500 placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all`}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-300 hover:text-primary-500 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-4">{errors.password}</p>
            )}
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" className="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium">
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-primary-200 text-center">
          <p className="text-dark-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleAuthMode}
              className="ml-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
