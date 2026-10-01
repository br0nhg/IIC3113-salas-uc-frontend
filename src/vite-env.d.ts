/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API del backend. Si no está definida, se usan datos mock. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
