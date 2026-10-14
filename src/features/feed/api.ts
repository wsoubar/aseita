import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type {
  CommentWithAuthor,
  FeedPost,
  ProfileRef,
} from '../../types'

export const FEED_PAGE_SIZE = 10

interface RawPost {
  id: string
  body: string
  created_at: string
  character_id: string | null
  author: ProfileRef
  character: FeedPost['character']
  likes: { count: number }[]
  comments: { count: number }[]
}

const POST_SELECT = `
  id, body, created_at, character_id,
  author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
  character:characters(id, name, image_url, system:systems(name)),
  likes(count),
  comments(count)
`

export async function listPosts(
  page: number,
  userId?: string,
): Promise<FeedPost[]> {
  const from = page * FEED_PAGE_SIZE
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .range(from, from + FEED_PAGE_SIZE - 1)
  if (error) throw error

  const rows = data as unknown as RawPost[]
  const ids = rows.map((r) => r.id)

  let likedIds = new Set<string>()
  if (userId && ids.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', ids)
    likedIds = new Set(
      ((likes ?? []) as { post_id: string }[]).map((l) => l.post_id),
    )
  }

  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    created_at: r.created_at,
    character_id: r.character_id,
    author: r.author,
    character: r.character,
    likeCount: r.likes?.[0]?.count ?? 0,
    commentCount: r.comments?.[0]?.count ?? 0,
    liked: likedIds.has(r.id),
  }))
}

export async function listAuthorPosts(
  authorId: string,
  viewerId?: string,
): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error

  const rows = data as unknown as RawPost[]
  const ids = rows.map((r) => r.id)
  let likedIds = new Set<string>()
  if (viewerId && ids.length > 0) {
    const { data: likes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', viewerId)
      .in('post_id', ids)
    likedIds = new Set(
      ((likes ?? []) as { post_id: string }[]).map((l) => l.post_id),
    )
  }
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    created_at: r.created_at,
    character_id: r.character_id,
    author: r.author,
    character: r.character,
    likeCount: r.likes?.[0]?.count ?? 0,
    commentCount: r.comments?.[0]?.count ?? 0,
    liked: likedIds.has(r.id),
  }))
}

export function useFeed(userId?: string) {  return useInfiniteQuery({
    queryKey: ['feed', userId],
    queryFn: ({ pageParam }) => listPosts(pageParam, userId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === FEED_PAGE_SIZE ? allPages.length : undefined,
    enabled: Boolean(userId),
  })
}

export function useAuthorPosts(authorId?: string, viewerId?: string) {
  return useQuery({
    queryKey: ['author-posts', authorId, viewerId],
    enabled: Boolean(authorId),
    queryFn: () => listAuthorPosts(authorId as string, viewerId),
  })
}

export function useCreatePost(userId: string) {  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { body: string; character_id: string | null }) => {
      const { error } = await supabase
        .from('posts')
        .insert({ ...input, author_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', userId] })
    },
  })
}

export function useDeletePost(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', userId] })
    },
  })
}

export function useToggleLike(userId: string) {
  const queryClient = useQueryClient()
  type Input = { postId: string; liked: boolean }

  return useMutation({
    mutationFn: async ({ postId, liked }: Input) => {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: userId })
        if (error) throw error
      }
    },
    onMutate: async ({ postId, liked }) => {
      const key = ['feed', userId]
      await queryClient.cancelQueries({ queryKey: key })
      const previous =
        queryClient.getQueryData<InfiniteData<FeedPost[]>>(key)
      queryClient.setQueryData<InfiniteData<FeedPost[]>>(key, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    liked: !liked,
                    likeCount: post.likeCount + (liked ? -1 : 1),
                  }
                : post,
            ),
          ),
        }
      })
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['feed', userId], context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['feed', userId] })
    },
  })
}

export function useComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['comments', postId],
    enabled,
    queryFn: async (): Promise<CommentWithAuthor[]> => {
      const { data, error } = await supabase
        .from('comments')
        .select(
          'id, post_id, author_id, body, created_at, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)',
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as unknown as CommentWithAuthor[]
    },
  })
}

export function useCreateComment(postId: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: userId, body })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      void queryClient.invalidateQueries({ queryKey: ['feed', userId] })
    },
  })
}

export function useDeleteComment(postId: string, userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      void queryClient.invalidateQueries({ queryKey: ['feed', userId] })
    },
  })
}
