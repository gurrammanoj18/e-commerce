import React from "react";
import "../../styles/shared/LoadingState.css";

interface LoadingStateProps {
  cardCount?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ cardCount = 4 }) => {
  return (
    <div className="loading-grid">
      {Array.from({ length: cardCount }, (_, index) => (
        <div className="loading-card" key={index}>
          <div className="loading-thumb" />
          <div className="loading-line" />
          <div className="loading-line loading-line--short" />
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
