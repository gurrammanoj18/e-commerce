import React, { useState } from "react";
import { toast } from "react-toastify";
import { checkPincodeServiceability } from "../../services/accountService";
import { PincodeServiceabilityResult } from "../../types/store";
// TypeScript may not recognize side-effect CSS imports in some setups.
// @ts-ignore: Ignore missing module type declarations for CSS import
import "../../styles/shared/PincodeServiceChecker.css";

const PincodeServiceChecker: React.FC = () => {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PincodeServiceabilityResult | null>(null);

  const handleCheck = async () => {
    const normalized = pincode.trim();
    if (!/^\d{6}$/.test(normalized)) {
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }

    setChecking(true);
    try {
      setResult(await checkPincodeServiceability(normalized));
    } catch {
      toast.error("Unable to check serviceability right now.");
      setResult(null);
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="shell section">
      <div className="pincode-checker">
        <div className="pincode-checker__copy">
          <span className="eyebrow">Pincode service</span>
          <h2>Check home delivery availability</h2>
          <p>Enter your pincode to see whether VoltMart home delivery is available.</p>
        </div>

        <div className="pincode-checker__controls">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode}
            onChange={(event) => {
              const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(digitsOnly);
            }}
            placeholder="Enter pincode"
            aria-label="Enter pincode"
          />
          <button type="button" className="button" onClick={handleCheck} disabled={checking}>
            {checking ? "Checking..." : "Check"}
          </button>
        </div>

        <p className="pincode-checker__hint">Home delivery is currently available for 500074 only.</p>

        {result ? (
          <div
            className={`pincode-checker__result ${
              result.serviceable ? "is-serviceable" : "is-unserviceable"
            }`}
          >
            <strong>{result.serviceable ? "Serviceable" : "Not serviceable"}</strong>
            <span>{result.message}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default PincodeServiceChecker;
