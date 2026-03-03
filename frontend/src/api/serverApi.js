import axios from './axiosConfig'

export const serverApi = {
  getMyServers: () => axios.get('/servers'),
  discoverServers: () => axios.get('/servers/discover'),
  getServer: (serverId) => axios.get(`/servers/${serverId}`),
  getServerByInvite: (code) => axios.get(`/servers/invite/${code}`),
  createServer: (data) => axios.post('/servers', data),
  updateServer: (serverId, data) => axios.patch(`/servers/${serverId}`, data),
  deleteServer: (serverId) => axios.delete(`/servers/${serverId}`),
  joinServer: (code) => axios.post(`/servers/join/${code}`),
  leaveServer: (serverId) => axios.post(`/servers/${serverId}/leave`),
  getMembers: (serverId) => axios.get(`/servers/${serverId}/members`),
  updateMemberRole: (serverId, memberId, role) => 
    axios.patch(`/servers/${serverId}/members/${memberId}/role`, { role }),
}