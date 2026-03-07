import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiMapPin, FiLink, FiCalendar, FiShield, FiUserPlus, FiMessageCircle, FiCamera, FiMoreHorizontal } from 'react-icons/fi';
import { useNexora } from '../context/NexoraContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useNexora();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/profile/${username}`, { withCredentials: true });
      if (data.success) {
        setProfile(data.profile);
        setEditData({
          displayName: data.profile.profile.displayName,
          bio: data.profile.profile.bio || '',
          location: data.profile.profile.location || '',
          website: data.profile.profile.website || ''
        });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/api/profile', editData, { withCredentials: true });
      if (data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      // Check if profile._id exists instead of profile.id
      const userId = profile._id || profile.id;

      if (!userId) {
        toast.error('Invalid user ID');
        return;
      }

      const { data } = await axios.post(`/api/friends/request/${userId}`, {}, { withCredentials: true });
      if (data.success) {
        toast.success('Friend request sent!');
        fetchProfile();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send friend request';
      toast.error(message);
      console.error('Friend request error:', error.response?.data);
    }
  };

  if (loading) return (
    <div className="flex-1 glass flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return (
    <div className="flex-1 glass flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4 border border-primary-200">
        <FiShield className="text-primary-600 text-4xl" />
      </div>
      <h1 className="text-3xl font-black text-dark-600 mb-2">User Not Found</h1>
      <p className="text-dark-400">The profile you are looking for doesn't exist or is private.</p>
    </div>
  );

  const isOwner = profile.isOwner;

  return (
    <div className="flex-1 glass overflow-y-auto no-scrollbar relative text-sharp">
      {/* Cover Image */}
      <div className="h-60 relative group">
        <img src={profile.profile?.coverImage} alt="Cover" className="w-full h-full object-cover brightness-75 transition-all duration-700 group-hover:brightness-90" />
        {isOwner && (
          <button className="absolute bottom-4 right-4 bg-dark-500/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold border border-primary-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-dark-600 flex items-center space-x-2">
            <FiCamera size={16} />
            <span>Update Cover</span>
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12 relative">
        {/* Profile Info Card */}
        <div className="relative -mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between px-6 pb-6 pt-0 space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0">
              <div className="relative group shrink-0">
                <img src={profile.profile?.avatar} alt={profile.username} className="w-40 h-40 rounded-[48px] border-[6px] border-white bg-white object-cover shadow-2xl relative z-10" />
                {isOwner && (
                  <button className="absolute inset-0 flex items-center justify-center bg-dark-500/40 rounded-[48px] opacity-0 group-hover:opacity-100 transition-all z-20 text-white border-2 border-primary-600">
                    <FiCamera size={24} />
                  </button>
                )}
                <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full border-4 border-white z-30 ${profile.profile?.status === 'online' ? 'bg-primary-600 shadow-lg shadow-primary-600/50' : 'bg-dark-300'
                  }`}></div>
              </div>

              <div className="pb-2 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-4xl font-black text-dark-600 tracking-tight truncate">{profile.profile?.displayName}</h1>
                  {profile.isVerified && <FiShield className="text-primary-600 shrink-0" size={20} title="Verified User" />}
                </div>
                <p className="text-dark-400 text-lg font-medium">@{profile.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pb-2 relative z-20">
              {isOwner ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-6 py-2.5 rounded-2xl font-black text-sm border border-primary-300 transition-all active:scale-95 shadow-xl"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSendFriendRequest}
                    className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-primary-600/20 transition-all active:scale-95 flex items-center space-x-2"
                  >
                    <FiUserPlus size={18} />
                    <span>Add Friend</span>
                  </button>
                  <button className="bg-primary-100 hover:bg-primary-200 text-primary-700 p-2.5 rounded-2xl border border-primary-300 transition-all active:scale-95 shadow-xl">
                    <FiMessageCircle size={20} />
                  </button>
                  <button className="bg-primary-100 hover:bg-primary-200 text-primary-700 p-2.5 rounded-2xl border border-primary-300 transition-all active:scale-95 shadow-xl">
                    <FiMoreHorizontal size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pt-6">
            {/* Bio & Details */}
            <div className="lg:col-span-2 space-y-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="bg-primary-50 backdrop-blur-md border border-primary-200 rounded-3xl p-6 space-y-4 shadow-2xl">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-dark-400 uppercase tracking-widest px-1">Display Name</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-primary-200 rounded-xl py-3 px-4 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                      value={editData.displayName}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-dark-400 uppercase tracking-widest px-1">Bio</label>
                    <textarea
                      className="w-full bg-white border border-primary-200 rounded-xl py-3 px-4 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-medium h-32 resize-none"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Tell the world about yourself..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-dark-400 uppercase tracking-widest px-1">Location</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-primary-200 rounded-xl py-3 px-4 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        placeholder="New York, USA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-dark-400 uppercase tracking-widest px-1">Website</label>
                      <input
                        type="text"
                        className="w-full bg-white border border-primary-200 rounded-xl py-3 px-4 text-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                        value={editData.website}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                        placeholder="https://nexora.app"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all mt-4">
                    SAVE CHANGES
                  </button>
                </form>
              ) : (
                <>
                  <div className="bg-primary-50 backdrop-blur-md border border-primary-200 rounded-3xl p-6 shadow-2xl group transition-all hover:bg-primary-100">
                    <h2 className="text-xs font-black text-dark-400 uppercase tracking-widest mb-4 px-1">About Me</h2>
                    <p className="text-dark-600 leading-relaxed text-lg font-medium whitespace-pre-wrap italic">
                      {profile.profile?.bio || "No bio yet. This user is a mystery!"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center space-x-3 group transition-all hover:bg-primary-100 hover:border-primary-300">
                      <div className="p-2 bg-primary-200 rounded-xl text-primary-700 group-hover:scale-110 transition-transform">
                        <FiMapPin size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Location</p>
                        <p className="text-dark-600 font-bold truncate">{profile.profile?.location || "Earth"}</p>
                      </div>
                    </div>
                    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center space-x-3 group transition-all hover:bg-primary-100 hover:border-primary-300">
                      <div className="p-2 bg-primary-200 rounded-xl text-primary-700 group-hover:scale-110 transition-transform">
                        <FiLink size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Website</p>
                        <p className="text-dark-600 font-bold truncate">
                          {profile.profile?.website ? (
                            <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 hover:underline">
                              {profile.profile.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stats & Metadata */}
            <div className="space-y-6">
              <div className="bg-primary-50 border border-primary-200 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xs font-black text-dark-400 uppercase tracking-widest mb-4 px-1">Statistics</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 rounded-2xl bg-white border border-primary-200 group hover:bg-primary-100 hover:border-primary-300 transition-all">
                    <p className="text-xl font-black text-dark-600 group-hover:text-primary-600 transition-colors">{profile.stats?.servers || 0}</p>
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-tight">Servers</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white border border-primary-200 group hover:bg-primary-100 hover:border-primary-300 transition-all">
                    <p className="text-xl font-black text-dark-600 group-hover:text-primary-600 transition-colors">{profile.stats?.friends || 0}</p>
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-tight">Friends</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white border border-primary-200 group hover:bg-primary-100 hover:border-primary-300 transition-all">
                    <p className="text-xl font-black text-dark-600 group-hover:text-primary-600 transition-colors">{profile.stats?.posts || 0}</p>
                    <p className="text-[10px] font-black text-dark-400 uppercase tracking-tight">Posts</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xs font-black text-dark-400 uppercase tracking-widest mb-4 px-1">Member Info</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FiCalendar className="text-dark-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-dark-400 uppercase">Joined Nexora</p>
                      <p className="text-dark-600 text-sm font-bold truncate">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FiShield className="text-dark-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-dark-400 uppercase">Account Status</p>
                      <p className="text-dark-600 text-sm font-bold truncate">Verified Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
