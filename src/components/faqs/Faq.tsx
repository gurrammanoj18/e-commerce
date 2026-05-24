import React, { useState } from "react";
import "./faq.css";

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is your return policy?",
      answer: "You can return products within 30 days of delivery.",
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes, we offer free shipping on orders above ₹999.",
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order from your account dashboard.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? faqs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === faqs.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="faq-section">
     
      <div className="faq-carousel">
        <button className="faq-nav prev" onClick={handlePrev}>
          ❮
        </button>

        <div className="faq-slide">
          <h3 className="faq-question">{faqs[currentIndex].question}</h3>
       
        </div>

        <button className="faq-nav next" onClick={handleNext}>
          ❯
        </button>
      </div>
      <div className="faq-dots">
        {faqs.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
