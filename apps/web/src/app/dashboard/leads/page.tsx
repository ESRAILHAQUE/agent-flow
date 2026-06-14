'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  type Lead,
} from '@/store/services/leadsApi';
import { Users, Plus, Loader2, Trash2, Pencil, X, ChevronDown } from 'lucide-react';

type LeadForm = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  status: Lead['status'];
};

const STATUS_COLORS: Record<Lead['status'], string> = {
  NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  QUALIFIED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  LOST: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function LeadsPage() {
  const { data, isLoading } = useGetLeadsQuery();
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead] = useUpdateLeadMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LeadForm>({
    defaultValues: { status: 'NEW' },
  });

  const leads = data?.data || [];

  const onSubmit = async (formData: LeadForm) => {
    try {
      if (editingId) {
        await updateLead({ id: editingId, data: formData }).unwrap();
        toast.success('Lead updated');
      } else {
        await createLead(formData).unwrap();
        toast.success('Lead created');
      }
      reset({ status: 'NEW' });
      setShowForm(false);
      setEditingId(null);
    } catch {
      toast.error('Failed to save lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setValue('name', lead.name);
    setValue('email', lead.email || '');
    setValue('phone', lead.phone || '');
    setValue('company', lead.company || '');
    setValue('source', lead.source || '');
    setValue('notes', lead.notes || '');
    setValue('status', lead.status);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead "${name}"?`)) return;
    try {
      await deleteLead(id).unwrap();
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusChange = async (id: string, status: Lead['status']) => {
    try {
      await updateLead({ id, data: { status } }).unwrap();
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            Leads & CRM
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Track and manage your sales pipeline and customer leads.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); reset({ status: 'NEW' }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Lead'}
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-zinc-200 mb-5">{editingId ? 'Edit Lead' : 'New Lead'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'name', label: 'Name *', placeholder: 'John Doe', required: true },
              { id: 'email', label: 'Email', placeholder: 'john@example.com' },
              { id: 'phone', label: 'Phone', placeholder: '+1 234 567 890' },
              { id: 'company', label: 'Company', placeholder: 'Acme Inc.' },
              { id: 'source', label: 'Source', placeholder: 'Website, LinkedIn...' },
            ].map(({ id, label, placeholder, required }) => (
              <div key={id}>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  {...register(id as keyof LeadForm, { required: required ? `${label} is required` : false })}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              >
                {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as Lead['status'][]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea
                placeholder="Any additional notes..."
                {...register('notes')}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px] transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingId ? 'Save Changes' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No leads yet</p>
          <p className="text-xs text-zinc-500 mt-1">Click "Add Lead" above to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="p-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all flex items-center gap-4">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-sm uppercase shrink-0">
                {lead.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-zinc-200">{lead.name}</span>
                  {lead.company && <span className="text-zinc-500 text-sm">· {lead.company}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
                  {lead.email && <span>{lead.email}</span>}
                  {lead.phone && <span>{lead.phone}</span>}
                  {lead.source && <span>via {lead.source}</span>}
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                  className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg border cursor-pointer ${STATUS_COLORS[lead.status]} bg-transparent`}
                >
                  {(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as Lead['status'][]).map(s => (
                    <option key={s} value={s} className="bg-zinc-900 text-zinc-100">{s}</option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-2 pointer-events-none opacity-60" />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleEdit(lead)}
                  className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(lead.id, lead.name)}
                  disabled={isDeleting}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
