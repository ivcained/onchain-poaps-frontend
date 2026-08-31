# Onchain POAPs: contest build plan

## Where the project stands

The current working copy is:

`/root/.treehouse/onchain-poaps-frontend-e4eb62/2/onchain-poaps-frontend`

Branch:

`fm/poap-m0-1-r2`

Latest verified fix:

`e1d8e8c`

Remote:

`https://github.com/ivcained/onchain-poaps-frontend`

The project is a Vite + React + TypeScript scaffold configured for Base Sepolia. The existing foundation includes environment validation, RPC URL validation, test/typecheck/lint/build scripts, Vitest and Testing Library setup, ESLint/Prettier, CI, an `.env.example`, contributor/security guidance, and a placeholder UI. The latest checks recorded in `docs/PROGRESS.md` passed: 8 tests, typecheck, lint, and production build.

The project is not yet a functional POAP app. Contract writes, minting, allowlist tooling, signature distribution, gallery, docs UI, Farcaster Mini App behavior, deployment, and claim evidence remain to be built.

The contract source is the authority. The deployed Base Sepolia address is:

`0xC3249356a483fbe17d5355D39105D2eA666d9de6`

Chain ID:

`84532`

RPC:

`https://sepolia.base.org`

## Product thesis

Build an "event artifact studio": a calm, visual tool that takes an organizer from artwork to distribution, and takes an attendee from a shared link to a verified collectible.

The app should not present blockchain mechanics as the primary experience. It should present four jobs:

- Create an event artifact.
- Choose how it gets distributed.
- Mint it.
- Keep and verify the collection.

Use artwork as the dominant visual element. Use deadlines as logistics, not jargon. Explain cryptographic concepts only when the user reaches the relevant workflow.

## Non-negotiable rules

- Do not modify the smart contract.
- Do not mock production contract interactions.
- Keep private keys and API secrets out of the frontend.
- Treat every deadline as chain-derived state.
- Show the exact transaction target, chain, event, recipient, and mint method before writes.
- Keep allowlist and signature generation local in the browser where practical.
- Make standalone web routes and Mini App routes use the same product surfaces.
- Ship evidence for every bounty requirement, not only screenshots of the landing page.

## Architecture

### Frontend stack

Keep the current Vite/React/TypeScript base. Add:

- `viem` for typed chain reads, writes, ABI encoding, event parsing, and signature recovery helpers.
- `wagmi` for wallet connection, chain state, account state, and transaction lifecycle.
- A wallet UI adapter compatible with normal browsers and Farcaster Mini Apps.
- `@farcaster/miniapp-sdk` for Mini App initialization and readiness.
- `merkletreejs` or a small auditable Merkle implementation for address-list roots/proofs.
- `qrcode` for browser-side signature/claim QR generation.
- `svgo` only if the chosen browser integration is safe and bundle size is acceptable; otherwise provide a local optimization path and a clear optimizer download/instruction.
- Vitest, Testing Library, and Playwright for unit, integration, and browser checks.

Do not add a backend for secrets unless a later product decision requires hosted signature issuance. The first version should be client-side and permissionless.

### Suggested source tree

```text
src/
  app/
    router.tsx
    routes/
      HomeRoute.tsx
      DiscoverRoute.tsx
      CreateRoute.tsx
      EventRoute.tsx
      MintRoute.tsx
      GalleryRoute.tsx
      DocsRoute.tsx
  chain/
    baseSepolia.ts
    poapAbi.ts
    poapClient.ts
    reads.ts
    writes.ts
    errors.ts
    explorers.ts
  features/
    registration/
    minting/
    allowlist/
    signatures/
    gallery/
    farcaster/
  components/
    ArtworkStage.tsx
    EventMetadata.tsx
    DeadlineStrip.tsx
    TransactionPanel.tsx
    MethodCard.tsx
    WalletButton.tsx
  lib/
    svg.ts
    merkle.ts
    signatures.ts
    deadlines.ts
    metadata.ts
    urls.ts
  docs/
    content.ts
  test/
    fixtures/
```

## Phase 0: contract truth and chain foundation

### Goal

Make the frontend contract-accurate before building a polished shell around assumptions.

