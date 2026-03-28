import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/login', '/auth']

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  if (!user && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
