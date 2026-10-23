import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { ButtonLink } from '../../../components/ui/button'
import { PageHeading } from '../../../components/ui/page-heading'
import { Input } from '../../../components/ui/input'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { Skeleton } from '../../../components/ui/skeleton'
import { useSystems } from '../../systems/api'
import { useCharacters } from '../api'
import type { CharacterWithSystem } from '../../../types'

export function CharactersPage() {
  const [search, setSearch] = useState('')
  const [systemId, setSystemId] = useState('')
  const systems = useSystems()
  const characters = useCharacters({ search, systemId: systemId || undefined })

  return (
    <div className="space-y-5">
      <PageHeading
        title="Personagens"
        description="Explore fichas da comunidade ou crie a sua."
        action={
          <ButtonLink to="/characters/new" icon={<Plus className="size-4" />}>
            Novo
          </ButtonLink>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9"
            aria-label="Buscar personagens"
          />
        </div>
        <select
          value={systemId}
          onChange={(e) => setSystemId(e.target.value)}
          aria-label="Filtrar por sistema"
          className="form-control sm:w-auto"
        >
          <option value="">Todos os sistemas</option>
          {systems.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {characters.isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}

      {characters.isError && (
        <ErrorState message="Erro ao carregar personagens." />
      )}

      {characters.data && characters.data.length === 0 && (
        <EmptyState
          icon={<Users className="size-8" />}
          title="Nenhum personagem encontrado"
          description="Ajuste a busca ou crie uma nova ficha."
          action={
            <ButtonLink to="/characters/new" icon={<Plus className="size-4" />}>
              Criar personagem
            </ButtonLink>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {characters.data?.map((c: CharacterWithSystem) => (
          <Link
            key={c.id}
            to={`/characters/${c.id}`}
            className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-muted hover:shadow-lg hover:shadow-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {c.image_url ? (
              <img
                src={c.image_url}
                alt={c.name}
                loading="lazy"
                className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-surface-2 font-display text-sm font-medium tracking-wide text-muted">
                RPG
              </div>
            )}
            <div className="space-y-0.5 p-3">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="truncate text-xs text-muted">{c.system.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
