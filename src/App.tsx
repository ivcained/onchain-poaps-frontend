import { appEnv } from './env'
import './styles.css'

export function App() {
  return (
    <main className="app-shell">
      <p className="eyebrow">Base Sepolia · ERC-1155</p>
      <h1>Onchain POAPs</h1>
      <p className="intro">
        A foundation for creating, distributing, and collecting event passes that live
        entirely onchain.
      </p>
      <section className="status-card" aria-labelledby="status-title">
        <h2 id="status-title">Scaffold ready</h2>
        <p>Contract workflows arrive in the next milestone. This app is configured for:</p>
        <dl>
          <div>
            <dt>Network</dt>
            <dd>Base Sepolia ({appEnv.chainId})</dd>
          </div>
          <div>
            <dt>Contract</dt>
            <dd>{appEnv.poapContractAddress}</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
