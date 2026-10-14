import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '../../../components/ui/button'
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Personagens</h1>
        <Link to="/characters/new">
          <Button icon={<Plus className="size-4" />}>Novo</Button>
        </Link>
      </div>

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
          className="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
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
            <Link to="/characters/new">
              <Button icon={<Plus className="size-4" />}>Criar personagem</Button>
            </Link>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {characters.data?.map((c: CharacterWithSystem) => (
          <Link
            key={c.id}
            to={`/characters/${c.id}`}
            className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-colors hover:border-muted"
          >
            {c.image_url ? (
              <img
                src={c.image_url}
                alt={c.name}
                loading="lazy"
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-accent-soft font-display text-accent">
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
