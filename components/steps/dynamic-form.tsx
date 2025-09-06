"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"

interface DynamicFormProps {
  schema: any
  onValuesChange: (data: any) => void
  defaultValues?: any
}

export function DynamicForm({ schema, onValuesChange, defaultValues = {} }: DynamicFormProps) {
  const formSchema = z.object(
    Object.keys(schema).reduce((acc, key) => {
      const field = schema[key]
      let validator = z.string()
      if (field.required) {
        validator = validator.min(1, { message: `${key} is required` })
      }
      acc[key] = validator
      return acc
    }, {} as any),
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const watchedValues = form.watch();

  useEffect(() => {
    const stringifiedValues = JSON.stringify(watchedValues);
    onValuesChange(JSON.parse(stringifiedValues));
  }, [JSON.stringify(watchedValues), onValuesChange]);

  const renderField = (name: string, fieldConfig: any) => {
    const fieldType = fieldConfig.type?.toLowerCase();

    return (
      <div key={name}>
        <Label htmlFor={name}>{fieldConfig.description || name}</Label>
        <Controller
          name={name}
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <>
              {fieldType === 'string' ? (
                <Textarea id={name} {...field} className="mt-1 min-h-[120px]" />
              ) : (
                <Input id={name} {...field} className="mt-1" />
              )}
              {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
            </>
          )}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.keys(schema).map((fieldName) => renderField(fieldName, schema[fieldName]))}
    </div>
  )
}

