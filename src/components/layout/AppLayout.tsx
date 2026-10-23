import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Home,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  Trophy,
  User,
  Users,
} from 'lucide-react'
import { Avatar } from '../ui/avatar'
import { useAuth } from '../../features/auth/context'
import { auth } from '../../features/auth/api'
import { cn } from '../../lib/utils'
import { useTheme } from '../../lib/theme'
import type { ThemePref } from '../../lib/theme'

const links = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/characters', label: 'Personagens', icon: Users },
  { to: '/ranking', label: 'Ranking', icon: Trophy },
]

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const

const themeOrder: ThemePref[] = ['light', 'dark', 'system']

export function AppLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { pref, setPref } = useTheme()

  const ThemeIcon = themeIcons[pref]

  function cycleTheme() {
    const next = themeOrder[(themeOrder.indexOf(pref) + 1) % themeOrder.length]
    setPref(next)
  }

  async function handleLogout() {
    await auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink to="/" className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <span className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent">
              <BookOpen className="size-[18px]" />
            </span>
            <span className="font-display text-[1.05rem] font-semibold tracking-tight">A Seita</span>
          </NavLink>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 sm:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-muted hover:bg-surface-2/70 hover:text-ink',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={cycleTheme}
              className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              title={`Tema: ${pref === 'light' ? 'claro' : pref === 'dark' ? 'escuro' : 'sistema'}`}
              aria-label="Alternar tema"
            >
              <ThemeIcon className="size-5" />
            </button>
            {profile && (
              <NavLink
                to={`/u/${profile.username}`}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-accent"
                title="Meu perfil"
              >
                <Avatar
                  src={profile.avatar_url}
                  name={profile.display_name}
                  size={28}
                />
              </NavLink>
            )}
            <NavLink
              to="/settings"
              className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              title="Configurações"
            >
              <Settings className="size-5" />
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex size-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              title="Sair"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-9">
        <Outlet />
      </main>

      <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 pt-1.5">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.68rem] font-medium transition-colors',
                  isActive ? 'text-accent' : 'text-muted',
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to={profile ? `/u/${profile.username}` : '/settings'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[0.68rem] font-medium transition-colors',
                isActive ? 'text-accent' : 'text-muted',
              )
            }
          >
            <User className="size-5" />
            Perfil
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