### Tasks

1. Pin the contract source commit used for development.
2. Extract and review the `OnchainPOAPs` ABI.
3. Confirm exact public functions:
   - `events(uint256)`
   - `hasClaimed(uint256,address)`
   - `totalEvents()`
   - `registerEvent(...)`
   - `mint(uint256)`
   - `allowlistMint(uint256,bytes32[])`
   - `mintWithSignature(uint256,bytes)`
   - `creatorMint(uint256,address[])`
   - `updateAllowlistRoot(uint256,bytes32)`
   - `updateEventPublic(uint256,bool)`
   - ERC-1155 balance/URI functions where relevant
4. Confirm emitted events and custom errors.
5. Implement deadline calculations from `createdAt`:
   - creator controls: 30 days
   - signature minting: 37 days
6. Implement contract error decoding and plain-language messages.
7. Implement Base Sepolia chain configuration and wallet switching.
8. Add transaction lifecycle state and receipt links.

### Acceptance

- Reads work against the deployed Base Sepolia contract.
- A typed ABI is checked into the repository.
- No function signature is copied from a secondary summary without checking source.
- Unit tests cover flags and deadline calculations.

## Phase 1: product shell and navigation

### Goal

Give the product a usable shape before adding each transaction flow.

### Routes

- `/` — product entry and featured/recent events.
- `/discover` — event discovery.
- `/create` — registration wizard.
- `/poap/:eventId` — event detail and method availability.
- `/poap/:eventId/mint` — mint router.
- `/manage/:eventId` — creator controls and distribution tools.
- `/gallery` — owned POAP collection.
- `/docs` — task-oriented documentation.

### UX direction

- Desktop: two-column shell with artwork stage and task panel.
- Mobile: artwork first, then action cards.
- A compact header with network, wallet, and route navigation.
- Strong state labels: `Open`, `Allowlist`, `Signature`, `Creator window closed`, `Already claimed`.
- Avoid a generic crypto dashboard. Use an editorial card system with sharp artwork frames, warm paper/ink surfaces, and a single electric accent for onchain status.

### Acceptance

- Every route has loading, empty, error, and disconnected-wallet states.
- Navigation works in a standalone browser and in a constrained Mini App viewport.
- The app remains usable at 320px width.

## Phase 2: registration

### Goal

Let an organizer create a real POAP in one guided flow.

### Form model

```ts
type RegistrationForm = {
  name: string
  description: string
  eventDate: number
  location: string
  allowlistRoot: `0x${string}`
  svgImage: string
  externalUrl: string
  isSoulbound: boolean
  isPublic: boolean
}
```

The contract uses `flags`, so the UI maps the two boolean toggles to:

- `0`: transferable, public mint off
- `1`: soulbound, public mint off
- `2`: transferable, public mint on
- `3`: soulbound, public mint on

### Validation

- Name: 1–128 bytes/characters according to the contract’s actual behavior.
- Description: max 512.
- Location: max 128.
- External URL: max 128.
- SVG: non-empty and valid XML; warn about size and unsupported/external references.
- Event date: clearly define whether zero means no date and match contract behavior.
- Allowlist root: zero or valid 32-byte hex value.

### Artwork handling

- Parse and preview SVG before submission.
- Remove scripts, external image references, external stylesheets, and unsafe links.
- Show original byte count and optimized byte count.
- Keep the final submitted SVG visible in the confirmation panel.
- If optimization cannot run in-browser reliably, link to SVGO and provide a copy/download path.
- Warn before large calldata/gas submissions.

### Idea-to-SVG generator

Add a first-class `Generate SVG` option in the artwork step. The simplest reliable model is not “ask an AI for arbitrary SVG and inject the result.” It is:

```text
user idea -> structured visual brief -> constrained SVG scene -> live preview -> edit/regenerate -> validate -> register
```

The generator should produce a structured scene description first, then render that description through our own SVG renderer. This prevents malformed or executable markup and gives users predictable editing controls.

#### User flow

1. User chooses `Generate from an idea`.
2. User enters a plain-language idea, for example:
   `A midnight desert festival with a silver moon, three orange stars, and a small campfire.`
