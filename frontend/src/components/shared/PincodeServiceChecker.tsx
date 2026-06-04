import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { checkPincodeServiceability } from "../../services/accountService";
import { PincodeServiceabilityResult } from "../../types/store";
// TypeScript may not recognize side-effect CSS imports in some setups.
// @ts-ignore: Ignore missing module type declarations for CSS import
import "../../styles/shared/PincodeServiceChecker.css";

interface PincodeServiceCheckerProps {
  open: boolean;
  onClose: () => void;
  storageKey?: string;
}

const PINCODE_CHECKER_SESSION_KEY = "voltmart-pincode-checker-shown";

const PincodeServiceChecker: React.FC<PincodeServiceCheckerProps> = ({
  open,
  onClose,
  storageKey = PINCODE_CHECKER_SESSION_KEY,
}) => {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PincodeServiceabilityResult | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (window.sessionStorage.getItem(storageKey) === "true") {
      onClose();
      return;
    }

    window.sessionStorage.setItem(storageKey, "true");

    setPincode("");
    setChecking(false);
    setResult(null);
  }, [onClose, open, storageKey]);

  if (!open) {
    return null;
  }

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
    <div className="pincode-checker-modal" role="presentation" onClick={onClose}>
      <section
        className="pincode-checker-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pincode-checker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pincode-checker__copy">
          <span className="eyebrow">Pincode service</span>
          <h2 id="pincode-checker-title">Check home delivery availability</h2>
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

        <div className="pincode-checker__footer">
          <button type="button" className="link-button" onClick={onClose}>
            Skip
          </button>
          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
};

export default PincodeServiceChecker;
