'use server';

import { createSessionClient } from '@/lib/db/supabase-server';
import { revalidatePath } from 'next/cache';
import { ResumeData } from '@/lib/parsers/types';

export async function createPortfolio(data: {
  name: string;
  documentId?: string;
  resumeData?: ResumeData;
}) {
  const supabase = await createSessionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        name: data.name,
        slug: slug,
        resume_data: data.resumeData,
        primary_document_id: data.documentId,
        status: 'draft',
        is_public: false
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, data: portfolio };
  } catch (error) {
    return { success: false, error: 'Failed to create portfolio' };
  }
}

export async function uploadDocument(file: File, sourceType: 'resume' | 'linkedin' | 'github' | 'manual' = 'resume') {
  const supabase = await createSessionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: filePath,
        source_type: sourceType,
        status: 'uploaded'
      })
      .select()
      .single();

    if (docError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([filePath]);
      return { success: false, error: docError.message };
    }

    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: 'Failed to upload document' };
  }
}

export async function updateDocument(documentId: string, updates: {
  extractedText?: string;
  parsedData?: any;
  status?: string;
  errorMessage?: string;
  aiEnhancedData?: any;
  enhancementStatus?: string;
}) {
  const supabase = await createSessionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        processed_at: updates.status === 'parsed' ? new Date().toISOString() : undefined
      })
      .eq('id', documentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: document };
  } catch (error) {
    return { success: false, error: 'Failed to update document' };
  }
}

export async function getUserDocuments() {
  const supabase = await createSessionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        *,
        portfolios (
          id,
          name,
          slug,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: documents || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch documents' };
  }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createSessionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get document info for file cleanup
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    // Delete document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Delete file from storage
    if (document?.file_path) {
      await supabase.storage.from('documents').remove([document.file_path]);
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete document' };
  }
}

export async function publishPortfolio(id: string) {
  const supabase = await createSessionClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify ownership
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, user_id, slug')
    .eq('id', id)
    .single();

  if (!portfolio || portfolio.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('portfolios')
    .update({
      status: 'published',
      updated_at: new Date().toISOString(),
      is_public: true
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/p/${portfolio.slug}`);
  return { success: true, slug: portfolio.slug };
}

export async function unpublishPortfolio(id: string) {
  const supabase = await createSessionClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Verify ownership
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, user_id, slug')
    .eq('id', id)
    .single();

  if (!portfolio || portfolio.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('portfolios')
    .update({
      status: 'draft',
      updated_at: new Date().toISOString(),
      is_public: false
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/p/${portfolio.slug}`);
  return { success: true };
}