import assert from 'node:assert/strict'
import { File } from 'node:buffer'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import test, { before } from 'node:test'

const require = createRequire(import.meta.url)
let validateImageFile
let uploadImageWithAdapter

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