3. Optional guided controls refine the idea:
   - mood: calm, electric, playful, ceremonial, mysterious
   - palette: auto, warm, cool, monochrome, custom
   - composition: emblem, poster, landscape, abstract mark
   - density: minimal, balanced, rich
   - text: event name on/off
4. The app turns the idea into a typed scene model.
5. The scene model renders to SVG locally.
6. The user sees a live preview and can change individual controls without rewriting the prompt.
7. The user can regenerate variations, edit the event title, adjust colors, remove elements, or choose a poster frame.
8. The app validates and sanitizes the final SVG.
9. The user sees the exact final SVG that will be sent to `registerEvent`.

#### Scene model

Use a deliberately small schema:

```ts
type SvgScene = {
  width: number
  height: number
  background: { color: string; gradient?: string[] }
  shapes: Array<
    | { kind: 'circle'; cx: number; cy: number; r: number; fill: string }
    | { kind: 'rect'; x: number; y: number; width: number; height: number; fill: string; rx?: number }
    | { kind: 'path'; d: string; fill: string; stroke?: string; strokeWidth?: number }
    | { kind: 'text'; x: number; y: number; value: string; fill: string; size: number; anchor: 'start' | 'middle' | 'end' }
  >
  filters?: Array<'soft-shadow' | 'glow'>
}
```

The model must reject unknown element kinds and unsupported attributes. The renderer should be deterministic and produce a normalized SVG string.

#### How the idea becomes artwork

There are two compatible modes:

- Local deterministic mode: keyword/rule-based composition creates a good result without an API key. This should be the default fallback and can make attractive geometric/event-emblem artwork.
- AI-assisted mode: an LLM or image model converts the user’s idea into the typed `SvgScene` JSON. The application validates the JSON against the schema, drops unknown fields, clamps values, and renders it locally. The model never writes directly into the DOM or registration payload.

This gives users the ease of natural-language generation without trusting model-produced raw SVG.

#### Editing controls

After generation, expose controls that map directly to the scene model:

- palette swatches
- background style
- shape density
- accent color
- title text
- title size/position
- contrast mode
- regenerate variation
- undo/redo
- download SVG
- copy SVG
- switch to manual editor

A simple “make it warmer,” “less busy,” or “remove the text” action can update the structured scene through a constrained transformation rather than replacing the whole artwork unexpectedly.

#### SVG safety and contract checks

Before registration:

- Allow only an SVG root plus the renderer’s approved elements/attributes.
- Remove scripts, event handlers, external URLs, foreign objects, embedded HTML, external stylesheets, and unsafe references.
- Restrict filters and gradients to an allowlist.
- Normalize colors and numeric attributes.
- Validate XML.
- Show raw byte size and Base64-expanded size estimate.
- Warn when the SVG approaches the recommended contract payload size.
- Render the exact final string in a sandboxed preview.
- Make clear that the artwork is stored permanently onchain.

#### Generated artwork UX copy

Use plain language:

- `Describe the feeling. We’ll draw a collectible emblem.`
- `Your artwork is generated as editable vector shapes.`
- `Nothing is registered until you approve the final preview.`
- `The final SVG is stored onchain with your POAP.`
- `Need a different direction? Try another variation.`

#### Acceptance

- A user can enter an idea and receive a valid SVG without knowing SVG syntax.
- The preview is deterministic and editable.
- The generated SVG contains no scripts, external resources, or unsupported markup.
- The exact submitted SVG is visible before the wallet transaction.
- The flow works without an AI provider.
- AI assistance, when enabled, produces validated scene JSON rather than raw executable SVG.

### Generated artwork option

Add an optional `Create artwork` path beside upload/paste SVG:

1. User describes the event mood, subject, palette, and visual constraints.
2. The app generates a still concept through a provider adapter.
3. The user can accept, regenerate, or edit the result.
4. The accepted image is converted into a contract-safe SVG treatment or used as visual reference for an SVG composition.
5. The registration preview shows exactly what will be encoded and submitted.

Do not put provider API keys in the browser. Use one of these modes:

