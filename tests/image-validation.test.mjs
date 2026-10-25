import assert from 'node:assert/strict'
import { File } from 'node:buffer'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import test, { before } from 'node:test'

const require = createRequire(import.meta.url)
let validateImageFile
let uploadImageWithAdapter
let convertImageForUpload

before(async () => {
  const ts = require('typescript')
  async function importTypeScript(path) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8')
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
    return import(moduleUrl)
  }
  ;({ validateImageFile } = await importTypeScript('../src/lib/image-validation.ts'))
  ;({ uploadImageWithAdapter } = await importTypeScript('../src/lib/image-storage-core.ts'))
  ;({ convertImageForUpload } = await importTypeScript('../src/lib/image-conversion.ts'))
})

function file(type, signature, size) {
  const bytes = new Uint8Array(size ?? signature.length)
  bytes.set(signature)
  return new File([bytes], 'image', { type })
}

async function withBitmap(t, dimensions, run) {
  const original = globalThis.createImageBitmap
  globalThis.createImageBitmap = async () => {
    if (dimensions instanceof Error) throw dimensions
    return { ...dimensions, close() {} }
  }
  t.after(() => {
    if (original) globalThis.createImageBitmap = original
    else delete globalThis.createImageBitmap
  })
  await run()
}

async function withCanvas(t, { width, height, blobSize = 128 }, run) {
  const previousBitmap = globalThis.createImageBitmap
  const previousDocument = globalThis.document
  const previousFile = globalThis.File
  const state = { canvas: null, closed: false, qualities: [] }
  globalThis.File = File
  globalThis.createImageBitmap = async () => ({
    width,
    height,
    close() {
      state.closed = true
    },
  })
  globalThis.document = {
    createElement(tag) {
      assert.equal(tag, 'canvas')
      const canvas = {
        width: 0,
        height: 0,
        getContext() {
          return {
            drawImage(_bitmap, _x, _y, drawWidth, drawHeight) {
              state.drawnSize = [drawWidth, drawHeight]
            },
          }
        },
        toBlob(callback, type, quality) {
          assert.equal(type, 'image/webp')
          state.qualities.push(quality)
          callback(new Blob([new Uint8Array(blobSize)], { type }))
        },
      }
      state.canvas = canvas
      return canvas
    },
  }
  t.after(() => {
    if (previousBitmap) globalThis.createImageBitmap = previousBitmap
    else delete globalThis.createImageBitmap
    if (previousDocument) globalThis.document = previousDocument
    else delete globalThis.document
    if (previousFile) globalThis.File = previousFile
    else delete globalThis.File
  })
  await run(state)
}

const formats = [
  ['image/jpeg', [0xff, 0xd8, 0xff]],
  ['image/png', [137, 80, 78, 71, 13, 10, 26, 10]],
  ['image/webp', [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]],
]

test('accepts JPEG, PNG and WebP with matching file signatures', async (t) => {
  await withBitmap(t, { width: 100, height: 100 }, async () => {
    for (const [type, signature] of formats) {
      assert.equal(await validateImageFile(file(type, signature)), null)
    }
  })
})

test('rejects formats outside the allowlist', async () => {
  assert.equal(
    await validateImageFile(file('image/gif', [71, 73, 70, 56])),
    'Escolha uma imagem JPEG, PNG ou WebP.',
  )
})

test('rejects files larger than 2 MB and accepts the exact limit', async (t) => {
  await withBitmap(t, { width: 100, height: 100 }, async () => {
    const jpeg = [0xff, 0xd8, 0xff]
    assert.equal(
      await validateImageFile(file('image/jpeg', jpeg, 2 * 1024 * 1024)),
      null,
    )
    assert.equal(
      await validateImageFile(file('image/jpeg', jpeg, 2 * 1024 * 1024 + 1)),
      'A imagem deve ter no máximo 2 MB.',
    )
  })
})

test('rejects a file whose content does not match its declared MIME type', async () => {
  assert.equal(
    await validateImageFile(file('image/png', [0, 1, 2, 3])),
    'O conteúdo do arquivo não corresponde ao formato informado.',
  )
})

test('accepts exactly 4 MP and rejects larger decoded images', async (t) => {
  await withBitmap(t, { width: 2000, height: 2000 }, async () => {
    assert.equal(
      await validateImageFile(file('image/png', formats[1][1])),
      null,
    )
  })
  await withBitmap(t, { width: 2001, height: 2000 }, async () => {
    assert.equal(
      await validateImageFile(file('image/png', formats[1][1])),
      'A imagem deve ter no máximo 4 megapixels.',
    )
  })
})

test('rejects images the browser cannot decode', async (t) => {
  await withBitmap(t, new Error('decode failed'), async () => {
    assert.equal(
      await validateImageFile(file('image/webp', formats[2][1])),
      'Não foi possível ler esta imagem.',
    )
  })
})

test('uploads to a user-owned path and returns the public URL', async () => {
  const uploaded = []
  const image = file('image/jpeg', formats[0][1])
  const url = await uploadImageWithAdapter(
    {
      async upload(path, body, contentType) {
        uploaded.push({ path, body, contentType })
        return { error: null }
      },
      getPublicUrl(path) {
        return `https://project.supabase.co/storage/v1/object/public/aseita-images/${path}`
      },
    },
    'user-123',
    'avatars',
    image,
    'fixed-id',
  )

  assert.deepEqual(uploaded, [
    {
      path: 'user-123/avatars/fixed-id.jpg',
      body: image,
      contentType: 'image/jpeg',
    },
  ])
  assert.equal(
    url,
    'https://project.supabase.co/storage/v1/object/public/aseita-images/user-123/avatars/fixed-id.jpg',
  )
})

test('does not return a public URL when storage rejects the upload', async () => {
  const storageError = new Error('upload denied')
  await assert.rejects(
    uploadImageWithAdapter(
      {
        async upload() {
          return { error: storageError }
        },
        getPublicUrl() {
          assert.fail('URL must not be requested after an upload error')
        },
      },
      'user-123',
      'characters',
      file('image/png', formats[1][1]),
      'fixed-id',
    ),
    storageError,
  )
})

test('converts avatars to WebP with a 512 px maximum edge', async (t) => {
  await withCanvas(t, { width: 1200, height: 600 }, async (state) => {
    const result = await convertImageForUpload(
      new File(['original'], 'portrait.png', { type: 'image/png' }),
      'avatars',
    )
    assert.deepEqual(state.drawnSize, [512, 256])
    assert.equal(result.name, 'portrait.webp')
    assert.equal(result.type, 'image/webp')
    assert.equal(result.size, 128)
    assert.equal(state.closed, true)
    assert.deepEqual(state.qualities, [0.82])
  })
})

test('converts character art to WebP with a 1600 px maximum edge', async (t) => {
  await withCanvas(t, { width: 3200, height: 1600 }, async (state) => {
    await convertImageForUpload(
      new File(['original'], 'character.jpeg', { type: 'image/jpeg' }),
      'characters',
    )
    assert.deepEqual(state.drawnSize, [1600, 800])
    assert.equal(state.closed, true)
  })
})

test('retries lower WebP quality until the converted file fits the bucket limit', async (t) => {
  await withCanvas(t, { width: 800, height: 800, blobSize: 3 * 1024 * 1024 }, async (state) => {
    await assert.rejects(
      convertImageForUpload(
        new File(['original'], 'photo.png', { type: 'image/png' }),
        'avatars',
      ),
      /ultrapassa 2 MB/,
    )
    assert.deepEqual(state.qualities, [0.82, 0.72, 0.62, 0.52])
    assert.equal(state.closed, true)
  })
})
