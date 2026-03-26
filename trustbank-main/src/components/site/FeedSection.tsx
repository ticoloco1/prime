'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Send, Pin, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { timeAgo } from '@/lib/utils';

interface Props {
  siteId: string;
  isOwner: boolean;
}

export function FeedSection({ siteId, isOwner }: Props) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [pinMode, setPinMode] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('feed_posts' as any)
      .select('*')
      .eq('site_id', siteId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);
    setPosts(data || []);
  };

  useEffect(() => { if (siteId) load(); }, [siteId]);

  const post = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);
    const expiresAt = pinMode
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('feed_posts' as any).insert({
      site_id: siteId, user_id: user.id,
      text: text.trim(), pinned: pinMode,
      pinned_until: pinMode ? expiresAt : null,
      expires_at: expiresAt,
    });

    if (error) { toast.error(error.message); }
    else {
      if (pinMode) toast.success('Post pinned for 365 days ($10 USDC charged)');
      else toast.success('Posted! Visible for 7 days.');
      setText(''); setPinMode(false); load();
    }
    setPosting(false);
  };

  const deletePost = async (id: string) => {
    await supabase.from('feed_posts' as any).delete().eq('id', id).eq('user_id', user!.id);
    setPosts(p => p.filter(x => x.id !== id));
  };

  // Filter expired non-pinned posts
  const activePosts = posts.filter(p => {
    if (p.pinned) return true;
    return new Date(p.expires_at) > new Date();
  });

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <textarea value={text} onChange={e => setText(e.target.value)}
            className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-white/30"
            rows={3} placeholder="What's on your mind?" maxLength={500} />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{text.length}/500</span>
              <button onClick={() => setPinMode(!pinMode)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${pinMode ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/60'}`}>
                <Pin className="w-3 h-3" />
                {pinMode ? 'Pin 365 days ($10)' : 'Pin?'}
              </button>
            </div>
            <button onClick={post} disabled={!text.trim() || posting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold disabled:opacity-50">
              <Send className="w-3 h-3" />
              {posting ? 'Posting...' : pinMode ? 'Pin ($10)' : 'Post (7 days)'}
            </button>
          </div>
        </div>
      )}

      {activePosts.map((post: any) => (
        <div key={post.id} className={`bg-white/5 rounded-2xl p-4 border ${post.pinned ? 'border-amber-500/30' : 'border-white/10'}`}>
          {post.pinned && (
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mb-2">
              <Pin className="w-3 h-3" /> Pinned
            </div>
          )}
          <p className="text-white text-sm whitespace-pre-wrap">{post.text}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              {timeAgo(post.created_at)}
              {!post.pinned && <span className="ml-2">· expires {timeAgo(post.expires_at)}</span>}
            </div>
            {isOwner && (
              <button onClick={() => deletePost(post.id)} className="text-red-400/60 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
