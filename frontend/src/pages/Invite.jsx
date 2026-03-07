import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiChevronLeft } from 'react-icons/fi';

const Invite = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    const join = async () => {
      try {
        const { data } = await axios.post(`/api/servers/join/${inviteCode}`, {}, { withCredentials: true });
        if (data.success) {
          toast.success(data.message || 'Joined server');
          if (data.defaultChannelId) {
            navigate(`/server/${data.server._id}/channel/${data.defaultChannelId}`);
            return;
          }
          try {
            const channelsRes = await axios.get(`/api/channels/server/${data.server._id}`, {
              withCredentials: true
            });
            if (channelsRes.data?.success && channelsRes.data.channels?.length > 0) {
              navigate(`/server/${data.server._id}/channel/${channelsRes.data.channels[0]._id}`);
              return;
            }
          } catch {
            // ignore and fallback
          }
          navigate(`/server/${data.server._id}`);
        } else {
          toast.error('Failed to join');
          setJoining(false);
        }
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to join server';
        toast.error(msg);
        setJoining(false);
      }
    };
    join();
  }, [inviteCode, navigate]);

  if (!joining) {
    return (
      <div className="min-h-screen flex items-center justify-center glass text-sharp">
        <div className="text-center">
          <h1 className="text-2xl font-black text-dark-600 mb-2">Invite Invalid or Expired</h1>
          <p className="text-dark-400 mb-6">Ask for a new invite or explore public servers.</p>
          <button onClick={() => navigate('/')} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-black text-sm">
            GO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center glass text-sharp">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-black text-dark-600">Joining server...</h1>
        <button onClick={() => navigate(-1)} className="mt-6 inline-flex items-center space-x-2 text-primary-600">
          <FiChevronLeft />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default Invite;
