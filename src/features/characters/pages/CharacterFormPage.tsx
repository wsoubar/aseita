import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { PageHeading } from '../../../components/ui/page-heading'
import { Field, Input, Textarea } from '../../../components/ui/input'
import { EmptyState, ErrorState } from '../../../components/ui/empty-state'
import { FullPageSpinner } from '../../../components/ui/spinner'
import { useToast } from '../../../components/ui/toast-context'
import { DESCRIPTION_MAX, characterSchema } from '../../../lib/schemas'
import type { CharacterValues } from '../../../lib/schemas'
import { useAuth } from '../../auth/context'
import { useSystems } from '../../systems/api'
import {
  useCharacter,
  useCreateCharacter,
  useUpdateCharacter,
} from '../api'
import type { CharacterDetail } from '../api'

interface Attribute {
  key: string
  value: string
}

function attrsToRecord(attrs: Attribute[]): Record<string, string> {
  const record: Record<string, string> = {}
  for (const { key, value } of attrs) {
    const trimmed = key.trim()
    if (trimmed) record[trimmed] = value.trim()
  }
  return record
}

export function CharacterFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const existing = useCharacter(id)

  if (isEdit) {
    if (existing.isLoading) return <FullPageSpinner />
    if (existing.isError)
      return <ErrorState message="Erro ao carregar o personagem." />
    if (!existing.data)
      return <EmptyState title="Personagem não encontrado" />
    return <CharacterForm key={existing.data.id} character={existing.data} />
  }

  return <CharacterForm />
}

function CharacterForm({ character }: { character?: CharacterDetail }) {
  const isEdit = Boolean(character)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { show } = useToast()
  const systems = useSystems()
  const createCharacter = useCreateCharacter(user?.id ?? '')
  const updateCharacter = useUpdateCharacter(character?.id ?? '')

  const [attributes, setAttributes] = useState<Attribute[]>(() =>
    Object.entries(character?.data ?? {}).map(([key, value]) => ({
      key,
      value,
    })),
  )
  const [preview, setPreview] = useState(character?.image_url ?? '')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CharacterValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: character?.name ?? '',
      system_id: character?.system_id ?? '',
      description: character?.description ?? '',
      image_url: character?.image_url ?? '',
    },
  })

  const descriptionLength = useWatch({ control, name: 'description' }).length
  const remaining = DESCRIPTION_MAX - descriptionLength

  async function onSubmit(values: CharacterValues) {
    const data = attrsToRecord(attributes)
    try {
      if (character) {
        await updateCharacter.mutateAsync({ values, data })
        show('Personagem atualizado.', 'success')
        navigate(`/characters/${character.id}`)
      } else {
        const created = await createCharacter.mutateAsync({ values, data })
        show('Personagem criado!', 'success')
        navigate(`/characters/${created.id}`)
      }
    } catch {
      show('Não foi possível salvar o personagem.', 'error')
    }
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title={isEdit ? 'Editar personagem' : 'Novo personagem'}
        description="Monte uma ficha para compartilhar com a comunidade."
      />

      <Card className="p-5 sm:p-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {preview && (
            <img
              src={preview}
              alt="Prévia"
              className="h-48 w-full rounded-xl border border-line object-cover sm:h-64"
            />
          )}

          <Field
            label="Nome"
            error={errors.name?.message}
            htmlFor="name"
          >
            <Input id="name" {...register('name')} />
          </Field>

          <Field
            label="Sistema"
            error={errors.system_id?.message}
            htmlFor="system_id"
          >
            <select
              id="system_id"
              className="form-control"
              {...register('system_id')}
            >
              <option value="">Selecione...</option>
              {systems.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="URL da imagem"
            error={errors.image_url?.message}
            htmlFor="image_url"
            hint="Opcional. Apenas links externos (sem upload)."
          >
            <Input
              id="image_url"
              placeholder="https://..."
              {...register('image_url', {
                onChange: (e: ChangeEvent<HTMLInputElement>) =>
                  setPreview(e.target.value),
              })}
            />
          </Field>

          <Field
            label="Descrição / história"
            error={errors.description?.message}
            htmlFor="description"
          >
            <Textarea
              id="description"
              maxLength={DESCRIPTION_MAX}
              {...register('description')}
            />
            <p
              className={`text-right text-xs ${
                remaining <= 100 ? 'text-danger' : 'text-muted'
              }`}
            >
              {remaining} caracteres restantes
            </p>
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Atributos (opcional)</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus className="size-4" />}
                onClick={() =>
                  setAttributes((prev) => [...prev, { key: '', value: '' }])
                }
              >
                Adicionar
              </Button>
            </div>
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Atributo (ex.: Classe)"
                  value={attr.key}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((a, i) =>
                        i === index ? { ...a, key: e.target.value } : a,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Valor (ex.: Mago)"
                  value={attr.value}
                  onChange={(e) =>
                    setAttributes((prev) =>
                      prev.map((a, i) =>
                        i === index ? { ...a, value: e.target.value } : a,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Remover atributo"
                  onClick={() =>
                    setAttributes((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="rounded-lg p-2 text-muted hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <Link
              to={character ? `/characters/${character.id}` : '/characters'}
              className="text-sm text-muted hover:text-ink"
            >
              Cancelar
            </Link>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Salvar' : 'Criar personagem'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
