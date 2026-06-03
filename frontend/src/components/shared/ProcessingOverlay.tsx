import React from "react";
import { useLocation } from "react-router-dom";
import { useProcessing } from "../../contexts/ProcessingContext";
import "../../styles/shared/ProcessingOverlay.css";

const ProcessingOverlay: React.FC = () => {
  const { active } = useProcessing();
  const location = useLocation();

  if (!active || !location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="processing-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="processing-overlay__content">
        <div className="processing-overlay__spinner" aria-hidden="true">
          <span />
        </div>
        <p className="processing-overlay__title">Working on it</p>
        <p className="processing-overlay__message">Please wait while we save your changes.</p>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