- `VITE_IMAGE_PROVIDER_MODE=external`: the app calls a small server-side proxy whose provider key is server-only.
- `VITE_IMAGE_PROVIDER_MODE=local`: the app exposes a prompt/export workflow and the operator runs a local image tool.
- `VITE_IMAGE_PROVIDER_MODE=disabled`: upload/paste remains fully functional.

The frontend must remain usable with generation unavailable. Generation is an assistive authoring feature, not a registration dependency.

### Motion-to-GIF option

A short text-to-video path can create a motion concept for previews and sharing:

```text
prompt -> video provider -> short MP4/WebM -> frame extraction -> optimized animated GIF preview
```

Use this for:

- A moving preview on the create screen.
- A shareable event teaser.
- A Farcaster preview asset.
- A gallery hover/preview treatment.

Do not submit the GIF as the contract artwork. The contract accepts an SVG string and stores it onchain. The generated motion should produce a static SVG poster frame or be used only as an offchain presentation asset. Always keep a static SVG fallback for the actual POAP.

Prefer this implementation boundary:

- Browser: prompt entry, job status, preview, cancellation, poster-frame selection, GIF/WebM preview.
- Server-side job endpoint: provider authentication, generation request, polling, download, size limits, cleanup.
- Browser/local worker: extract a small number of frames and build a preview GIF when feasible.
- Object storage: optional, short-lived, public preview assets only; never store secrets.

Guardrails:

- Hard cap generated video duration, resolution, file size, and frame count.
- Cancel abandoned jobs.
- Expire temporary media.
- Strip metadata from exported previews where practical.
- Never allow generated HTML/SVG to execute scripts or external resources.
- Show provider/cost status before starting a paid generation job.
- Keep the upload/paste SVG route first-class.

### Acceptance

- Register a real event on Base Sepolia.
- Parse `NewEvent` and route to `/poap/:eventId`.
- Re-read event data from chain after confirmation.
- Show the creator’s control deadline.
- A user can complete registration without an image/video provider.
- A generated still can be accepted as a design input and converted into a safe static SVG result.
- A generated motion preview never becomes the only copy of the registration artwork.

## Phase 3: event detail and mint router

### Goal

Make the correct mint path obvious to an attendee.

### Event page

Show:

- Artwork from the onchain SVG pointer/metadata path.
- Event name, description, date, location, URL, creator.
- Soulbound/transferable badge.
- Public status.
- Allowlist status.
- Signature window countdown.
- Creator control deadline where relevant.
- Claimed status for the connected wallet.
- Contract and explorer links.

### Mint router

Calculate available methods from chain state:

- Public: `isPublic == true`.
- Allowlist: nonzero root, with proof supplied or retrievable.
- Signature: current time within `createdAt + 37 days`, with a valid creator signature.

Before writing, show:

- Event artwork.
- Recipient wallet.
- Method.
- Network and contract.
- Event ID.
- Relevant deadline.
- The fact that one wallet can claim only once.

After writing, show:

- Transaction hash.
- Confirmed block.
- BaseScan link.
- OpenSea link if the network supports the resulting asset page.
- Refreshed ownership state.

### Acceptance

- Public mint succeeds against the real contract.
- Already-claimed and disabled-method errors are readable.
- Wrong-network flow is recoverable.

## Phase 4: allowlist studio

### Goal

Turn an address list into a configured allowlist without requiring Merkle-tree knowledge.

### Creator flow

1. Explain what an allowlist does.
2. Accept newline, CSV, or JSON addresses.
3. Normalize checksum casing for display while hashing exactly as required by the contract.
4. Report invalid and duplicate addresses.
5. Generate the root and proofs locally.
6. Let the creator download:
   - normalized address list
   - root
   - address-to-proof JSON
   - optional claim links
7. Show the one-time nature of `updateAllowlistRoot`.
8. Show remaining creator-window time.
9. Confirm the exact root before signing.
10. Write the root onchain.

### Important contract detail

The contract’s leaf is `keccak256(abi.encodePacked(msg.sender))`. The proof generator must match this exactly. Do not assume an amount-bearing leaf format.

### Acceptance

- A real root is generated.
- The root is set onchain once.
- A recipient can use a generated proof to call `allowlistMint` successfully.
- The UI refuses to pretend a root can be changed after it is set.

