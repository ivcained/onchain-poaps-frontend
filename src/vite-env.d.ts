/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID: string
  readonly VITE_POAP_CONTRACT_ADDRESS: string
  readonly VITE_BASE_SEPOLIA_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
