import React from "react";
import "../../styles/product/QuantitySelector.css";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
}) => {
  return (
    <div className="quantity-selector">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>
        -
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