## Phase 5: public controls and creator management

### Goal

Give creators clear control without hiding irreversible constraints.

### Tasks

- Build `/manage/:eventId`.
- Detect creator by comparing connected address with `events(eventId).creator`.
- Show `isPublic` state.
- Enable `updateEventPublic(eventId, bool)` only within 30 days.
- Explain that the creator window is chain-derived and cannot be extended by the frontend.
- Add creator batch mint using `creatorMint` with a 101-recipient cap.
- Validate recipient addresses and split larger lists into explicit batches only after user confirmation.

### Acceptance

- Open/close public mint calls the actual contract.
- Creator-only and expiry errors are handled.
- Batch mint never silently exceeds 101 recipients.

## Phase 6: signature distribution

### Goal

Make live-event distribution practical.

### Signing model

The contract verifies an Ethereum signed message over:

```text
keccak256(abi.encodePacked(eventId, block.chainid, recipient))
```

The frontend must:

- Display the recipient and event before signing.
- Build the exact packed message.
- Request a wallet signature from the creator.
- Export signatures in a portable JSON format.
- Generate a QR code containing a claim URL or compact encoded payload.
- Show the 37-day validity window.

Example artifact shape:

```json
{
  "chainId": 84532,
  "contract": "0xC3249356a483fbe17d5355D39105D2eA666d9de6",
  "eventId": "1",
  "recipient": "0x...",
  "signature": "0x...",
  "expiresAt": 0
}
```

`expiresAt` is UI metadata unless the contract signs/verifies it; never imply that an unsigned UI field is enforced onchain.

### QR experience

- Creator selects `Make attendee QR`.
- App generates a claim URL containing event ID and signature payload.
- Attendee opens the URL in a normal browser or Mini App.
- Attendee connects their wallet.
- App checks that the connected recipient matches the signed recipient.
- App shows the exact POAP and submits `mintWithSignature`.

### Acceptance

- A creator can sign a real payload.
- A recipient can mint successfully on Base Sepolia.
- Wrong recipient, wrong chain, expired window, and replay are tested.
- Private keys are never requested outside the wallet provider.

## Phase 7: gallery

### Goal

Make ownership feel like a collection.

### Discovery strategy

Use contract events and indexed reads. For a first release:

- Query `NewMint` logs for the connected wallet.
- Query `NewEvent` logs for event discovery.
- Re-read each event from the contract.
- Use `balanceOf`/`hasClaimed` to verify current ownership.

Avoid relying on a centralized indexer for core correctness.

### Gallery features

- Artwork-first cards.
- Event name/date/location.
- Soulbound badge.
- Mint method where derivable from transaction logs.
- Detail view with raw metadata and verification links.
- Empty state that explains how to mint the first POAP.
- Shareable gallery/event links.

### Acceptance

- Real wallet-owned POAPs render.
- Refreshing the page re-derives ownership from chain state.
- Each card links to the contract/event verification path.

## Phase 8: documentation

Write docs as task guides, not a protocol glossary.

Required pages:

- Create your first POAP.
- Prepare and optimize an SVG.
- Understand onchain metadata.
- Soulbound vs transferable.
- Public minting.
- Allowlists in plain language.
- Generate allowlist proofs.
- Configure an allowlist root.
- Signature minting.
- QR-code distribution.
- Creator controls and deadlines.
- Minting as an attendee.
- Verify ownership.
- Base Sepolia setup.
- Troubleshooting contract errors.
- Self-hosting and deployment.

Every guide should answer:

- Who is this for?
- What do I need first?
- What happens onchain?
- What can no longer be changed?
- What deadline applies?
- What does success look like?
- What should I do if it fails?

## Phase 9: Farcaster Mini App

### Goal

Make the Mini App a first-class attendee and discovery surface.

### Tasks

- Add Mini App manifest and domain metadata.
- Initialize the SDK and call the ready signal after the first usable render.
- Support in-context wallet connection.
- Support deep links for event detail and signature claims.
- Add share/cast actions for an event and successful mint.
- Add generated artwork controls to the create flow.
- Add shareable motion-preview exports with a static SVG fallback.
- Ensure the standalone fallback works when opened outside Farcaster.
- Test narrow viewports, safe-area padding, and back navigation.

