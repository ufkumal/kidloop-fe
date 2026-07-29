'use client'

import { CircleAlert } from 'lucide-react'
import { OptionCard } from '@/components/onboarding/option-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup } from '@/components/ui/radio-group'
import { INPUT_CLASS } from '@/lib/ui'
import type { NormalizedQuestion } from '@/lib/types/onboarding'

export interface DynamicQuestionRendererProps {
  question: NormalizedQuestion
  value: string
  onChange: (value: string) => void
  error?: string | null
  disabled?: boolean
  /** Tek soru gösterilen akışta başlık h2 olarak büyütülür. */
  emphasis?: boolean
}

/**
 * Soru tipine göre uygun kontrolü seçer. Yeni bir tip eklendiğinde
 * yalnızca aşağıdaki switch'e yeni bir dal eklemek yeterlidir;
 * desteklenmeyen tipler tamamlanmış gibi gösterilmez.
 */
export function DynamicQuestionRenderer({
  question,
  value,
  onChange,
  error,
  disabled,
  emphasis = false,
}: DynamicQuestionRendererProps) {
  const fieldId = `question-${question.code}`
  const describedById = question.description ? `${fieldId}-description` : undefined

  const labelContent = (
    <>
      {question.title}
      {question.required ? (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </>
  )

  const description = question.description ? (
    <FieldDescription id={describedById}>{question.description}</FieldDescription>
  ) : null

  if (question.type === 'SINGLE_CHOICE' && question.options.length > 0) {
    return (
      <FieldSet data-invalid={error ? true : undefined}>
        <FieldLegend
          className={emphasis ? 'text-lg font-semibold sm:text-xl' : 'text-base'}
        >
          {labelContent}
        </FieldLegend>
        {description}
        <RadioGroup
          name={question.code}
          value={value}
          onValueChange={(next) => onChange(String(next ?? ''))}
          disabled={disabled}
          aria-label={question.title}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className="gap-3"
        >
          {question.options.map((option) => (
            <OptionCard
              key={option.code}
              option={option}
              name={question.code}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldSet>
    )
  }

  if (question.type === 'TEXT' || question.type === 'DATE' || question.type === 'NUMBER') {
    const inputType =
      question.type === 'DATE' ? 'date' : question.type === 'NUMBER' ? 'number' : 'text'

    return (
      <Field data-invalid={error ? true : undefined} data-disabled={disabled ? true : undefined}>
        <FieldLabel
          htmlFor={fieldId}
          className={emphasis ? 'text-lg font-semibold sm:text-xl' : undefined}
        >
          {labelContent}
        </FieldLabel>
        {description}
        <Input
          id={fieldId}
          name={question.code}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder}
          disabled={disabled}
          required={question.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          autoComplete="off"
          className={INPUT_CLASS}
          {...(question.type === 'DATE' ? { max: new Date().toISOString().slice(0, 10) } : null)}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
    )
  }

  // Desteklenmeyen tipler: sessizce atlanmaz, açıkça bildirilir.
  return (
    <Field>
      <FieldLabel className={emphasis ? 'text-lg font-semibold sm:text-xl' : undefined}>
        {question.title}
      </FieldLabel>
      {description}
      <Alert className="rounded-2xl border-border bg-warm px-4 py-3 text-warm-foreground">
        <CircleAlert />
        <AlertTitle>Bu soru tipi henüz desteklenmiyor</AlertTitle>
        <AlertDescription>
          {question.rawType
            ? `“${question.rawType}” tipindeki sorular yakında eklenecek. Bu adımı şimdilik atlayabilirsin.`
            : 'Bu soru tipi yakında eklenecek. Bu adımı şimdilik atlayabilirsin.'}
        </AlertDescription>
      </Alert>
    </Field>
  )
}
