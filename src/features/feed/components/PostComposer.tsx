import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Dialog } from '../../../components/ui/dialog'
import { Field, Textarea } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/toast-context'
import { postSchema } from '../../../lib/schemas'
import { useAuth } from '../../auth/context'
import { useMyCharacters } from '../../characters/api'
import { useCreatePost } from '../api'

export function PostComposer() {
  const { user } = useAuth()
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [characterId, setCharacterId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const characters = useMyCharacters(user?.id)
  const createPost = useCreatePost(user?.id ?? '')

  async function handleSubmit() {
    const parsed = postSchema.safeParse({
      body,
      character_id: characterId,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }
    try {
      await createPost.mutateAsync({
        body: parsed.data.body,
        character_id: parsed.data.character_id || null,
      })
      setBody('')
      setCharacterId('')
      setError(null)
      setOpen(false)
      show('Post publicado!', 'success')
    } catch {
      show('Não foi possível publicar', 'error')
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={<PenLine className="size-4" />}
        className="w-full sm:w-auto"
      >
        Novo post
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo post">
        <div className="space-y-4">
          <Field
            label="O que está acontecendo na sua mesa?"
            error={error ?? undefined}
            htmlFor="post-body"
          >
            <Textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Conte sobre a sessão, uma ideia de build, uma dúvida..."
              maxLength={1000}
            />
          </Field>

          <Field
            label="Personagem (opcional)"
            htmlFor="post-character"
            hint="Vincule um personagem para contar nos likes e no ranking."
          >
            <select
              id="post-character"
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="form-control"
            >
              <option value="">Nenhum</option>
              {characters.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.system.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createPost.isPending}
              disabled={!body.trim()}
            >
              Publicar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
