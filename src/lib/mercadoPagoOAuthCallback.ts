export function getMercadoPagoOAuthCallbackMessage(
  status: string,
  reason: string | null,
): string | null {
  if (status === 'success') {
    return 'Mercado Pago conectado correctamente.'
  }

  if (status !== 'error') {
    return null
  }

  switch (reason) {
    case 'MP_AUTH_DENIED':
      return 'Cancelaste o rechazaste la autorización en Mercado Pago.'
    case 'MP_STATE_EXPIRED':
      return 'La sesión de conexión expiró. Volvé a intentar conectar tu cuenta.'
    case 'MP_STATE_MISMATCH':
      return 'No pudimos validar la conexión. Volvé a intentar conectar tu cuenta.'
    case 'MP_TOKEN_REFRESH_FAILED':
      return 'Hubo un problema al guardar las credenciales. Intentá conectar nuevamente.'
    case 'MP_OAUTH_ERROR':
      return 'Mercado Pago rechazó la conexión. Revisá tu cuenta e intentá de nuevo.'
    default:
      return 'No pudimos conectar tu cuenta de Mercado Pago. Intentá nuevamente.'
  }
}
