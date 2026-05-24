import React, { useState } from "react";
import { toast } from "react-toastify";
import { submitBulkOrder } from "../services/supportService";

const BulkOrderPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    productCategory: "",
    estimatedQuantity: 1,
    requirements: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitBulkOrder(formState);
    setSubmitted(true);
    toast.success("Bulk inquiry submitted");
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: name === "estimatedQuantity" ? Number(value) : value,
    }));
  };

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Bulk order desk</span>
        <h1>Request pricing for larger hardware requirements</h1>
        <p>
          Tell us what your team or business needs and we’ll help with model
          selection, lead time, and commercial pricing.
        </p>
      </div>

      <div className="bulk-layout">
        <form className="store-card form-card" onSubmit={handleSubmit}>
          <h2>Bulk inquiry form</h2>
          <div className="form-grid">
            <label>
              Company name
              <input name="companyName" value={formState.companyName} onChange={handleChange} required />
            </label>
            <label>
              Contact person
              <input name="contactPerson" value={formState.contactPerson} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={formState.email} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={formState.phone} onChange={handleChange} required />
            </label>
            <label>
              Product category
              <select name="productCategory" required value={formState.productCategory} onChange={handleChange}>
                <option value="" disabled>
                  Select category
                </option>
                <option>Laptops</option>
                <option>Networking</option>
                <option>Audio</option>
                <option>Gaming</option>
                <option>Components</option>
              </select>
            </label>
            <label>
              Estimated quantity
              <input name="estimatedQuantity" type="number" min={1} value={formState.estimatedQuantity} onChange={handleChange} required />
            </label>
            <label className="form-grid__wide">
              Requirements
              <textarea
                name="requirements"
                rows={5}
                value={formState.requirements}
                onChange={handleChange}
                placeholder="Share preferred models, use case, target budget, and delivery city."
              />
            </label>
          </div>
          <button className="button" type="submit">
            Submit inquiry
          </button>
          {submitted ? (
            <p className="form-success">Thanks. Your bulk inquiry has been captured for follow-up.</p>
          ) : null}
        </form>

        <aside className="store-card support-card">
          <h2>Why use bulk ordering?</h2>
          <ul>
            <li>Commercial pricing support for larger quantities</li>
            <li>Assistance with product matching and alternatives</li>
            <li>Invoice-ready procurement flow for businesses</li>
            <li>Delivery planning for multiple locations or teams</li>
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default BulkOrderPage;
