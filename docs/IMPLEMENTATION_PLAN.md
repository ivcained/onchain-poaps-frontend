# Onchain POAP Frontend Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build and launch an MIT-licensed standalone web app and Farcaster Mini App that exposes every supported interaction of the deployed OnchainPOAPs contract on Base Sepolia.

**Architecture:** Create a separate repository and deployment from LoopLore. A React/Vite frontend uses Wagmi and the Farcaster Mini App connector for wallet writes, Viem for Base Sepolia reads and event indexing, and local browser tools for Merkle tree/proof and creator signature generation. Dynamic server routes provide Farcaster embeds and optional encrypted proof bundles, but contract state remains the source of truth.

**Contract source of truth:** `OnchainPOAPs` at `0xC3249356a483fbe17d5355D39105D2eA666d9de6`, source commit `c313c856cd9f26bbc9e61e4ef12cb3e463409708`. Do not modify the contract.

**Verified contract surface:**
- `registerEvent(name, description, eventDate, location, allowlistRoot, svgImage, externalUrl, flags)`
- `mint(eventId)`
- `allowlistMint(eventId, proof)`; leaf is `keccak256(abi.encodePacked(address))`
- `mintWithSignature(eventId, signature)`; creator signs `keccak256(abi.encodePacked(eventId, chainId, recipient))` with Ethereum signed-message prefix
- `creatorMint(eventId, recipients)`; creator only, maximum 101 recipients per call
- `updateAllowlistRoot(eventId, root)`; creator only, one-time, first 30 days
- `updateEventPublic(eventId, bool)`; creator only, first 30 days
- Signature mint deadline: first 37 days
- One claim per address per event across all mint methods
- Soulbound tokens cannot transfer; transferable tokens use normal ERC-1155 transfer behavior
- `uri(eventId)` returns fully onchain base64 JSON with base64 SVG

**Tech Stack:** React, TypeScript, Vite, Wagmi v2, Viem, TanStack Query, `@farcaster/miniapp-sdk`, `@farcaster/miniapp-wagmi-connector`, OpenZeppelin StandardMerkleTree only if byte compatibility is proven; otherwise a small tested sorted-pair tree matching `MerkleProof.verify` and packed-address leaves.

---

## Phase 1 — Contract compatibility harness

1. Create a new repository with MIT license, README, `.env.example`, Vite React app, test runner, ESLint, and Base Sepolia Wagmi config.
2. Copy only the verified ABI into `src/contracts/onchainPoaps.ts`; record deployed address and deployment block.
3. Add fork/integration tests that read `totalEvents`, event 0, `uri(0)`, and `CREATOR_TIMELOCK` from the live Base Sepolia contract.
4. Decode data-URI JSON and SVG in tests; verify no remote metadata dependency.
5. Add error-selector decoding for every custom contract error and plain-language messages.
6. Run the upstream contract suite with `forge test --via-ir`; the repository currently fails without `--via-ir` because `registerEvent` hits stack-too-deep.

## Phase 2 — Read model and event discovery

7. Build typed readers for event data, claim state, balances, supply, URI metadata, creator deadline, and signature deadline.
8. Index `NewEvent`, `NewMint`, `AllowlistUpdated`, and `EventPublicUpdated` logs from the deployment block.
9. Build event detail routes at `/poap/:eventId` with artwork, metadata, distribution status, deadlines, creator, supply, and ownership verification.
10. Add resilient RPC fallback and explicit loading, stale, empty, and error states.

## Phase 3 — POAP registration

11. Build SVG upload/paste/editor flow with safe local preview, SVG optimization, size estimate, and exact source review.
12. Build all registration fields: name, description, event date, location, external URL, soulbound, public, and optional allowlist.
13. Generate flags exactly: transferable/private `0`, soulbound/private `1`, transferable/public `2`, soulbound/public `3`.
14. Support address-list import during registration; derive root locally and retain downloadable proof bundle.
15. Show a final transaction review containing artwork, metadata, distribution mechanisms, permanence warning, soulbound effect, and estimated gas.
16. Send `registerEvent`, confirm receipt, parse `NewEvent`, and route to the real event page.
17. Exercise one real Base Sepolia registration using a dedicated funded test wallet and record the transaction in `docs/TESTNET_EVIDENCE.md`.

## Phase 4 — Minting

18. Build mint-availability logic from onchain state: public status, root presence, creator/signature deadline, claim state, and wallet connection.
19. Build public mint with preview, transaction confirmation, receipt parsing, BaseScan link, and gallery update.
20. Build allowlist mint by accepting a proof bundle/file, verifying it locally against the onchain root, then submitting `allowlistMint`.
21. Build signature mint by accepting a signed claim link or pasted signature, recovering the signer locally, validating creator/recipient/chain/event, then submitting `mintWithSignature`.
22. Ensure every mint surface checks `hasClaimed` before prompting the wallet and disables duplicate submission while pending.
23. Exercise real public, allowlist, and signature mints on Base Sepolia with distinct test wallets.

