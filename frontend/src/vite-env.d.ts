/// <reference types="vite/client" />
/// <reference types="node" />

interface ImportMetaEnv {
  readonly VITE_API_ADMIN_URL: string
  readonly VITE_API_PUBLIC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}