import { getAuth, getSignInUrl } from '../../../authkit/serverFunctions'

type AuthResult =
  | {
      user: NonNullable<Awaited<ReturnType<typeof getAuth>>['auth']['user']>
      organisationId?: string
    }
  | Response

export async function requireUiAuth(request: Request): Promise<AuthResult> {
  const { auth, organisationId } = await getAuth()
  if (!auth.user) {
    // These proxy routes are often hit as part of browser-driven flows (GitHub App
    // setup/callback) where redirecting to sign-in provides a better UX than a
    // raw 401. We include the current path/query so the user returns here after
    // authentication.
    const url = new URL(request.url)
    const returnPathname = `${url.pathname}${url.search}`
    const signInUrl = await getSignInUrl({ data: returnPathname })
    return new Response(null, {
      status: 302,
      headers: {
        Location: signInUrl,
      },
    })
  }

  return { user: auth.user, organisationId: organisationId || undefined }
}

export function withForwardedHostProto(request: Request): Headers {
  const url = new URL(request.url)
  const headers = new Headers(request.headers)

  const forwardedHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    url.host
  const forwardedProto =
    request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')

  headers.set('X-Forwarded-Host', forwardedHost)
  headers.set('X-Forwarded-Proto', forwardedProto)
  return headers
}

export function getOrchestratorBackendUrl(): string {
  const base = process.env.ORCHESTRATOR_BACKEND_URL
  if (!base) {
    throw new Error('ORCHESTRATOR_BACKEND_URL is not set')
  }
  return base.replace(/\/+$/, '')
}
