import type z from 'zod'

export async function parseBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
): Promise<z.infer<T> | Response> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return new Response(null, { status: 400 })
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return new Response(null, { status: 400 })
  }
  return parsed.data
}
