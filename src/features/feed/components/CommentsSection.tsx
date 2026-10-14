import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Avatar } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Spinner } from '../../../components/ui/spinner'
import { useAuth } from '../../auth/context'
import { useToast } from '../../../components/ui/toast-context'
import { timeAgo } from '../../../lib/utils'
import { useCreateComment, useComments, useDeleteComment } from '../api'

export function CommentsSection({ postId }: { postId: string }) {
  const { user } = useAuth()
  const { show } = useToast()
  const [body, setBody] = useState('')
  const comments = useComments(postId, true)
  const createComment = useCreateComment(postId, user?.id ?? '')
  const deleteComment = useDeleteComment(postId, user?.id ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    try {
      await createComment.mutateAsync(trimmed)
      setBody('')
    } catch {
      show('Não foi possível comentar', 'error')
    }
  }

  return (
    <div className="mt-3 space-y-3 border-t border-line pt-3">
      {comments.isLoading && <Spinner className="size-4 text-muted" />}
      {comments.data?.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2.5">
          <Link to={`/u/${comment.author.username}`}>
            <Avatar
              src={comment.author.avatar_url}
              name={comment.author.display_name}
              size={28}
            />
          </Link>
          <div className="min-w-0 flex-1 rounded-lg bg-surface-2 px-3 py-2">
            <p className="text-xs text-muted">
              <Link
                to={`/u/${comment.author.username}`}
                className="font-medium text-ink hover:text-accent"
              >
                {comment.author.display_name}
              </Link>{' '}
              · {timeAgo(comment.created_at)}
            </p>
            <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
          </div>
          {user?.id === comment.author.id && (
            <button
              type="button"
              title="Excluir comentário"
              onClick={() => deleteComment.mutate(comment.id)}
              className="rounded-lg p-1 text-muted hover:text-danger"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva um comentário..."
          maxLength={500}
          aria-label="Comentário"
        />
        <Button
          type="submit"
          size="sm"
          loading={createComment.isPending}
          disabled={!body.trim()}
        >
          Enviar
        </Button>
      </form>
    </div>
  )
}
