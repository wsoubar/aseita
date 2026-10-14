import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, Pencil, Trash2, Users } from 'lucide-react'
import { Avatar } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { FullPageSpinner } from '../../../components/ui/spinner'
import { useToast } from '../../../components/ui/toast-context'
import { useAuth } from '../../auth/context'
import { useCharacter, useDeleteCharacter } from '../api'

export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { show } = useToast()
  const character = useCharacter(id)
  const deleteCharacter = useDeleteCharacter()

  if (character.isLoading) return <FullPageSpinner />
  if (character.isError)
    return <ErrorState message="Erro ao carregar o personagem." />
  if (!character.data)
    return (
      <EmptyState
        icon={<Users className="size-8" />}
        title="Personagem não encontrado"
      />
    )

  const c = character.data
  const isOwner = user?.id === c.owner_id
  const attributes = Object.entries(c.data ?? {})

  async function handleDelete() {
    if (!window.confirm('Excluir este personagem? Essa ação é permanente.')) {
      return
    }
    try {
      await deleteCharacter.mutateAsync(c.id)
      show('Personagem excluído.', 'success')
      navigate('/characters')
    } catch {
      show('Não foi possível excluir.', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </button>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        {c.image_url ? (
          <img
            src={c.image_url}
            alt={c.name}
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-accent-soft font-display text-2xl text-accent">
            RPG
          </div>
        )}

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-xl font-bold">{c.name}</h1>
              <p className="text-sm text-muted">{c.system.name}</p>
            </div>
            <span className="flex items-center gap-1 text-sm text-accent">
              <Heart className="size-4 fill-current" />
              {c.like_count}
            </span>
          </div>

          <Link
            to={`/u/${c.owner.username}`}
            className="flex items-center gap-2 text-sm hover:text-accent"
          >
            <Avatar
              src={c.owner.avatar_url}
              name={c.owner.display_name}
              size={28}
            />
            por {c.owner.display_name} (@{c.owner.username})
          </Link>

          {c.description && (
            <p className="whitespace-pre-wrap text-sm">{c.description}</p>
          )}

          {attributes.length > 0 && (
            <dl className="grid grid-cols-2 gap-2 border-t border-line pt-4">
              {attributes.map(([key, value]) => (
                <div key={key} className="rounded-lg bg-surface-2 p-2.5">
                  <dt className="text-xs text-muted">{key}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {isOwner && (
            <div className="flex gap-2 border-t border-line pt-4">
              <Link to={`/characters/${c.id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Pencil className="size-4" />}
                >
                  Editar
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="size-4" />}
                onClick={handleDelete}
                loading={deleteCharacter.isPending}
              >
                Excluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
