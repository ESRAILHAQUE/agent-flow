'use client';

import React from 'react';
import { useGetAllUsersQuery, useUpdateUserRoleMutation, useSuspendUserMutation, useActivateUserMutation } from '@/store/services/adminApi';
import { Users, Loader2, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ROLES = ['SUPER_ADMIN', 'ORG_OWNER', 'TEAM_MEMBER'];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'text-red-400 bg-red-500/10 border-red-500/20',
  ORG_OWNER: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  TEAM_MEMBER: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
};

export default function AdminUsersPage() {
  const { data, isLoading } = useGetAllUsersQuery({});
  const [updateRole] = useUpdateUserRoleMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();

  const users = data?.data || [];
  const meta = data?.meta;

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateRole({ id, role }).unwrap();
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50">Users</h1>
          <p className="text-zinc-400 text-sm mt-1">{meta?.total ?? 0} total users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500">No users yet</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-zinc-900 rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verified</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Organizations</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-b border-zinc-900/60 hover:bg-zinc-900/30 transition-colors ${i === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 uppercase text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {user.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-zinc-600" />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {user.ownedOrgs?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.ownedOrgs.map((org) => (
                          <span key={org.id} className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md">
                            {org.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg border cursor-pointer focus:outline-none ${ROLE_COLORS[user.role] || ROLE_COLORS.TEAM_MEMBER} bg-transparent`}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} className="bg-zinc-900 text-zinc-100">{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="h-3 w-3 absolute right-2 top-2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {user.isSuspended ? (
                      <button
                        onClick={async () => {
                          try { await activateUser(user.id).unwrap(); toast.success('User activated'); }
                          catch { toast.error('Failed to activate user'); }
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold rounded-lg transition-colors border border-emerald-500/20"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const reason = prompt('Reason for suspension:');
                          if (reason === null) return;
                          try { await suspendUser({ id: user.id, reason }).unwrap(); toast.success('User suspended'); }
                          catch (err: any) { toast.error(err?.data?.error || 'Failed to suspend user'); }
                        }}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-lg transition-colors border border-red-500/20"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
