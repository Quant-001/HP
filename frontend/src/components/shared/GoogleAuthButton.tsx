import { useEffect, useRef, useState } from 'react'

interface GoogleCredentialResponse {
  credential?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black'
              size?: 'large' | 'medium' | 'small'
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
              shape?: 'rectangular' | 'pill' | 'circle' | 'square'
              width?: number
            }
          ) => void
        }
      }
    }
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
let googleScriptPromise: Promise<void> | null = null

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Unable to load Google sign-in.')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Unable to load Google sign-in.'))
    document.head.appendChild(script)
  })

  return googleScriptPromise
}

export function GoogleAuthButton({
  text,
  onCredential,
  onError,
}: {
  text: 'signin_with' | 'signup_with'
  onCredential: (credential: string) => void
  onError: (message: string) => void
}) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(Boolean(googleClientId))

  useEffect(() => {
    if (!googleClientId) {
      setReady(false)
      return
    }

    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return

        buttonRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential)
            } else {
              onError('Google did not return a credential.')
            }
          },
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          width: 382,
        })
        setReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          setReady(false)
          onError(err instanceof Error ? err.message : 'Unable to load Google sign-in.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [onCredential, onError, text])

  if (!googleClientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-400"
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in."
      >
        Continue with Google
      </button>
    )
  }

  return (
    <div className="min-h-[44px] w-full overflow-hidden rounded-lg">
      <div ref={buttonRef} className={!ready ? 'pointer-events-none opacity-50' : undefined} />
    </div>
  )
}
