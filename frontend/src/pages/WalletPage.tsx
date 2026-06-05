import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWallet, redeemWalletCode } from "../services/accountService";
import "../styles/pages/AccountPageSpacing.css";
import { WalletSummary } from "../types/store";
import { formatCurrency } from "../utils/currency";

const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setWallet(await fetchWallet());
      } catch {
        toast.error("Unable to load wallet right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadWallet();
  }, []);

  const handleRedeem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      toast.error("Enter your code to add money to wallet.");
      return;
    }

    setRedeeming(true);
    try {
      const response = await redeemWalletCode(code.trim());
      setWallet(response);
      setCode("");
      toast.success("Wallet updated successfully.");
    } catch {
      toast.error("Unable to redeem that code.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <section className="shell section page-section wallet-page">
      <div className="page-header">
        <span className="eyebrow">Wallet</span>
        <h1>Your wallet and reward balance</h1>
        <p>Use admin-issued wallet codes here and track cashback credits from completed orders.</p>
      </div>

      <div className="checkout-layout">
        <article className="store-card form-card">
          <h2>Balance</h2>
          <div className="checkout-delivery-mode">
            <span>Available wallet balance</span>
            <strong>{wallet ? formatCurrency(wallet.balance) : loading ? "Loading..." : formatCurrency(0)}</strong>
          </div>
          <form className="form-grid" onSubmit={handleRedeem}>
            <label className="form-grid__wide">
              Enter admin wallet code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Example: ADD500"
                disabled={redeeming}
              />
            </label>
            <div className="admin-form-actions">
              <button className="button" type="submit" disabled={redeeming}>
                {redeeming ? "Applying..." : "Add to wallet"}
              </button>
            </div>
          </form>
        </article>

        <aside className="store-card summary-card">
          <h2>Wallet activity</h2>
          {wallet?.transactions.length ? (
            wallet.transactions.map((transaction) => (
              <div key={transaction.id}>
                <span>{transaction.description}</span>
                <strong>{formatCurrency(transaction.amount)}</strong>
              </div>
            ))
          ) : (
            <p>No wallet activity yet.</p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default WalletPage;
