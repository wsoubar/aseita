export const IMAGE_VARIANT_MAX_EDGE = {
  avatars: 512,
  characters: 1600,
} as const

const OUTPUT_QUALITIES = [0.82, 0.72, 0.62, 0.52]
const OUTPUT_MAX_BYTES = 2 * 1024 * 1024

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Não foi possível converter esta imagem.'))
      },
      'image/webp',
      quality,
    )
  })
}

export async function convertImageForUpload(
  file: File,
  kind: 'avatars' | 'characters',
): Promise<File> {
  const bitmap = await createImageBitmap(file)
  try {
    const maxEdge = IMAGE_VARIANT_MAX_EDGE[kind]
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Não foi possível preparar esta imagem.')
    context.drawImage(bitmap, 0, 0, width, height)

    for (const quality of OUTPUT_QUALITIES) {
      const blob = await canvasBlob(canvas, quality)
      if (blob.size <= OUTPUT_MAX_BYTES) {
        const basename = file.name.replace(/\.[^.]+$/, '') || 'imagem'
        return new File([blob], `${basename}.webp`, {
          type: 'image/webp',
          lastModified: Date.now(),
        })
      }
    }
    throw new Error('A imagem convertida ainda ultrapassa 2 MB.')
  } finally {
    bitmap.close()
  }
}
