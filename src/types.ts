export interface System {
  id: string
  slug: string
  name: string
  description: string | null
}

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  preferred_system_id: string | null
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  owner_id: string
  system_id: string
  name: string
  description: string | null
  image_url: string | null
  data: Record<string, string>
  like_count: number
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  body: string
  created_at: string
}

export type ProfileRef = Pick<
  Profile,
  'id' | 'username' | 'display_name' | 'avatar_url'
>

export interface CharacterRef {
  id: string
  name: string
  image_url: string | null
  system: { name: string } | null
}

export interface FeedPost {
  id: string
  body: string
  created_at: string
  character_id: string | null
  author: ProfileRef
  character: CharacterRef | null
  likeCount: number
  commentCount: number
  liked: boolean
}

export interface CommentWithAuthor extends Comment {
  author: ProfileRef
}

export interface CharacterWithSystem extends Character {
  system: System
}

export interface PublicProfile extends Profile {
  preferred_system: System | null
}

export interface RankingRow {
  id: string
  name: string
  image_url: string | null
  owner_username: string
  system_id: string
  system_name: string
  score: number
  rank: number
}
