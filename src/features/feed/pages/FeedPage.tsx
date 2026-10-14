import { useEffect, useRef } from 'react'
import { MessageSquareText } from 'lucide-react'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { PostSkeleton } from '../../../components/ui/skeleton'
import { Spinner } from '../../../components/ui/spinner'
import { useAuth } from '../../auth/context'
import { useFeed } from '../api'
import { PostCard } from '../components/PostCard'
import { PostComposer } from '../components/PostComposer'

export function FeedPage() {
  const { user } = useAuth()
  const feed = useFeed(user?.id)
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sentinel.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && feed.hasNextPage) {
        void feed.fetchNextPage()
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [feed])

  const posts = feed.data?.pages.flat() ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold">Feed</h1>
        <PostComposer />
      </div>

      {feed.isLoading && (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {feed.isError && <ErrorState message="Erro ao carregar o feed." />}

      {!feed.isLoading && posts.length === 0 && (
        <EmptyState
          icon={<MessageSquareText className="size-8" />}
          title="Nenhum post ainda"
          description="Seja o primeiro a contar uma história da sua mesa."
        />
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {feed.isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner className="text-muted" />
        </div>
      )}
      <div ref={sentinel} className="h-1" />
    </div>
  )
}
