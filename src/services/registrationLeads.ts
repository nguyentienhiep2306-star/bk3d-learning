import { supabase } from '../lib/supabase'

export type RegistrationLead = {
  id: string
  full_name: string
  phone: string
  email: string | null
  interest: string | null
  message: string | null
  source_page: string | null
  status: string
  admin_note: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'

export async function submitRegistration(payload: {
  full_name: string
  phone: string
  email?: string
  interest?: string
  message?: string
  source_page?: string
}) {
  const { data, error } = await supabase.rpc('submit_registration_lead', {
    p_full_name: payload.full_name.trim(),
    p_phone: payload.phone.trim(),
    p_email: payload.email?.trim() || null,
    p_interest: payload.interest?.trim() || null,
    p_message: payload.message?.trim() || null,
    p_source_page: payload.source_page || null,
    p_honeypot: null,
  })
  if (error) throw new Error(error.message || 'Khong the gui thong tin.')
  return data as string | null
}

export async function listLeads(filters?: { status?: LeadStatus; search?: string }) {
  let query = supabase.from('registration_leads').select('*').order('created_at', { ascending: false })
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.search) query = query.or('full_name.ilike.%' + filters.search + '%,phone.ilike.%' + filters.search + '%,email.ilike.%' + filters.search + '%')
  const { data, error } = await query
  if (error) throw new Error('Khong tai duoc danh sach dang ky.')
  return (data ?? []) as RegistrationLead[]
}

export async function updateLead(leadId: string, payload: { status?: LeadStatus; admin_note?: string; assigned_to?: string | null }) {
  const { error } = await supabase.from('registration_leads').update(payload).eq('id', leadId)
  if (error) throw new Error('Khong cap nhat duoc lead.')
}

export async function deleteLead(leadId: string) {
  const { error } = await supabase.from('registration_leads').delete().eq('id', leadId)
  if (error) throw new Error('Khong xoa duoc lead.')
}
