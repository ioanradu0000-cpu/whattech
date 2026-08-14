import type { DeviceCategory } from './device'

export type ForumTopic = 'charging-power' | 'display' | 'performance' | 'software' | 'connectivity' | 'audio' | 'accessories' | 'other'
export type ForumStatus = 'open' | 'solved'

export type ForumDevice = {
  id: string
  brand: string
  model: string
  category: DeviceCategory
}

export type ForumReply = {
  id: string
  postId: string
  authorName: string
  body: string
  isAccepted: boolean
  helpfulCount: number
  createdAt: string
}

export type ForumPost = {
  id: string
  authorName: string
  title: string
  body: string
  device: ForumDevice
  topic: ForumTopic
  status: ForumStatus
  replyCount: number
  viewCount: number
  helpfulCount: number
  createdAt: string
  updatedAt: string
  replies?: ForumReply[]
}

export type ForumListResult = {
  posts: ForumPost[]
}

export type NewForumPost = Pick<ForumPost, 'authorName' | 'title' | 'body' | 'device' | 'topic'> & { website?: string }
export type NewForumReply = Pick<ForumReply, 'authorName' | 'body'> & { postId: string; website?: string }