### Mini App routes

- `/`
- `/discover`
- `/create`
- `/poap/:eventId`
- `/poap/:eventId/mint`
- `/gallery`
- `/docs`

### Acceptance

- The manifest validates.
- The app opens from Farcaster and becomes ready.
- An attendee can open an event, connect, and mint.
- The standalone web app still works independently.

## Phase 10: testing

### Unit tests

- Environment parsing.
- Flags mapping.
- Event deadlines.
- SVG safety and size warnings.
- Generated-artwork conversion and sanitization.
- Motion preview frame selection and GIF limits.
- Address normalization.
- Merkle leaves/root/proofs.
- Signature packed-message construction.
- Signature claim URL encoding/decoding.
- Contract error translation.
- Explorer URLs.

### Integration tests against Base Sepolia

Use a funded test wallet in a controlled environment. Never commit the key.

- Register event.
- Read event.
- Public mint.
- Set allowlist root.
- Allowlist mint.
- Open/close public mint.
- Signature mint.
- Creator batch mint.
- Soulbound transfer rejection.
- Already-claimed rejection.
- Expired creator control rejection.

### Browser tests

- Disconnected wallet.
- Wrong network.
- Registration validation.
- SVG preview/optimization.
- Registration confirmation.
- Public mint.
- Allowlist upload/proof retrieval.
- Signature QR flow.
- Gallery refresh.
- Docs navigation.
- Mini App launch and ready state.
- Mobile viewport.

### Evidence capture

For each real integration flow, store:

- Transaction hash.
- Event ID.
- Wallet address.
- Network.
- Screenshot of the relevant UI state.
- Explorer URL.

## Phase 11: deployment and claim

### Deployment

- Deploy standalone frontend to a stable HTTPS host.
- Configure Base Sepolia environment variables.
- Deploy the same build with valid Mini App metadata.
- Verify direct navigation to every route.
- Verify HTTPS, CSP, asset paths, and mobile rendering.
- Publish the GitHub repository under MIT license.
- Document one-command setup and deployment.

### Farcaster cast

The final cast must include:

- Mini App link.
- Standalone frontend link.
- GitHub repository link.
- Tag `@jvaleska.eth`.
- Tag `@kenny`.

Capture:

- Cast URL.
- Screenshot of the published cast.
- Screenshot of the Mini App open in Farcaster.

### Claim packet

Prepare a single `docs/CLAIM.md` containing:

- Standalone URL.
- Mini App URL.
- Repository URL.
- Contract address and network.
- Registration transaction.
- Public mint transaction.
- Allowlist root transaction.
- Allowlist mint transaction.
- Signature mint transaction.
- Gallery screenshot.
- Mini App screenshot.
- Cast URL and screenshot.
- Setup/test instructions.

## Priority order for execution

1. Contract ABI and typed chain client.
2. Wallet/network/transaction foundation.
3. Product shell and route structure.
4. Registration.
5. Event detail and public mint.
6. Creator controls.
7. Allowlist studio.
8. Signature/QR distribution.
9. Gallery.
10. Documentation.
11. Farcaster Mini App integration.
12. Integration/browser tests.
13. Deployment and evidence packet.

## First implementation slice

The next coding slice should be Phase 0, not visual polish:

1. Create a fresh branch from `e1d8e8c`.
2. Add the pinned ABI and Base Sepolia contract client.
3. Add reads for `totalEvents`, `events`, `hasClaimed`, and `balanceOf`.
4. Add flags/deadline/error pure functions with tests.
5. Add wallet/network state.
6. Replace the placeholder status card with a read-only contract health panel.
7. Run test, typecheck, lint, and build.
8. Only then begin the registration UI.

This keeps the build honest: the interface is shaped by the deployed contract, and every later screen can rely on tested primitives.

## Definition of done

A fresh user can open either the standalone site or the Mini App, connect a wallet, register a real POAP, preview its onchain artwork, configure public minting or an allowlist, generate proofs, create signature claims and QR codes, mint through every available mechanism, verify the resulting token, see it in the gallery, and follow the docs without needing the bounty author to explain the protocol.
