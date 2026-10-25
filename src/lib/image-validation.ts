export const IMAGE_MAX_BYTES = 2 * 1024 * 1024
export const IMAGE_MAX_PIXELS = 4_000_000
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function hasExpectedSignature(file: File) {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (file.type === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (file.type === 'image/png') {
    return [137, 80, 78, 71, 13, 10, 26, 10].every(
      (byte, index) => bytes[index] === byte,
    )
  }
  return (
    file.type === 'image/webp' &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
}

export async function validateImageFile(file: File): Promise<string | null> {
  if (!allowedTypes.has(file.type)) {
    return 'Escolha uma imagem JPEG, PNG ou WebP.'
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return 'A imagem deve ter no máximo 2 MB.'
  }
  if (!(await hasExpectedSignature(file))) {
    return 'O conteúdo do arquivo não corresponde ao formato informado.'
  }

  try {
    const bitmap = await createImageBitmap(file)
    const pixels = bitmap.width * bitmap.height
    bitmap.close()
    if (pixels > IMAGE_MAX_PIXELS) {
      return 'A imagem deve ter no máximo 4 megapixels.'
    }
  } catch {
    return 'Não foi possível ler esta imagem.'
  }
  return null
}
