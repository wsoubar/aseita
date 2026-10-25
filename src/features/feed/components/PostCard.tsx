import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Avatar } from '../../../components/ui/avatar'
import { useAuth } from '../../auth/context'
import { useDeletePost, useToggleLike } from '../api'
import type { FeedPost } from '../../../types'
import { cn, timeAgo } from '../../../lib/utils'
import { CommentsSection } from './CommentsSection'

export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const toggleLike = useToggleLike(user?.id ?? '')
  const deletePost = useDeletePost(user?.id ?? '')
  const isOwner = user?.id === post.author.id

  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-sm shadow-black/[0.04] sm:p-5">
      <header className="flex items-center justify-between gap-3">
        <Link
          to={`/u/${post.author.username}`}
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Avatar
            src={post.author.avatar_url}
            name={post.author.display_name}
            size={40}
          />
          <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight hover:text-accent">
              {post.author.display_name}
            </p>
            <p className="truncate text-xs text-muted">
              @{post.author.username} · {timeAgo(post.created_at)}
            </p>
          </div>
        </Link>
        {isOwner && (
          <button
            type="button"
            title="Excluir post"
            onClick={() => {
              if (window.confirm('Excluir este post?')) {
                deletePost.mutate(post.id)
              }
            }}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </header>

      <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{post.body}</p>

      {post.character && (
        <Link
          to={`/characters/${post.character.id}`}
          className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5 transition-colors hover:border-muted"
        >
          {post.character.image_url ? (
            <img
              src={post.character.image_url}
              alt={post.character.name}
              loading="lazy"
              className="size-11 shrink-0 rounded-md bg-surface object-contain"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-medium tracking-wide text-muted">
              RPG
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{post.character.name}</p>
            <p className="truncate text-xs text-muted">
              {post.character.system?.name}
            </p>
          </div>
        </Link>
      )}

      <footer className="mt-3 flex items-center gap-1">
        <button
          type="button"
          disabled={!user}
          onClick={() =>
            toggleLike.mutate({ postId: post.id, liked: post.liked })
          }
          className={cn(
            'flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent',
            post.liked
              ? 'text-accent'
              : 'text-muted hover:bg-surface-2 hover:text-ink',
          )}
          title={post.liked ? 'Remover curtida' : 'Curtir'}
        >
          <Heart
            className={cn('size-4', post.liked && 'fill-current')}
          />
          {post.likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <MessageCircle className="size-4" />
          {post.commentCount}
        </button>
      </footer>

      {showComments && <CommentsSection postId={post.id} />}
    </article>
  )
}
