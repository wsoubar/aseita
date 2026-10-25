import { supabase } from './supabase'
import { uploadImageWithAdapter } from './image-storage-core'

export const IMAGE_BUCKET = 'aseita-images'
export { IMAGE_ACCEPT, IMAGE_MAX_BYTES, IMAGE_MAX_PIXELS, validateImageFile } from './image-validation'

export async function uploadImage(
  userId: string,
  kind: 'avatars' | 'characters',
  file: File,
): Promise<string> {
  const bucket = supabase.storage.from(IMAGE_BUCKET)
  return uploadImageWithAdapter(
    {
      upload: async (path, image, contentType) => {
        const { error } = await bucket.upload(path, image, {
          contentType,
          cacheControl: '31536000',
          upsert: false,
        })
        return { error }
      },
      getPublicUrl: (path) => bucket.getPublicUrl(path).data.publicUrl,
    },
    userId,
    kind,
    file,
  )
}

export async function removeUploadedImage(url: string | null | undefined) {
  if (!url) return
  const path = getUploadedImagePath(url)
  if (!path) return
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path])
  if (error) throw error
}

function getUploadedImagePath(url: string): string | null {
  try {
    const parsed = new URL(url)
    const project = new URL(import.meta.env.VITE_SUPABASE_URL)
    const prefix = `/storage/v1/object/public/${IMAGE_BUCKET}/`
    if (parsed.origin !== project.origin || !parsed.pathname.startsWith(prefix)) {
      return null
    }
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length))
    return path.split('/')[0] ? path : null
  } catch {
    return null
  }
}

export function removeUploadedImageBestEffort(url: string | null | undefined) {
  void removeUploadedImage(url).catch(() => undefined)
}
