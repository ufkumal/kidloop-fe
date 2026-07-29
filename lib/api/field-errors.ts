import { ApiError, type FieldErrors } from '@/lib/api/client'

/**
 * Backend'in alan bazlı doğrulama hatalarını form alanlarına eşler.
 *
 * `map` ile backend alan adı -> form alan adı çevirisi yapılabilir.
 * Eşleşmeyen alanlar yok sayılır; genel mesaj yine üstteki uyarıda görünür.
 */
export function mapApiFieldErrors<TField extends string>(
  error: unknown,
  allowedFields: readonly TField[],
  map: Partial<Record<string, TField>> = {},
): Partial<Record<TField, string>> {
  if (!(error instanceof ApiError) || !error.fieldErrors) return {}
  return pickFields(error.fieldErrors, allowedFields, map)
}

function pickFields<TField extends string>(
  fieldErrors: FieldErrors,
  allowedFields: readonly TField[],
  map: Partial<Record<string, TField>>,
): Partial<Record<TField, string>> {
  const result: Partial<Record<TField, string>> = {}

  for (const [rawField, message] of Object.entries(fieldErrors)) {
    const mapped = map[rawField] ?? (allowedFields as readonly string[]).find(
      (field) => field.toLowerCase() === rawField.toLowerCase(),
    )
    if (mapped) result[mapped as TField] = message
  }

  return result
}
