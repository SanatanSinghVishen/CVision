import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/:userId', async (req: AuthRequest, res): Promise<any> => {
  const { userId } = req.params;

  // Security: users can only fetch their own history
  if (req.user?.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sort = (req.query.sort as string) || 'date';
  const offset = (page - 1) * limit;

  const orderColumn = sort === 'score' ? 'overall_score' : 'created_at';

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { data, error, count } = await supabaseAdmin
    .from('resumes')
    .select(`
      id,
      company_name,
      job_title,
      overall_score,
      status,
      created_at,
      feedback->ATS->score,
      feedback->content->score,
      feedback->toneAndStyle->score,
      feedback->structure->score
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order(orderColumn, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Fetch analyses error:", error);
    return res.status(500).json({ error: 'Failed to fetch analyses' });
  }

  return res.json({
    analyses: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count ?? 0) / limit)
    }
  });
});

router.get('/:userId/:resumeId', async (req: AuthRequest, res): Promise<any> => {
  const { userId, resumeId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { data, error } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', userId)   // Double-check ownership at DB level too
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Report not found' });
  }

  return res.json(data);
});

router.delete('/:userId', async (req: AuthRequest, res): Promise<any> => {
  const { userId } = req.params;

  if (req.user?.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { error } = await supabaseAdmin
    .from('resumes')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error("Delete analyses error:", error);
    return res.status(500).json({ error: 'Failed to wipe analyses' });
  }

  return res.json({ success: true });
});

export default router;
