# Onchain POAPs Frontend Build Plan

> **For Firstmate:** Execute this plan through isolated ship tasks with `no-mistakes` delivery and yolo off. Do not modify the supplied smart contract.

## Outcome

Ship an MIT-licensed standalone website and Farcaster Mini App that lets an event organizer create, distribute, manage, and explain fully onchain ERC-1155 POAPs, and lets an attendee preview, mint, verify, collect, and share them.

The product must feel useful at an actual event. A creator should be able to start with an SVG and an attendee list, choose a distribution method in plain language, generate links or QR codes, and watch claims arrive. An attendee should open one link, understand the POAP, see whether they qualify, and mint without learning contract terminology.

## Source of truth

- Repository: `https://github.com/ivcained/onchain-poaps-frontend`
- Contract source: `https://github.com/jvaleskadevs/onchain-poaps`
- Inspected contract commit: `c313c856cd9f26bbc9e61e4ef12cb3e463409708`
- Base Sepolia contract: `0xC3249356a483fbe17d5355D39105D2eA666d9de6`
- Chain ID: `84532`
- Do not modify or redeploy the contract.
- Run upstream contract tests with `forge test --via-ir`; plain compilation hits stack-too-deep in `registerEvent`.

## Contract compatibility table

| Capability | Contract call | Restriction |
| --- | --- | --- |
| Register | `registerEvent(name, description, eventDate, location, root, svg, externalUrl, flags)` | Name and SVG required. Name max 128 bytes, description max 512, location and URL max 128, flags 0-3. |
| Public mint | `mint(eventId)` | Event public and wallet has not claimed. |
| Allowlist mint | `allowlistMint(eventId, proof)` | Nonzero root, packed-address Merkle leaf, wallet has not claimed. |
| Signature mint | `mintWithSignature(eventId, signature)` | Creator signature binds event ID, chain ID, recipient. Expires after 37 days. |
| Creator drop | `creatorMint(eventId, recipients)` | Creator only, first 30 days, at most 101 addresses per call. Already-claimed recipients are skipped. |
| Set root | `updateAllowlistRoot(eventId, root)` | Creator only, once, first 30 days. |
| Public control | `updateEventPublic(eventId, enabled)` | Creator only, first 30 days. |
| Gallery | `balanceOf`, `uri`, `events`, `hasClaimed`, `totalSupply` and logs | URI is fully onchain base64 JSON with base64 SVG. |
| Transfer | ERC-1155 transfer calls | Soulbound event tokens reject transfers. |

Flags:

| Value | Transfer | Public mint |
| --- | --- | --- |
| 0 | Transferable | Closed |
| 1 | Soulbound | Closed |
| 2 | Transferable | Open |
| 3 | Soulbound | Open |

## Product structure

Use five top-level destinations that work at 320px and in a Farcaster modal:

1. Discover - browse live POAPs and open a claim.
2. Create - register and preview a POAP.
3. Distribute - choose public, allowlist, signatures, QR, or creator drop.
4. Collection - show POAPs owned by the connected wallet.
5. Docs - explain the complete protocol in plain language.

Desktop may use a wider two-column workspace. The Mini App must preserve complete mint and creator workflows rather than showing a reduced promotional shell.

## Technical architecture

- React 18, TypeScript, Vite.
- Wagmi v2, Viem, TanStack Query.
- `@farcaster/miniapp-sdk` and `@farcaster/miniapp-wagmi-connector`.
- Browser routing with stable `/poap/:id`, `/claim/:id`, `/create`, `/studio/:id`, `/collection`, and `/docs/*` URLs.
- Static deployment plus server or edge routes only for dynamic embed HTML and optional public read caching.
- Onchain state and logs remain authoritative.
- Generate allowlist roots and proofs in the browser. Never upload a full private attendee list unless the creator explicitly chooses an export/hosting path.
- Creator signatures are requested from the connected creator wallet. Never collect creator private keys.
- Simulate each write before presenting it, wait for the receipt, then read back resulting state before success.

## Milestones and ship tasks

### Milestone 0 - Foundation and contract lock

#### Task 0.1 - Application scaffold

Create Vite React TypeScript setup, package scripts, Vitest, Testing Library, ESLint, Prettier, CI, Base Sepolia environment schema, and production-safe `.gitignore`.

