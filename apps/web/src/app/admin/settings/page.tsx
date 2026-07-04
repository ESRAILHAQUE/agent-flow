'use client';

import React, { useState } from 'react';
import { 
  useGetSettingsQuery, 
  useUpdateSettingMutation,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useDeleteNotificationMutation
} from '@/store/services/adminApi';
import { Settings, Bell, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading: loadingSettings } = useGetSettingsQuery();
  const { data: notifData, isLoading: loadingNotifs } = useGetNotificationsQuery();
  const [updateSetting] = useUpdateSettingMutation();
  const [createNotification, { isLoading: creatingNotif }] = useCreateNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const settings = settingsData?.data || [];
  const notifications = notifData?.data || [];

  const getSettingValue = (key: string) => {
    const s = settings.find((set: any) => set.key === key);
    return s ? s.value : false;
  };

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSetting({ key, value }).unwrap();
      toast.success('Setting updated');
    } catch {
      toast.error('Failed to update setting');
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return toast.error('Fill in all fields');
    try {
      await createNotification({ title, message, type }).unwrap();
      toast.success('Broadcast sent');
      setTitle('');
      setMessage('');
    } catch {
      toast.error('Failed to send broadcast');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50">Platform Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage global configurations and system broadcasts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Global Toggles */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">Global Toggles</h2>
          {loadingSettings ? (
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Maintenance Mode</h3>
                  <p className="text-xs text-zinc-500 mt-1">Block all non-admin logins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={getSettingValue('MAINTENANCE_MODE')} onChange={(e) => handleToggle('MAINTENANCE_MODE', e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Allow Signups</h3>
                  <p className="text-xs text-zinc-500 mt-1">Enable or disable new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={getSettingValue('ALLOW_SIGNUPS') ?? true} onChange={(e) => handleToggle('ALLOW_SIGNUPS', e.target.checked)} />
                  <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* System Broadcasts */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Bell className="h-5 w-5 text-yellow-500" />
              New Broadcast
            </h2>
            <form onSubmit={handleCreateBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" placeholder="e.g. Scheduled Maintenance" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Message</label>
                <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none" placeholder="Enter announcement details..." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:border-blue-500 focus:outline-none">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <button disabled={creatingNotif} type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                {creatingNotif ? 'Sending...' : 'Send Broadcast'}
              </button>
            </form>
          </div>

          {/* Previous Broadcasts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Active Announcements</h2>
            {loadingNotifs ? (
              <Loader2 className="h-5 w-5 text-zinc-500 animate-spin mx-auto" />
            ) : notifications.length === 0 ? (
              <p className="text-sm text-zinc-600 text-center">No active broadcasts</p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl relative group">
                    <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${notif.type === 'warning' ? 'bg-yellow-500' : notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      {notif.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notif.message}</p>
                    <button 
                      onClick={async () => {
                        await deleteNotification(notif.id);
                        toast.success('Deleted');
                      }} 
                      className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
