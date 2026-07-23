import { supabase } from '../lib/supabase'

export type HomepageProject = {
  id?: string
  title: string
  short_description?: string | null
  image_url: string
  image_alt?: string | null
  category?: string | null
  project_url?: string | null
  sort_order: number
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export async function listPublishedProjects() {
  const { data, error } = await supabase
    .from('homepage_projects')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error('Khong tai duoc du an.')
  return (data ?? []) as HomepageProject[]
}

export async function listAdminProjects() {
  const { data, error } = await supabase
    .from('homepage_projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error('Khong tai duoc du an.')
  return (data ?? []) as HomepageProject[]
}

export async function createProject(input: Omit<HomepageProject, 'id' | 'created_at' | 'updated_at'>) {
  const { error } = await supabase.from('homepage_projects').insert(input)
  if (error) throw new Error('Khong tao duoc du an.')
}

export async function updateProject(id: string, input: Partial<HomepageProject>) {
  const { error } = await supabase.from('homepage_projects').update(input).eq('id', id)
  if (error) throw new Error('Khong cap nhat duoc du an.')
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('homepage_projects').delete().eq('id', id)
  if (error) throw new Error('Khong xoa duoc du an.')
}

export async function reorderProjects(items: Array<{ id: string; sort_order: number }>) {
  for (const item of items) {
    const { error } = await supabase.from('homepage_projects').update({ sort_order: item.sort_order }).eq('id', item.id)
    if (error) throw new Error('Khong sap xep duoc du an.')
  }
}

export async function getNextProjectSortOrder(): Promise<number> {
  const { data, error } = await supabase
    .from('homepage_projects')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error('Khong lay duoc thu tu.')
  return (data?.sort_order ?? 0) + 1
}
