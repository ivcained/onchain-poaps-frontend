# Onchain POAPs Frontend

An open-source standalone web app and Farcaster Mini App for creating, distributing, minting, and collecting fully onchain POAPs on Base.

Status: implementation is starting from the contract-verified plan in `docs/IMPLEMENTATION_PLAN.md`.

Contract:

- Base Sepolia: `0xC3249356a483fbe17d5355D39105D2eA666d9de6`
- Source: https://github.com/jvaleskadevs/onchain-poaps
- Inspected source commit: `c313c856cd9f26bbc9e61e4ef12cb3e463409708`

The supplied contract is not modified by this project.

## Development policy

- Test actual Base Sepolia interactions rather than claiming mocked writes as complete.
- Keep contract timing, permissions, hashing, and validation aligned with deployed bytecode and verified source.
- Never commit wallet private keys or Farcaster account-association signing secrets.

## License

MIT
