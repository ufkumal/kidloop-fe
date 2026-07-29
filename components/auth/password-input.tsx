'use client'

import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

interface PasswordInputProps {
  id?: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

export function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  invalid = false,
  describedBy,
  disabled,
}: PasswordInputProps) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup className="h-11 rounded-xl">
      <InputGroupInput
        id={inputId}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className="px-3.5"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
