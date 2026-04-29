import { useState, useCallback } from "react";
import * as FreighterApi from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";


const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;
const RPC_URL = import.meta.env.VITE_RPC_URL;
const NETWORK_PASSPHRASE = import.meta.env.VITE_NETWORK_PASSPHRASE;

const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";


const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";
const CONTRACT_EXPLORER_URL = `${EXPLORER_BASE}/contract/${CONTRACT_ID}`;
const txExplorerUrl = (hash) => `${EXPLORER_BASE}/tx/${hash}`;


const rpc = new StellarSdk.rpc.Server(RPC_URL);

function fmt(val) {
  return (Number(val) / 1e7).toFixed(2);
}
function shortAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}
function shortContract(id) {
  if (!id) return "";
  return id.slice(0, 8) + "…" + id.slice(-6);
}

const IconHammer = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
    <path d="M17.64 15L22 10.64" />
    <path d="M20.91 11.7a5.56 5.56 0 0 0-7.61-7.61" />
    <path d="M14 8l2 2" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconSpin = () => (
  <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IconWallet = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="17" cy="15" r="1" fill="currentColor" />
  </svg>
);
const IconExternal = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconCube = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconUnlock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast-icon">{t.type === "success" ? <IconCheck /> : <IconX />}</span>
          <span className="toast-msg">{t.msg}</span>
          {t.txHash && (
            <a href={txExplorerUrl(t.txHash)} target="_blank" rel="noopener noreferrer" className="toast-link">
              Tx <IconExternal />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function ExLink({ href, children, cls = "" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`exlink ${cls}`}>
      {children}<IconExternal />
    </a>
  );
}


export default function App() {
  const [tab, setTab] = useState("forge");
  const [walletPub, setWalletPub] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: "", payer: "", receiver: "", token: XLM_TOKEN, amount: "", milestones: "3",
  });
  const [queryId, setQueryId] = useState("");
  const [escrow, setEscrow] = useState(null);
  const [milestoneIdx, setMilestoneIdx] = useState("");
  const [releaseId, setReleaseId] = useState("");
  const [cancelId, setCancelId] = useState("");

  const addToast = useCallback((msg, type = "success", txHash = null) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type, txHash }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 6000);
  }, []);

  async function connectWallet() {
    try {
      if (FreighterApi && typeof FreighterApi.isConnected === "function") {
        const connected = await FreighterApi.isConnected();
        if (!connected?.isConnected) {
          addToast("Freighter not connected — unlock the extension", "error"); return;
        }
        await FreighterApi.requestAccess();
        const { address } = await FreighterApi.getAddress();
        if (!address) throw new Error("No address returned");
        setWalletPub(address);
        setForm(f => ({ ...f, payer: address }));
        addToast("Wallet connected"); return;
      }
      let attempts = 0;
      while (!window.freighter && attempts < 20) { await new Promise(r => setTimeout(r, 150)); attempts++; }
      if (!window.freighter) { addToast("Freighter not detected", "error"); return; }
      if (typeof window.freighter.requestAccess === "function") await window.freighter.requestAccess();
      const res = await (window.freighter.getAddress?.() ?? window.freighter.getPublicKey?.());
      const address = res?.address ?? res;
      if (!address) throw new Error("No address returned");
      setWalletPub(address);
      setForm(f => ({ ...f, payer: address }));
      addToast("Wallet connected");
    } catch (e) { addToast(e.message || String(e), "error"); }
  }

  async function invoke(op) {
    if (!walletPub) { addToast("Connect wallet first", "error"); return null; }
    setLoading(true);
    try {
      const account = await rpc.getAccount(walletPub);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(op).setTimeout(30).build();

      const sim = await rpc.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationError(sim)) throw new Error(sim.error);
      const assembled = StellarSdk.rpc.assembleTransaction(tx, sim).build();

      let signedTxXdr;
      if (FreighterApi && typeof FreighterApi.signTransaction === "function") {
        const r = await FreighterApi.signTransaction(assembled.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE, network: "TESTNET" });
        signedTxXdr = r?.signedTxXdr ?? r;
      } else {
        const r = await window.freighter.signTransaction(assembled.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE, network: "TESTNET" });
        signedTxXdr = typeof r === "string" ? r : r.signedTxXdr;
      }

      const signed = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      const result = await rpc.sendTransaction(signed);
      const txHash = result.hash;

      let status = result;
      while (status.status === "PENDING" || status.status === "NOT_FOUND") {
        await new Promise(r => setTimeout(r, 1500));
        status = await rpc.getTransaction(txHash);
      }
      if (status.status === "SUCCESS") {
        addToast("Transaction confirmed", "success", txHash);
        return { status, hash: txHash };
      } else throw new Error("Transaction failed: " + status.status);
    } catch (e) { addToast(e.message || String(e), "error"); return null; }
    finally { setLoading(false); }
  }

  const contract = new StellarSdk.Contract(CONTRACT_ID);

 

  async function createEscrow() {
    const { id, payer, receiver, token, amount, milestones } = form;
    if (!id || !payer || !receiver || !token || !amount || !milestones) {
      addToast("Fill all fields", "error"); return;
    }
    const op = contract.call(
      "init_agreement",                                                         
      StellarSdk.nativeToScVal(id, { type: "symbol" }),
      new StellarSdk.Address(payer).toScVal(),
      new StellarSdk.Address(receiver).toScVal(),
      new StellarSdk.Address(token).toScVal(),
      StellarSdk.nativeToScVal(BigInt(Math.round(parseFloat(amount) * 1e7)), { type: "i128" }),
      StellarSdk.nativeToScVal(parseInt(milestones), { type: "u32" }),
    );
    await invoke(op);
  }

  async function completeMilestone() {
    if (!queryId || milestoneIdx === "") {
      addToast("Provide contract ID & phase index", "error"); return;
    }
    const op = contract.call(
      "approve_phase",                                                          
      StellarSdk.nativeToScVal(queryId, { type: "symbol" }),
      StellarSdk.nativeToScVal(parseInt(milestoneIdx), { type: "u32" }),
    );
    await invoke(op);
    await fetchEscrow(queryId);
  }

  async function releaseEscrow() {
    if (!releaseId) { addToast("Provide contract ID", "error"); return; }
    const op = contract.call(
      "withdraw",                                                                
      StellarSdk.nativeToScVal(releaseId, { type: "symbol" }),
    );
    await invoke(op);
  }

  async function cancelEscrow() {
    if (!cancelId) { addToast("Provide contract ID", "error"); return; }
    const op = contract.call(
      "terminate",                                                               
      StellarSdk.nativeToScVal(cancelId, { type: "symbol" }),
    );
    await invoke(op);
  }

  async function fetchEscrow(id) {
    if (!id) { addToast("Enter contract ID", "error"); return; }
    setLoading(true);
    try {
      const account = await rpc.getAccount(walletPub || StellarSdk.Keypair.random().publicKey());
      const op = contract.call(
        "get_agreement",                                                         
        StellarSdk.nativeToScVal(id, { type: "symbol" }),
      );
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE,
      }).addOperation(op).setTimeout(30).build();

      const sim = await rpc.simulateTransaction(tx);
      if (StellarSdk.rpc.Api.isSimulationError(sim)) throw new Error(sim.error);
      const retVal = sim.result?.retval;
      if (!retVal) throw new Error("No result");

      const raw = StellarSdk.scValToNative(retVal);

      
      setEscrow({
        ...raw,
        payer:        raw.client,
        receiver:     raw.contractor,
        total_amount: raw.budget,
        released:     raw.disbursed,
        
        milestones:   raw.phases?.map(p => (typeof p === "object" ? p.completed : p)),
      });
      addToast("Agreement loaded");
    } catch (e) { addToast(e.message || String(e), "error"); setEscrow(null); }
    finally { setLoading(false); }
  }

  const completedCount = escrow?.milestones?.filter(Boolean).length ?? 0;
  const totalCount     = escrow?.milestones?.length ?? 0;
  const progressPct    = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const TABS = [
    { id: "forge", label: "Forge" },
    { id: "track", label: "Track" },
    { id: "claim", label: "Claim" },
    { id: "void",  label: "Void"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:ital,wdth,wght@0,75..125,100..900;1,75..125,100..900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f5f2ec;
          --ink: #1a1612;
          --ink2: #5c5348;
          --ink3: #9e9388;
          --sand: #ede9e1;
          --sand2: #e4dfd5;
          --sand3: #d8d1c5;
          --orange: #d45c1e;
          --orange-dim: #d45c1e18;
          --teal: #1a6e6e;
          --teal-dim: #1a6e6e14;
          --teal-light: #e4f0f0;
          --red: #c0392b;
          --red-dim: #c0392b12;
          --gold: #b8860b;
          --gold-dim: #b8860b14;
          --border: #cec8be;
          --border2: #b8b0a2;
          --shadow: 0 2px 12px rgba(26,22,18,.08);
          --shadow-lg: 0 8px 40px rgba(26,22,18,.12);
          --font: 'Anybody', sans-serif;
          --mono: 'JetBrains Mono', monospace;
          --r: 4px;
          --r-lg: 8px;
        }

        body {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(26,22,18,.025) 8px,
            rgba(26,22,18,.025) 9px
          );
          pointer-events: none;
          z-index: 0;
        }

        .app {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 16px 120px;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: auto;
          text-decoration: none;
        }
        .logo-mark {
          width: 38px; height: 38px;
          background: var(--ink);
          border-radius: var(--r);
          display: flex; align-items: center; justify-content: center;
          color: var(--bg);
          flex-shrink: 0;
        }
        .logo-text-wrap { display: flex; flex-direction: column; gap: 0; }
        .logo-name {
          font-size: 1.05rem;
          font-weight: 900;
          font-variation-settings: 'wdth' 110;
          letter-spacing: -.03em;
          color: var(--ink);
          line-height: 1;
          text-transform: uppercase;
        }
        .logo-sub {
          font-family: var(--mono);
          font-size: .58rem;
          color: var(--ink3);
          letter-spacing: .12em;
          text-transform: uppercase;
          line-height: 1;
          margin-top: 2px;
        }
        .net-badge {
          font-family: var(--mono);
          font-size: .62rem;
          font-weight: 700;
          color: var(--orange);
          background: var(--orange-dim);
          border: 1px solid var(--orange)44;
          padding: 3px 8px;
          border-radius: var(--r);
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-left: 2px;
        }

        .hdr-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border: 1px solid var(--border2);
          background: var(--sand);
          border-radius: var(--r);
          cursor: pointer;
          font-family: var(--mono);
          font-size: .72rem;
          color: var(--ink2);
          text-decoration: none;
          transition: all .15s;
          white-space: nowrap;
          font-weight: 500;
        }
        .hdr-btn:hover { border-color: var(--ink); color: var(--ink); background: var(--sand2); }
        .hdr-btn.linked { border-color: var(--teal); color: var(--teal); background: var(--teal-dim); }
        .hdr-btn.linked:hover { background: var(--teal-light); }
        .wallet-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); }

        .strip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          background: var(--sand);
          border: 1px solid var(--border);
          border-left: 3px solid var(--orange);
          border-radius: var(--r);
          margin-bottom: 28px;
          font-family: var(--mono);
          font-size: .7rem;
          flex-wrap: wrap;
        }
        .strip-label { color: var(--ink3); font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; flex-shrink: 0; }
        .strip-id { color: var(--ink2); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .tabs {
          display: flex;
          gap: 0;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border);
        }
        .tab {
          padding: 10px 24px 10px;
          border: none;
          background: transparent;
          color: var(--ink3);
          font-family: var(--font);
          font-size: .82rem;
          font-weight: 800;
          font-variation-settings: 'wdth' 105;
          letter-spacing: .04em;
          text-transform: uppercase;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all .15s;
        }
        .tab:hover:not(.active) { color: var(--ink2); }
        .tab.active { color: var(--orange); border-bottom-color: var(--orange); }

        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 26px;
          margin-bottom: 16px;
          box-shadow: var(--shadow);
        }
        .card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
        }
        .card-title {
          font-size: .88rem;
          font-weight: 900;
          font-variation-settings: 'wdth' 115;
          text-transform: uppercase;
          letter-spacing: .04em;
          color: var(--ink);
        }
        .chip {
          font-family: var(--mono);
          font-size: .62rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--r);
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .chip-default { background: var(--sand2); color: var(--ink2); border: 1px solid var(--border); }
        .chip-teal { background: var(--teal-dim); color: var(--teal); border: 1px solid var(--teal)33; }
        .chip-red { background: var(--red-dim); color: var(--red); border: 1px solid var(--red)33; }
        .chip-gold { background: var(--gold-dim); color: var(--gold); border: 1px solid var(--gold)44; }

        .field { margin-bottom: 14px; }
        .label {
          display: block;
          font-size: .65rem;
          font-weight: 800;
          font-variation-settings: 'wdth' 110;
          color: var(--ink3);
          margin-bottom: 5px;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .input {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--r);
          border: 1px solid var(--border2);
          background: var(--sand);
          color: var(--ink);
          font-family: var(--mono);
          font-size: .78rem;
          outline: none;
          transition: border-color .15s, background .15s;
        }
        .input:focus { border-color: var(--orange); background: #fff; box-shadow: 0 0 0 3px var(--orange-dim); }
        .input::placeholder { color: var(--ink3); }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; padding: 11px 20px;
          border-radius: var(--r);
          border: none; cursor: pointer;
          font-family: var(--font);
          font-size: .8rem;
          font-weight: 900;
          font-variation-settings: 'wdth' 110;
          text-transform: uppercase;
          letter-spacing: .04em;
          transition: all .15s;
        }
        .btn:disabled { opacity: .35; cursor: not-allowed; }
        .btn-full { width: 100%; margin-top: 8px; }
        .btn-primary { background: var(--orange); color: #fff; }
        .btn-primary:not(:disabled):hover { background: #ba4f16; }
        .btn-outline { background: transparent; color: var(--ink); border: 1px solid var(--border2); }
        .btn-outline:not(:disabled):hover { border-color: var(--ink); background: var(--sand); }
        .btn-teal { background: var(--teal); color: #fff; }
        .btn-teal:not(:disabled):hover { background: #145858; }
        .btn-danger { background: transparent; color: var(--red); border: 1px solid var(--red)66; }
        .btn-danger:not(:disabled):hover { background: var(--red-dim); border-color: var(--red); }

        .divider { height: 1px; background: var(--sand2); margin: 20px 0; }

        .deal-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 18px; gap: 12px; flex-wrap: wrap;
        }
        .deal-id { font-family: var(--mono); font-size: .75rem; color: var(--ink3); margin-bottom: 4px; }
        .deal-amount {
          font-size: 2.4rem;
          font-weight: 900;
          font-variation-settings: 'wdth' 120;
          letter-spacing: -.06em;
          color: var(--ink);
          line-height: 1;
        }
        .deal-unit { font-size: 1rem; font-weight: 500; color: var(--ink3); margin-left: 4px; }

        .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .meta-item {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--mono); font-size: .7rem;
          background: var(--sand); border: 1px solid var(--border);
          border-radius: var(--r); padding: 5px 10px;
        }
        .meta-k { color: var(--ink3); }
        .meta-v { color: var(--ink); font-weight: 500; }
        .meta-v-teal { color: var(--teal); font-weight: 500; }

        .prog-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .prog-label { font-size: .7rem; font-weight: 700; color: var(--ink3); text-transform: uppercase; letter-spacing: .08em; }
        .prog-pct { font-family: var(--mono); font-size: .8rem; font-weight: 700; color: var(--orange); }
        .prog-track {
          height: 6px; background: var(--sand2);
          border-radius: 99px; overflow: hidden; margin-bottom: 20px;
          border: 1px solid var(--border);
        }
        .prog-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--orange), var(--gold));
          border-radius: 99px;
          transition: width .5s ease;
        }

        .ms-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .ms-node {
          width: 36px; height: 36px;
          border-radius: var(--r);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-size: .65rem; font-weight: 700;
          border: 1px solid var(--border);
          background: var(--sand);
          color: var(--ink3);
          transition: all .18s;
        }
        .ms-node.done {
          background: var(--teal-dim);
          border-color: var(--teal)55;
          color: var(--teal);
        }

        .sub-label {
          font-size: .62rem; font-weight: 800;
          font-variation-settings: 'wdth' 110;
          text-transform: uppercase; letter-spacing: .1em;
          color: var(--ink3); margin-bottom: 12px;
        }

        .desc { font-size: .82rem; color: var(--ink2); line-height: 1.7; margin-bottom: 18px; }

        .card-footer {
          display: flex; align-items: center; gap: 8px;
          padding-top: 14px; margin-top: 6px;
          border-top: 1px solid var(--sand2);
          font-family: var(--mono); font-size: .68rem; color: var(--ink3);
        }

        .exlink {
          display: inline-flex; align-items: center; gap: 3px;
          color: var(--orange); font-family: var(--mono); font-size: .7rem;
          text-decoration: none;
          border-bottom: 1px solid var(--orange)40;
          padding-bottom: 1px;
          transition: all .13s;
        }
        .exlink:hover { color: var(--ink); border-color: var(--ink)66; }

        .toast-stack {
          position: fixed; bottom: 20px; right: 20px; z-index: 99;
          display: flex; flex-direction: column; gap: 8px; pointer-events: none;
        }
        .toast {
          display: flex; align-items: center; gap: 9px;
          padding: 10px 14px; border-radius: var(--r-lg);
          font-family: var(--mono); font-size: .76rem;
          animation: slideIn .2s ease;
          max-width: 340px; border: 1px solid;
          pointer-events: all; box-shadow: var(--shadow-lg);
        }
        .toast--success { background: #f0faf6; border-color: var(--teal)55; color: var(--teal); }
        .toast--error { background: #fdf2f2; border-color: var(--red)55; color: var(--red); }
        .toast-icon { flex-shrink: 0; }
        .toast-msg { flex: 1; }
        .toast-link {
          display: inline-flex; align-items: center; gap: 3px;
          color: currentColor; text-decoration: none;
          border-bottom: 1px solid currentColor;
          font-size: .68rem; opacity: .75; flex-shrink: 0;
        }
        .toast-link:hover { opacity: 1; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin .75s linear infinite; }

        @media (max-width: 480px) {
          .tabs { overflow-x: auto; }
          .tab { padding: 10px 14px; font-size: .75rem; }
          .row2 { grid-template-columns: 1fr; }
          .deal-amount { font-size: 1.8rem; }
        }
      `}</style>

      <div className="app">

        <header className="header">
          <div className="logo">
            <div className="logo-mark"><IconHammer /></div>
            <div className="logo-text-wrap">
              <span className="logo-name">MilestoneForge</span>
              <span className="logo-sub">Soroban Smart Contracts</span>
            </div>
            <span className="net-badge">Testnet</span>
          </div>
          <ExLink href={CONTRACT_EXPLORER_URL} cls="hdr-btn">
            <IconCube /> Contract
          </ExLink>
          <button className={`hdr-btn ${walletPub ? "linked" : ""}`} onClick={connectWallet}>
            {walletPub ? <span className="wallet-dot" /> : <IconWallet />}
            {walletPub ? shortAddr(walletPub) : "Connect Wallet"}
          </button>
        </header>

        <div className="strip">
          <span className="strip-label">Contract</span>
          <span className="strip-id" title={CONTRACT_ID}>{CONTRACT_ID}</span>
          <ExLink href={CONTRACT_EXPLORER_URL}>stellar.expert</ExLink>
        </div>

        <nav className="tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* ══ FORGE ══ */}
        {tab === "forge" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">New Agreement</span>
              <span className="chip chip-default">Soroban</span>
            </div>
            <div className="row2">
              <div className="field">
                <label className="label">Agreement ID</label>
                <input className="input" placeholder="project_alpha" value={form.id}
                  onChange={e => setForm(f => ({ ...f, id: e.target.value }))} />
              </div>
              <div className="field">
                <label className="label">Phases</label>
                <input className="input" type="number" min="1" max="20" placeholder="3"
                  value={form.milestones}
                  onChange={e => setForm(f => ({ ...f, milestones: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label className="label">Client Address</label>
              <input className="input" placeholder="G…" value={form.payer}
                onChange={e => setForm(f => ({ ...f, payer: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Contractor Address</label>
              <input className="input" placeholder="G…" value={form.receiver}
                onChange={e => setForm(f => ({ ...f, receiver: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Budget (XLM)</label>
              <input className="input" type="number" placeholder="100" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-full" onClick={createEscrow} disabled={loading || !walletPub}>
              {loading ? <IconSpin /> : <IconArrowRight />}
              {loading ? "Processing…" : "Forge Agreement"}
            </button>
            <div className="card-footer">
              Contract: <ExLink href={CONTRACT_EXPLORER_URL}>{shortContract(CONTRACT_ID)}</ExLink>
            </div>
          </div>
        )}

        {/* ══ TRACK ══ */}
        {tab === "track" && (
          <>
            <div className="card">
              <div className="card-head"><span className="card-title">Lookup</span></div>
              <div className="row2">
                <div className="field">
                  <label className="label">Agreement ID</label>
                  <input className="input" placeholder="project_alpha" value={queryId}
                    onChange={e => setQueryId(e.target.value)} />
                </div>
                <div className="field" style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn btn-outline btn-full" style={{ marginTop: 0 }}
                    onClick={() => fetchEscrow(queryId)} disabled={loading}>
                    {loading ? <IconSpin /> : <IconSearch />} Fetch
                  </button>
                </div>
              </div>
              <div className="card-footer">
                Contract: <ExLink href={CONTRACT_EXPLORER_URL}>{shortContract(CONTRACT_ID)}</ExLink>
              </div>
            </div>

            {escrow && (
              <div className="card">
                <div className="deal-header">
                  <div>
                    <div className="deal-id">#{queryId}</div>
                    <div className="deal-amount">
                      {fmt(escrow.total_amount)}
                      <span className="deal-unit">XLM</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span className={`chip ${completedCount === totalCount ? "chip-teal" : "chip-gold"}`}>
                      {completedCount === totalCount ? "Complete" : "Active"}
                    </span>
                    <ExLink href={`${EXPLORER_BASE}/account/${escrow.payer?.toString()}`}>View client</ExLink>
                  </div>
                </div>

                <div className="meta-row">
                  <div className="meta-item"><span className="meta-k">Client</span><span className="meta-v">{shortAddr(escrow.payer?.toString())}</span></div>
                  <div className="meta-item"><span className="meta-k">Contractor</span><span className="meta-v">{shortAddr(escrow.receiver?.toString())}</span></div>
                  <div className="meta-item"><span className="meta-k">Disbursed</span><span className="meta-v-teal">{fmt(escrow.released)} XLM</span></div>
                  <div className="meta-item"><span className="meta-k">Remaining</span><span className="meta-v">{fmt(escrow.total_amount - escrow.released)} XLM</span></div>
                </div>

                <div className="prog-head">
                  <span className="prog-label">Phase Progress</span>
                  <span className="prog-pct">{completedCount}/{totalCount} — {progressPct}%</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: progressPct + "%" }} />
                </div>

                <div className="sub-label">Phases</div>
                <div className="ms-grid">
                  {escrow.milestones?.map((done, i) => (
                    <div key={i} className={`ms-node ${done ? "done" : ""}`} title={`Phase ${i + 1}`}>
                      {done ? <IconCheck /> : <span>{i + 1}</span>}
                    </div>
                  ))}
                </div>

                <div className="divider" />

                <div className="sub-label">Approve phase (client only)</div>
                <div className="row2">
                  <div className="field">
                    <label className="label">Phase index (0-based)</label>
                    <input className="input" type="number" min="0" placeholder="0"
                      value={milestoneIdx} onChange={e => setMilestoneIdx(e.target.value)} />
                  </div>
                  <div className="field" style={{ display: "flex", alignItems: "flex-end" }}>
                    <button className="btn btn-teal btn-full" style={{ marginTop: 0 }}
                      onClick={completeMilestone} disabled={loading || !walletPub}>
                      {loading ? <IconSpin /> : <IconCheck />} Approve
                    </button>
                  </div>
                </div>

                <div className="card-footer">
                  Tx history: <ExLink href={`${EXPLORER_BASE}/contract/${CONTRACT_ID}?filter=operations`}>stellar.expert</ExLink>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ CLAIM ══ */}
        {tab === "claim" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Claim Funds</span>
              <span className="chip chip-teal">Contractor</span>
            </div>
            <p className="desc">
              Withdraws earned funds to the contractor proportional to approved phases.
              Only the designated contractor may trigger this action.
            </p>
            <div className="field">
              <label className="label">Agreement ID</label>
              <input className="input" placeholder="project_alpha" value={releaseId}
                onChange={e => setReleaseId(e.target.value)} />
            </div>
            <button className="btn btn-teal btn-full" onClick={releaseEscrow} disabled={loading || !walletPub}>
              {loading ? <IconSpin /> : <IconUnlock />}
              {loading ? "Processing…" : "Withdraw Earnings"}
            </button>
            <div className="card-footer">
              Contract: <ExLink href={CONTRACT_EXPLORER_URL}>{shortContract(CONTRACT_ID)}</ExLink>
            </div>
          </div>
        )}

        {/* ══ VOID ══ */}
        {tab === "void" && (
          <div className="card">
            <div className="card-head">
              <span className="card-title">Terminate Agreement</span>
              <span className="chip chip-red">Client Only</span>
            </div>
            <p className="desc">
              Terminates the agreement and returns all undisbursed funds to the client.
              This action is irreversible and only the original client can trigger it.
            </p>
            <div className="field">
              <label className="label">Agreement ID</label>
              <input className="input" placeholder="project_alpha" value={cancelId}
                onChange={e => setCancelId(e.target.value)} />
            </div>
            <button className="btn btn-danger btn-full" onClick={cancelEscrow} disabled={loading || !walletPub}>
              {loading ? <IconSpin /> : <IconTrash />}
              {loading ? "Processing…" : "Terminate & Refund"}
            </button>
            <div className="card-footer">
              Contract: <ExLink href={CONTRACT_EXPLORER_URL}>{shortContract(CONTRACT_ID)}</ExLink>
            </div>
          </div>
        )}

      </div>

      <Toast toasts={toasts} />
    </>
  );
}