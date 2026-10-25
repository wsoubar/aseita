export interface ImageStorageAdapter {
  upload(
    path: string,
    file: File,
    contentType: string,
  ): Promise<{ error: unknown | null }>
  getPublicUrl(path: string): string
}

export async function uploadImageWithAdapter(
  storage: ImageStorageAdapter,
  userId: string,
  kind: 'avatars' | 'characters',
  file: File,
  id = crypto.randomUUID(),
): Promise<string> {
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `${userId}/${kind}/${id}.${extension}`
  const { error } = await storage.upload(path, file, file.type)
  if (error) throw error
  return storage.getPublicUrl(path)
}
