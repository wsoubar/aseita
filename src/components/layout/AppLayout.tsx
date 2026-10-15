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
  const { profile, user } = useAuth()
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
    <div className="min-h-dvh pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <BookOpen className="size-5 text-accent" />
            <span className="font-display text-lg font-bold">A Seita</span>
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface-2 text-ink'
                      : 'text-muted hover:text-ink',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={cycleTheme}
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
              title={`Tema: ${pref === 'light' ? 'claro' : pref === 'dark' ? 'escuro' : 'sistema'}`}
              aria-label="Alternar tema"
            >
              <ThemeIcon className="size-5" />
            </button>
            {profile && (
              <NavLink
                to={`/u/${profile.username}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-2"
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
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
              title="Configurações"
            >
              <Settings className="size-5" />
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
              title="Sair"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
        {!user && null}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
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
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium',
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
