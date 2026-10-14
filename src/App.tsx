import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ToastProvider } from './components/ui/toast'
import { AuthProvider } from './features/auth/AuthProvider'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { OnboardingPage } from './features/auth/pages/OnboardingPage'
import { FeedPage } from './features/feed/pages/FeedPage'
import { CharactersPage } from './features/characters/pages/CharactersPage'
import { CharacterDetailPage } from './features/characters/pages/CharacterDetailPage'
import { CharacterFormPage } from './features/characters/pages/CharacterFormPage'
import { ProfilePage } from './features/profile/pages/ProfilePage'
import { SettingsPage } from './features/profile/pages/SettingsPage'
import { RankingPage } from './features/ranking/pages/RankingPage'
import { isSupabaseConfigured } from './lib/supabase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function ConfigNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-6 text-center">
        <BookOpen className="mx-auto size-8 text-accent" />
        <h1 className="font-display text-xl font-bold">
          Configure o Supabase
        </h1>
        <p className="text-sm text-muted">
          Copie <code>.env.example</code> para <code>.env</code> e preencha
          <code> VITE_SUPABASE_URL</code> e{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> com os dados do seu projeto.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <ConfigNotice />

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<FeedPage />} />
                  <Route path="characters" element={<CharactersPage />} />
                  <Route
                    path="characters/new"
                    element={<CharacterFormPage />}
                  />
                  <Route
                    path="characters/:id"
                    element={<CharacterDetailPage />}
                  />
                  <Route
                    path="characters/:id/edit"
                    element={<CharacterFormPage />}
                  />
                  <Route path="u/:username" element={<ProfilePage />} />
                  <Route path="ranking" element={<RankingPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
