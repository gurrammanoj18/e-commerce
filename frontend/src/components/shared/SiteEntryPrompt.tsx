import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { checkPincodeServiceability } from "../../services/accountService";
import { PincodeServiceabilityResult } from "../../types/store";
import "../../styles/shared/SiteEntryPrompt.css";

const SITE_ENTRY_PROMPT_KEY = "voltmart-site-entry-prompt-shown";
const GUEST_DELIVERY_MODE_KEY = "voltmart-guest-delivery-mode";

type EntryPromptStep = "delivery-mode" | "pincode-check";

const SiteEntryPrompt: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [open, setOpen] = useState(() => window.sessionStorage.getItem(SITE_ENTRY_PROMPT_KEY) !== "true");
  const [step, setStep] = useState<EntryPromptStep>("delivery-mode");
  const [deliveryMode, setDeliveryMode] = useState<string | null>(null);
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PincodeServiceabilityResult | null>(null);

  useEffect(() => {
    if (open) {
      window.sessionStorage.setItem(SITE_ENTRY_PROMPT_KEY, "true");
    }

    const storedMode = window.localStorage.getItem(GUEST_DELIVERY_MODE_KEY);
    if (storedMode === "HOME_DELIVERY" || storedMode === "STORE_PICKUP") {
      setDeliveryMode(storedMode);
    }
  }, [open]);

  useEffect(() => {
    if (!open || loading || isAuthenticated) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAuthenticated, loading, open]);

  if (!open || loading || isAuthenticated || window.location.pathname.startsWith("/admin")) {
    return null;
  }

  const closePrompt = () => {
    window.sessionStorage.setItem(SITE_ENTRY_PROMPT_KEY, "true");
    setOpen(false);
  };

  const chooseMode = (
    mode: "HOME_DELIVERY" | "STORE_PICKUP",
    event?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event?.stopPropagation();
    window.localStorage.setItem(GUEST_DELIVERY_MODE_KEY, mode);
    setDeliveryMode(mode);
    toast.success(mode === "HOME_DELIVERY" ? "Home delivery selected." : "Store pickup selected.");

    if (mode === "HOME_DELIVERY") {
      setStep("pincode-check");
      setResult(null);
      return;
    }

    closePrompt();
  };

  const handleCheck = async () => {
    const normalized = pincode.trim();
    if (!/^\d{6}$/.test(normalized)) {
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }

    setChecking(true);
    setResult(null);
    try {
      setResult(await checkPincodeServiceability(normalized));
    } catch {
      toast.error("Unable to check pincode serviceability right now.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="site-entry-prompt" role="presentation" onClick={closePrompt}>
      <section
        className="site-entry-prompt__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-entry-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="site-entry-prompt__header">
          <span className="eyebrow">Welcome to VoltMart</span>
          <h2 id="site-entry-prompt-title">
            {step === "delivery-mode" ? "Choose how you want your order" : "Check home delivery availability"}
          </h2>
          <p>
            {step === "delivery-mode"
              ? "Choose home delivery or store pickup before you start shopping."
              : "Enter your pincode to confirm whether home delivery is available in your area."}
          </p>
        </div>

        {step === "delivery-mode" ? (
          <div className="site-entry-prompt__actions" role="group" aria-label="Delivery mode">
            <button
              type="button"
              className={`site-entry-prompt__mode ${deliveryMode === "STORE_PICKUP" ? "is-active" : ""}`}
              onClick={(event) => chooseMode("STORE_PICKUP", event)}
            >
              Pick at store
            </button>
            <button
              type="button"
              className={`site-entry-prompt__mode site-entry-prompt__mode--primary ${deliveryMode === "HOME_DELIVERY" ? "is-active" : ""}`}
              onClick={(event) => chooseMode("HOME_DELIVERY", event)}
            >
              Home delivery
            </button>
          </div>
        ) : (
          <div className="site-entry-prompt__checker">
            <label>
              Pincode checker
              <div className="site-entry-prompt__checker-row">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  aria-label="Enter pincode"
                />
                <button type="button" className="button" onClick={() => void handleCheck()} disabled={checking}>
                  {checking ? (
                    <span className="button-loading">
                      <span className="button-loading__spinner" aria-hidden="true" />
                      Checking
                    </span>
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
            </label>
            <p className="site-entry-prompt__hint">Home delivery is currently available for pincode 500074 only.</p>
            {result ? (
              <div
                className={`site-entry-prompt__result ${
                  result.serviceable ? "is-serviceable" : "is-unserviceable"
                }`}
              >
                <strong>{result.serviceable ? "Serviceable" : "Not serviceable"}</strong>
                <span>{result.message}</span>
              </div>
            ) : null}
          </div>
        )}

        <div className="site-entry-prompt__footer">
          {step === "pincode-check" ? (
            <button
              type="button"
              className="link-button"
              onClick={(event) => {
                event.stopPropagation();
                setStep("delivery-mode");
              }}
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            className="link-button"
            onClick={(event) => {
              event.stopPropagation();
              closePrompt();
            }}
          >
            Skip for now
          </button>
        </div>
      </section>
    </div>
  );
};

export default SiteEntryPrompt;
