import { Link, useParams } from 'react-router-dom'
import { Settings, Users } from 'lucide-react'
import { Avatar } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { FullPageSpinner } from '../../../components/ui/spinner'
import { useAuth } from '../../auth/context'
import { useMyCharacters } from '../../characters/api'
import { useAuthorPosts } from '../../feed/api'
import { PostCard } from '../../feed/components/PostCard'
import { usePublicProfile } from '../api'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const profileQuery = usePublicProfile(username)
  const profile = profileQuery.data
  const characters = useMyCharacters(profile?.id)
  const posts = useAuthorPosts(profile?.id, user?.id)

  if (profileQuery.isLoading) return <FullPageSpinner />
  if (profileQuery.isError)
    return <ErrorState message="Erro ao carregar o perfil." />
  if (!profile) {
    return (
      <EmptyState
        icon={<Users className="size-8" />}
        title="Jogador não encontrado"
        description={`Não existe ninguém com o nick @${username}.`}
      />
    )
  }

  const isMe = user?.id === profile.id

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-sm shadow-black/[0.04] sm:p-7">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar
            src={profile.avatar_url}
            name={profile.display_name}
            size={80}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.display_name}
              </h1>
              {isMe && (
                <Link
                  to="/settings"
                  className="text-muted hover:text-accent"
                  title="Editar perfil"
                >
                  <Settings className="size-4" />
                </Link>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">@{profile.username}</p>
            {profile.preferred_system && (
              <Badge className="mt-2">
                Prefere {profile.preferred_system.name}
              </Badge>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{profile.bio}</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Personagens ({characters.data?.length ?? 0})
        </h2>
        {characters.data && characters.data.length === 0 && (
          <EmptyState
            icon={<Users className="size-7" />}
            title="Nenhum personagem"
            description={
              isMe ? 'Crie sua primeira ficha na aba Personagens.' : undefined
            }
          />
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {characters.data?.map((c) => (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-muted hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {c.image_url ? (
                <img
                  src={c.image_url}
                  alt={c.name}
                  loading="lazy"
                  className="h-32 w-full bg-surface-2 object-contain"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-surface-2 text-sm font-medium tracking-wide text-muted">
                  RPG
                </div>
              )}
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted">{c.system.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">Posts</h2>
        {posts.data && posts.data.length === 0 && (
          <EmptyState
            title="Sem posts"
            description={isMe ? 'Compartilhe algo no feed.' : undefined}
          />
        )}
        <div className="space-y-4">
          {posts.data?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  )
}
