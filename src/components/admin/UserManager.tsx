import { useEffect, useState } from 'react';
import { Users, MoreVertical, Edit2, ShieldAlert } from 'lucide-react';

export default function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/admin/users').then(r => r.json());
    if (res.success) setUsers(res.data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/v1/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchUsers();
  };

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading Users...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">User Management</h1>
          <p className="text-neutral-400">View and manage developer accounts.</p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] text-neutral-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Developer</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs text-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                        <div className="text-neutral-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs font-medium text-neutral-300 capitalize">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.status}
                      onChange={(e) => handleStatusChange(user._id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded border outline-none cursor-pointer ${
                        user.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        user.status === 'banned' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}
                    >
                      <option value="active" className="bg-black text-white">Active</option>
                      <option value="suspended" className="bg-black text-white">Suspended</option>
                      <option value="banned" className="bg-black text-white">Banned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-neutral-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-neutral-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