## Phase 5 — Allowlist studio

24. Accept pasted text, CSV, and newline-separated addresses; checksum, deduplicate, reject zero/invalid addresses, and show counts.
25. Implement and test the exact Merkle algorithm against Solidity `MerkleProof.verify`: packed-address leaf and sorted pair hashing.
26. Produce a downloadable JSON bundle containing event ID, chain ID, contract, root, and address-to-proof mapping.
27. Add creator-only “Set allowlist” flow with one-time and 30-day warnings.
28. Build recipient claim links that encode event ID plus proof without exposing unrelated recipients.
29. Document safe proof distribution options: individual URLs/QRs, per-attendee files, or a creator-hosted proof API.
30. Execute a real root update and real eligible/ineligible proof checks against Base Sepolia.

## Phase 6 — Creator controls and distribution

31. Build creator dashboard listing events created by the connected wallet.
32. Add public mint status control with exact current state, 30-day countdown, transaction review, and confirmed update.
33. Add creator batch drop for up to 101 recipients, including duplicate/claimed warnings and chunking above 101 into separately confirmed transactions.
34. Add signature studio: recipient input, exact signing payload, signer recovery check, downloadable claim links, and CSV export.
35. Add QR generation for public, allowlist, and signature claims; each QR opens the event route with only the required claim data.
36. Explain that a shared signature QR cannot authorize arbitrary wallets because the contract signature binds the recipient. Generate recipient-specific QR codes, or use public/allowlist mint for one shared event QR.
37. Exercise real public toggle, creator drop, signature generation, signature recovery, and recipient mint.

## Phase 7 — Collection gallery

38. Build “My POAPs” from `NewMint` logs plus live `balanceOf` verification.
39. Render decoded onchain SVGs, metadata, soulbound status, event date/location, creator, and CAIP-2 ID.
40. Add individual collection routes, BaseScan verification links, and OpenSea links where indexed.
41. Make gallery cards visual and collectible rather than raw transaction rows; support filtering and share actions.

## Phase 8 — Education and docs

42. Write embedded guides for creator vs attendee paths using plain language.
43. Document creating a POAP, metadata, SVG requirements/optimization, soulbound vs transferable, public minting, allowlists, proof generation, signature minting, QR distribution, creator permissions, deadlines, restrictions, and verification.
44. Add contract-derived deadline components showing dates, remaining time, and what becomes immutable.
45. Include copyable Foundry/Viem examples for developers without requiring private keys in the frontend.
46. Add a “distribution chooser” that recommends public, allowlist, signatures, or creator drop based on event needs.

## Phase 9 — Farcaster Mini App

47. Add `sdk.actions.ready()` immediately and support normal-browser fallback.
48. Create signed `/.well-known/farcaster.json`, valid account association, Base Sepolia required chain, and required wallet capabilities.
49. Add dynamic 3:2 event embeds with artwork and context-specific actions such as “Collect POAP”.
50. Use Farcaster Quick Auth only where Farcaster identity adds value; wallet ownership remains onchain.
51. Add install action, compose-cast sharing, QR scanner-friendly claim routes, and compact 424px interaction layouts.
52. Validate every event/claim embed in Farcaster’s Mini App Embed Tool.

## Phase 10 — Open source, deployment, and claim

53. Publish a clean public GitHub repository with MIT license, architecture, setup, environment, test, deployment, security, and contribution docs.
54. Deploy standalone frontend and Mini App on a stable HTTPS domain.
55. Run unit, contract-fork, browser E2E, accessibility, mobile, lint, type, and production-build checks.
56. Complete a real Base Sepolia matrix: registration; public mint; allowlist root and mint; signature mint; creator drop; public open/close; soulbound transfer rejection; transferable transfer success; gallery ownership.
57. Record transaction hashes and screenshots in `docs/TESTNET_EVIDENCE.md` without private keys.
58. Cast the Mini App from the required Farcaster account, tag `@jvaleska.eth` and `@kenny`, and include the standalone app and GitHub links.
59. Read the cast back, verify its Mini App embed, capture a real screenshot, and save the cast URL.
60. Submit the POIDH claim with deployed standalone URL, deployed Mini App URL, public GitHub URL, screenshot, cast URL, and the testnet evidence matrix.

## Hard acceptance gates

- No mocked contract writes count as completion.
- Every enabled contract function has a usable frontend path.
- Creator-only actions are gated by both UI and contract simulation, never UI alone.
- Timing rules are calculated from `createdAt` and `CREATOR_TIMELOCK`, not hardcoded registration dates.
- Merkle roots/proofs are tested against the deployed contract.
- Signatures are recovered locally before presenting a mint transaction.
- SVG and metadata previews exactly match onchain encoding expectations.
- A failed or rejected transaction never appears successful.
- All state-changing testnet actions have receipts and BaseScan links.
- The cast, screenshot, deployment URLs, and GitHub repository must exist and be independently readable before a bounty claim is called complete.
