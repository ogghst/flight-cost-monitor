import { ApiProperty } from '@nestjs/swagger'
import { ZodObject, ZodSchema } from 'zod'

interface SwaggerSchemaOptions {
  examples?: Record<string, any>
}

export function SwaggerSchema(
  schema: ZodSchema,
  options?: SwaggerSchemaOptions
) {
  return function (target: any) {
    const prototype = target.prototype
    const shape = (schema as ZodObject<any>).shape

    // Add ApiProperty decorators for each property
    for (const key of Object.keys(shape)) {
      ApiProperty({
        example: options?.examples?.[key],
        required: !shape[key].isOptional?.(),
      })(prototype, key)
    }
  }
}