Acceptance:
- `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- CI runs the same canonical commands.
- No secret or private-key fields exist in client configuration.

#### Task 0.2 - ABI and deployed-contract harness

Add the exact ABI and address, typed contract helpers, event definitions, custom error mappings, deployment block, and Base Sepolia public client.

Acceptance:
- Live integration test reads `CREATOR_TIMELOCK`, `totalEvents`, event 0, and `uri(0)`.
- Data URI decoder produces valid JSON and SVG.
- Upstream `forge test --via-ir` passes in documented evidence.

#### Task 0.3 - App shell and design language

Build a distinctive event-pass design system: ticket edges, onchain seal, clear role switching, compact mobile navigation, accessible controls, reduced-motion behavior, and explicit wallet/network state.

Acceptance:
- Reflows at 320px and 200% zoom.
- All controls have accessible names and at least 44px mobile targets where practical.
- No critical workflow is hidden behind hover.

### Milestone 1 - Discovery and POAP detail

#### Task 1.1 - Event indexer

Read `NewEvent`, `NewMint`, `AllowlistUpdated`, and `EventPublicUpdated` logs in bounded block ranges. Cache public reads without treating cache as authority.

Acceptance:
- Handles RPC range limits and retries.
- Deduplicates logs by transaction hash and log index.
- Shows stale/error state rather than fake empty results.

#### Task 1.2 - Metadata decoder

Decode onchain `data:application/json;base64` and nested `data:image/svg+xml;base64`, validate fields, and render artwork safely.

Acceptance:
- No unsafe direct SVG HTML injection.
- Malformed metadata gets an actionable fallback.
- Tests include quotes, Unicode, empty optional fields, and large SVGs.

#### Task 1.3 - Event detail and mint preview

Build `/poap/:id` with artwork, metadata, creator, date, location, external URL, supply, soulbound status, distribution methods, deadlines, current-wallet claim state, BaseScan, and CAIP-2 identifier.

Acceptance:
- Every availability statement comes from live contract state.
- Preview shows exactly what will be minted before any wallet prompt.

### Milestone 2 - Registration

#### Task 2.1 - SVG studio

Support SVG file upload and paste, local sanitization/preview, byte count, structural validation, and an optional SVGO optimization pass with before/after size comparison.

Acceptance:
- Original and optimized source remain reviewable.
- User chooses which version to register.
- Empty/non-SVG/unsafe preview inputs fail clearly.

#### Task 2.2 - Registration form

Support every contract parameter and enforce byte limits rather than misleading character counts. Explain event date, location, external URL, soulbound, public status, and allowlist implications.

Acceptance:
- Flags are covered by all four combinations in tests.
- Optional date maps deliberately to Unix seconds, including an explicit unset value.
- Final review displays exact calldata inputs and permanence warning.

#### Task 2.3 - Live registration

Simulate, submit, confirm, parse `NewEvent`, read the event back, and navigate to the new detail page.

Acceptance:
- Real Base Sepolia registration transaction recorded in `docs/TESTNET_EVIDENCE.md`.
- Receipt and readback agree on event ID and creator.

### Milestone 3 - Minting

#### Task 3.1 - Availability engine

Derive public, allowlist, and signature availability; creator deadlines; signature deadline; ownership; and already-claimed state.

Acceptance:
- Boundary tests cover exactly-at-deadline and one-second-after.
- No disabled mechanism is presented as usable.

#### Task 3.2 - Public mint

Implement preview, simulation, wallet transaction, confirmation, state readback, BaseScan link, gallery refresh, and Farcaster share action.

Acceptance:
- One real public mint receipt.
- Duplicate mint attempt is blocked before wallet prompt and still rejected by the contract if forced.

#### Task 3.3 - Allowlist mint

Accept proof JSON or proof-bearing claim URL, verify locally against the onchain root and connected wallet, then mint.

Acceptance:
- One eligible real mint succeeds.
- Wrong wallet, wrong proof, wrong event, and changed root fail before wallet prompt.

#### Task 3.4 - Signature mint

Accept signature or signed claim URL, recover signer locally, verify creator/event/chain/recipient/deadline, then mint.

Acceptance:
- One real signature mint succeeds from a distinct recipient.
- Wrong signer, recipient, chain, event, and expired event fail clearly.

### Milestone 4 - Distribution studio

#### Task 4.1 - Distribution chooser

Ask concrete event questions and recommend public QR, allowlist, recipient signatures, or creator drop. Show tradeoffs and deadlines.

Acceptance:
- Recommendations are deterministic and tested.
- Users may override the recommendation.

#### Task 4.2 - Allowlist builder

Import CSV/newline addresses, normalize, checksum, deduplicate, identify invalid/zero addresses, compute packed-address leaves with sorted pairs, root, and proofs.

Acceptance:
- Root/proofs are byte-compatible with Solidity `MerkleProof.verify` and the deployed contract.
- Export contains chain, contract, event, root, recipient, and proof.
- Full address list remains local by default.

#### Task 4.3 - Set allowlist root

Creator-only, one-time root transaction with 30-day countdown, simulation, confirmation, and readback.

Acceptance:
- Real Base Sepolia root update and eligible/ineligible proof evidence.

#### Task 4.4 - Public mint control

Creator-only open/close control with obvious state, countdown, simulation, receipt, and readback.

Acceptance:
- Real close and reopen transactions recorded.

#### Task 4.5 - Creator drop

Import recipients, identify claims, split into chunks of at most 101, preview every chunk, and require a separate confirmation per transaction.

Acceptance:
- Real drop receipt.
- Already-claimed recipient is shown as skipped after readback.

#### Task 4.6 - Signature and QR studio

Generate recipient-bound messages and wallet signatures, verify recovery, create per-recipient URLs/QRs, and export CSV/ZIP. Generate one shared QR only for public or allowlist flows.

Acceptance:
- Never imply one signature QR works for arbitrary wallets.
- QR round-trip tests recover all parameters without exposing unrelated recipients.

### Milestone 5 - Collection

#### Task 5.1 - My POAPs

Build ownership gallery from `NewMint` logs and verify each candidate with current `balanceOf`.

Acceptance:
- Transferred-away POAPs are not shown as owned.
- Cards show artwork, event identity, soulbound status, and claim transaction.

#### Task 5.2 - Collection detail and sharing

Add detailed collectible views, BaseScan verification, OpenSea link where available, and dynamic Farcaster share embed.

Acceptance:
- Embed image is same-origin, 3:2, at least 600x400, under 10 MB, and anonymously fetchable.

### Milestone 6 - Docs and education

#### Task 6.1 - Complete docs

Write task-oriented docs for creating, metadata, SVG optimization, soulbound/transferable, public mint, allowlists, proof generation, signature mint, QR distribution, creator permissions, deadlines, restrictions, and verification.

Acceptance:
- An event organizer can complete each distribution flow without external help.
- Contract language is translated into plain language without weakening constraints.

#### Task 6.2 - Contextual education

Place short explanations and “why choose this?” help at decisions, with links to deeper docs.

Acceptance:
- No core form assumes knowledge of Merkle roots, ECDSA, ERC-1155, or calldata.

### Milestone 7 - Farcaster Mini App

#### Task 7.1 - SDK lifecycle

Call `sdk.actions.ready()` immediately, detect Mini App context safely, add explicit install action, and preserve standalone browser operation.

Acceptance:
- No splash hang.
- No unsolicited add prompt.
- Complete mint and creator paths work in the Mini App viewport.

#### Task 7.2 - Manifest and embeds

Add signed manifest, required Base Sepolia chain/capabilities, root embed, event-specific embeds, claim-specific embeds, same-origin images, and “Collect POAP” actions.

Acceptance:
- Manifest validates.
- Embed tool displays artwork and launches the correct event/claim route.

#### Task 7.3 - Farcaster sharing

Compose casts after registration and mint, preserve claim links, and provide useful contextual text.

Acceptance:
- Shared cast is readable and actionable without exposing attendee lists or reusable private claim material.

### Milestone 8 - Release and bounty evidence

#### Task 8.1 - Deployment

Deploy stable standalone and Mini App URLs with HTTPS, security headers, cache rules, error monitoring, and documented repeatable deployment.

#### Task 8.2 - Verification matrix

Run unit, integration, E2E, accessibility, responsive, lint, type, build, and actual Base Sepolia write tests. Record links and readbacks.

Required real transactions:
- Registration.
- Public mint.
- Allowlist root update and allowlist mint.
- Signature mint.
- Public close and open.
- Creator drop.
- Soulbound transfer rejection via simulation/test.
- Transferable transfer success using a test event/token.

#### Task 8.3 - Public release

Complete README, architecture, setup, deployment, security, contribution, contract compatibility, and troubleshooting docs. Tag a release only after CI and testnet matrix pass.

#### Task 8.4 - Cast and claim package

Post from the required Farcaster account, tag `@jvaleska.eth` and `@kenny`, include Mini App, standalone app, and GitHub links, read the cast back, verify its embed, capture a real screenshot, and assemble the POIDH claim.

No cast or bounty claim may be called complete without a returned cast URL, screenshot file, and publicly readable URLs.

## Cross-cutting safety rules

- Never request or store user private keys.
- Do not send full allowlists to analytics or logs.
- Do not render untrusted SVG via raw HTML.
- Validate chain ID, contract, event ID, recipient, root, proof, signer, and deadline before wallet prompts.
- Simulate all writes where supported.
- Lock transaction actions while pending and recover pending hashes after reload.
- A submitted hash is not success. Wait for receipt and read back exact state.
- Treat RPC logs as discovery; verify ownership and mutable state with contract reads.
- Never claim OpenSea indexing immediately after mint.
- Never claim mainnet support while the configured contract is Base Sepolia.

## Canonical quality gates

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:integration
npm run test:e2e
```

For upstream contract evidence:

```bash
forge test --via-ir
```

For every project-facing PR:
- Run the repository’s no-mistakes gate.
- Require spec review first and code-quality/security review second.
- Do not merge without captain approval.

## Definition of done

Done means every contract capability is reachable through a usable frontend, every required Base Sepolia state change has real receipt and readback evidence, the app works standalone and inside Farcaster, the public repository can be deployed by another developer, documentation is sufficient for an organizer, and the final cast and claim artifacts have been verified rather than drafted.
