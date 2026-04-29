# Stellar-Milestone-Forge


A milestone-based Contract Phase Proof dApp on Stellar Soroban. Clients lock XLM into a smart contract, approve Contract Based work phases one by one, and contractors withdraw proportional earnings as phases complete — with full terminate & refund support. Includes a React + Freighter frontend.


---

## Deployed Project Link

**https://stellar-milestone-forge.netlify.app/**

> Connect a Freighter wallet funded on Stellar Testnet to interact with the live contract.

---

## Demo Video Link

**https://youtu.be/yxLiyJIcH48**


---



## Screenshots as per Requirements

### Test output — 3 tests passing
<img width="1202" height="252" alt="1" src="https://github.com/user-attachments/assets/2405514c-2490-494e-a32c-252856a95608" />


### Functionality of Dapp
<img width="1918" height="1018" alt="2" src="https://github.com/user-attachments/assets/9ae04380-def7-42dd-9e12-83fc05046dcd" />
<img width="1918" height="1006" alt="3" src="https://github.com/user-attachments/assets/0d965e55-b8a9-4075-8da3-25b907be0089" />
<img width="1918" height="878" alt="4" src="https://github.com/user-attachments/assets/6565b207-b891-48ad-82d3-bb6bc9468080" />



### Contract Invoke Calls
<img width="1918" height="561" alt="5" src="https://github.com/user-attachments/assets/bbda9bda-5efc-4845-8373-f1f7a955cae3" />
<img width="1918" height="827" alt="6" src="https://github.com/user-attachments/assets/9a5e344c-f2be-4100-ab05-d6259113edef" />






---

## Project Structure
 
```
milestone-forge-dapp/
├── contract/                        # Soroban smart contract (Rust)
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── lib.rs               # Contract logic
│   │   │   └── test.rs              # Unit tests
│   │   └── Cargo.toml               # Contract package
│   ├── Cargo.toml                   # Workspace config
│   ├── Cargo.lock
│   └── Makefile
├── src/                             # React frontend
│   ├── App.jsx                      # Main application component
│   ├── App.css
│   ├── main.jsx
│   └── assets/
├── public/
├── .env                             # Environment variables (see setup)
├── index.html
├── package.json
└── vite.config.js
```
 
---
 
## Smart Contract
 
### Functions
 
| Function | Caller | Description |
|---|---|---|
| `init_agreement(deal_id, client, contractor, asset, budget, phase_count)` | Client | Creates escrow and locks funds |
| `approve_phase(deal_id, phase_idx)` | Client | Marks a phase as complete |
| `withdraw(deal_id)` | Contractor | Withdraws earnings proportional to approved phases |
| `terminate(deal_id)` | Client | Cancels agreement, refunds undisbursed funds to client |
| `get_agreement(deal_id)` | Anyone | Returns agreement state |
 
### How it works
 
1. Client calls `init_agreement` — XLM is transferred from the client into the contract
2. As work is completed, client calls `approve_phase` for each milestone
3. Contractor calls `withdraw` at any time — receives `(approved_phases / total_phases) * budget` minus already disbursed
4. Client can call `terminate` at any time — remaining undisbursed funds return to client
---
 
## Prerequisites
 
- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)
- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
---
 
## Setup
 
### 1. Install Rust & Soroban CLI
 
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli
```
 
### 2. Build & Deploy the Contract
 
```bash
cd contract
 
# Build
cargo build --target wasm32-unknown-unknown --release
 
# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/milestone_forge.wasm \
  --network testnet \
  --source YOUR_SECRET_KEY
```
 
Copy the contract ID output — you'll need it in the next step.
 
### 3. Configure Environment Variables
 
Create a `.env` file in the project root:
 
```env
VITE_CONTRACT_ID=your_deployed_contract_id
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```
 
### 4. Install Frontend Dependencies & Run
 
```bash
npm install
npm run dev
```
 
Open [http://localhost:5173](http://localhost:5173) in your browser.
 
---
 
## Running Tests
 
```bash
cd contract
cargo test
```
 
Expected output:
```
running 3 tests
test test::test_full_lifecycle_withdraw ... ok
test test::test_partial_withdraw_proportional ... ok
test test::test_terminate_refunds_remainder ... ok
 
test result: ok. 3 passed; 0 failed
```
 
### Test Coverage
 
| Test | Description |
|---|---|
| `test_full_lifecycle_withdraw` | All phases approved, contractor withdraws full budget |
| `test_partial_withdraw_proportional` | Partial approvals pay proportional amounts across multiple withdrawals |
| `test_terminate_refunds_remainder` | Termination after partial payout returns correct remainder to client |
 
---
 
## Frontend Tabs
 
| Tab | Role | Action |
|---|---|---|
| **Forge** | Client | Create a new escrow agreement |
| **Track** | Client | Look up an agreement, view phase progress, approve phases |
| **Claim** | Contractor | Withdraw earned funds |
| **Void** | Client | Terminate agreement and reclaim undisbursed funds |
 
---
 
## Network
 
This dApp runs on **Stellar Testnet**. Get free testnet XLM from the [Stellar Friendbot](https://friendbot.stellar.org/).
 
---
 
## Tech Stack
 
- **Smart Contract** — Rust, Soroban SDK v25
- **Frontend** — React, Vite, Stellar SDK
- **Wallet** — Freighter
- **Explorer** — [stellar.expert](https://stellar.expert/explorer/testnet)

---

## 📄 License

MIT © 2025 — built for the Stellar Journey to Mastery Orange Belt challenge.
