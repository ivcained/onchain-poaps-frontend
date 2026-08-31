# Onchain POAPs frontend

A Vite + React + TypeScript frontend for creating, distributing, minting, and collecting fully onchain POAPs on Base Sepolia.

## Development

```bash
npm install
npm run dev
```

The app defaults to the deployed Base Sepolia contract. For another environment, copy `.env.example` to `.env` and provide:

```text
VITE_CHAIN_ID=84532
VITE_POAP_CONTRACT_ADDRESS=0xC3249356a483fbe17d5355D39105D2eA666d9de6
VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Production build

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run preview
```

This is an SPA. Configure the host to serve `dist/index.html` for unknown application routes so these URLs survive a browser refresh:

- `/create`
- `/gallery`
- `/poap/:eventId`
- `/claim?event=:eventId`

Do not put wallet private keys or provider secrets in Vite environment variables. `VITE_*` values are public.

## Contract

- Network: Base Sepolia (`84532`)
- Contract: `0xC3249356a483fbe17d5355D39105D2eA666d9de6`
- Explorer: https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6

The smart contract is not part of this repository and is not modified by the frontend.

## Mini App

The Farcaster metadata scaffold lives at `public/.well-known/farcaster.json`. Before production submission, replace the deployment placeholders with the real HTTPS hostname, hosted icon/splash assets, webhook endpoint if used, and account-association signature generated for that domain.

## License

MIT
