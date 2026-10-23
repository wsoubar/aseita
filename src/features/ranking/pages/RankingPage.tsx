import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { Skeleton } from '../../../components/ui/skeleton'
import { useSystems } from '../../systems/api'
import { useRanking } from '../api'
import { cn } from '../../../lib/utils'

export function RankingPage() {
  const [systemId, setSystemId] = useState('')
  const systems = useSystems()
  const ranking = useRanking(systemId || undefined)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Trophy className="size-5 text-accent" /> Ranking
        </h1>
        <p className="page-description">Os personagens mais queridos da comunidade.</p>
      </div>

      <select
        value={systemId}
        onChange={(e) => setSystemId(e.target.value)}
        aria-label="Filtrar ranking por sistema"
        className="form-control sm:w-64"
      >
        <option value="">Todos os sistemas</option>
        {systems.data?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {ranking.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {ranking.isError && <ErrorState message="Erro ao carregar o ranking." />}

      {ranking.data && ranking.data.length === 0 && (
        <EmptyState
          icon={<Trophy className="size-8" />}
          title="Ranking vazio"
          description="Publique posts vinculados a personagens para movimentar o ranking."
        />
      )}

      <ol className="space-y-2">
        {ranking.data?.map((row) => (
          <li key={row.id}>
            <Link
              to={`/characters/${row.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-all hover:border-muted hover:bg-surface/80 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold',
                  row.rank <= 3 ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted',
                )}
              >
                {String(row.rank).padStart(2, '0')}
              </span>
              {row.image_url ? (
                <img
                  src={row.image_url}
                  alt={row.name}
                  loading="lazy"
                  className="size-10 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-medium tracking-wide text-muted">
                  RPG
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{row.name}</p>
                <p className="truncate text-xs text-muted">
                  @{row.owner_username} · {row.system_name}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-accent">
                {row.score}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
