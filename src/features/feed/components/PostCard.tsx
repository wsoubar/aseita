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
    <article className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 shadow-sm shadow-black/[0.04] sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link
          to={`/u/${post.author.username}`}
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Avatar
            src={post.author.avatar_url}
            name={post.author.display_name}
            size={48}
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight hover:text-accent">
              {post.author.display_name}
            </p>
            <p className="truncate text-sm text-muted">
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

      {post.character ? (
        <div className="mt-2 flex items-start gap-4 sm:gap-6">
          <Link
            to={`/characters/${post.character.id}`}
            aria-label={`Ver personagem ${post.character.name}`}
            className="shrink-0 rounded-lg"
          >
            {post.character.image_url ? (
              <img
                src={post.character.image_url}
                alt={post.character.name}
                loading="lazy"
                width={80}
                height={80}
                className="size-16 rounded-lg bg-surface-2 object-contain sm:size-20"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-surface-2 text-xs font-medium text-muted sm:size-20">
                RPG
              </div>
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <blockquote className="whitespace-pre-wrap break-words font-serif text-lg italic leading-snug text-ink sm:text-xl">
              “{post.body}”
            </blockquote>
            <p className="mt-1 break-words text-[11px] leading-relaxed sm:text-xs">
              <span className="text-muted">— </span>
              <Link
                to={`/characters/${post.character.id}`}
                className="rounded-sm font-semibold hover:text-accent"
              >
                {post.character.name}
              </Link>
              {post.character.system?.name && (
                <span className="ml-2 italic text-muted">
                  ({post.character.system.name})
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 mb-3 whitespace-pre-wrap break-words font-serif text-base italic leading-snug text-ink sm:text-lg">
          {post.body}
        </p>
      )}

      <footer className="mt-1 flex items-center gap-3">
        <button
          type="button"
          disabled={!user}
          onClick={() =>
            toggleLike.mutate({ postId: post.id, liked: post.liked })
          }
          className={cn(
            'flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent',
            post.liked
              ? 'text-accent'
              : 'text-muted hover:bg-surface-2 hover:text-ink',
          )}
          title={post.liked ? 'Remover curtida' : 'Curtir'}
        >
          <Heart
            className={cn('size-5', post.liked && 'fill-current')}
          />
          {post.likeCount}
        </button>
        <button
          type="button"
          aria-label="Comentários"
          aria-expanded={showComments}
          onClick={() => setShowComments((v) => !v)}
          className="flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <MessageCircle className="size-5" />
          {post.commentCount}
        </button>
      </footer>

      {showComments && <CommentsSection postId={post.id} />}
    </article>
  )
}
