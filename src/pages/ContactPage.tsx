import React, { useState } from "react";

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Contact & support</span>
        <h1>Talk to product and order support</h1>
        <p>
          Reach us for product recommendations, order assistance, or post-purchase help.
        </p>
      </div>

      <div className="contact-layout">
        <form className="store-card form-card" onSubmit={handleSubmit}>
          <h2>Contact form</h2>
          <div className="form-grid">
            <label>
              Name
              <input required />
            </label>
            <label>
              Email
              <input type="email" required />
            </label>
            <label className="form-grid__wide">
              Message
              <textarea rows={6} required placeholder="How can we help?" />
            </label>
          </div>
          <button className="button" type="submit">
            Send message
          </button>
          {sent ? <p className="form-success">Your message has been sent successfully.</p> : null}
        </form>

        <aside className="contact-stack">
          <div className="store-card support-card">
            <h2>Support hours</h2>
            <p>Mon-Sat · 9:00 AM to 8:00 PM</p>
            <p>support@voltmart.in</p>
            <p>+91 98765 43210</p>
          </div>
          <a
            className="store-card whatsapp-card"
            href="https://wa.me/919876543210?text=Hi%20VoltMart%2C%20I%20need%20help%20with%20a%20product."
            target="_blank"
            rel="noreferrer"
          >
            <span>WhatsApp support</span>
            <strong>Start a quick chat with our team</strong>
          </a>
        </aside>
      </div>
    </section>
  );
};

export default ContactPage;
