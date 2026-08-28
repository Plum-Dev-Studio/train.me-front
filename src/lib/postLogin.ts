export const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect'

export function consumePostLoginRedirect(): string | null {
  const redirectTo = localStorage.getItem(POST_LOGIN_REDIRECT_KEY)
  if (redirectTo) {
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
  }
  return redirectTo
}

export function homePathForRole(role: string): '/app' | '/' {
  return role === 'trainer' ? '/app' : '/'
}

export async function resolvePostLoginPath(
  loadCurrentUser: () => Promise<{ role: string }>,
): Promise<string> {
  const redirectTo = consumePostLoginRedirect()
  if (redirectTo) return redirectTo
  const user = await loadCurrentUser()
  return homePathForRole(user.role)
}
