import React, { useState } from "react";
import "../styles/pages/BulkOrderPage.css";
import "../styles/pages/AccountPageSpacing.css";
import "../styles/shared/LoadingState.css";
import { toast } from "react-toastify";
import { submitBulkOrder } from "../services/supportService";
import { BulkInquiry } from "../types/store";

interface BulkOrderFormState {
  name: string;
  address: string;
  mobileNumber: string;
  email: string;
  requirements: string;
  priorityRequest: boolean;
}

const BulkOrderPage: React.FC = () => {
  const [submitted, setSubmitted] = useState<BulkInquiry | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState<BulkOrderFormState>({
    name: "",
    address: "",
    mobileNumber: "",
    email: "",
    requirements: "",
    priorityRequest: false,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitBulkOrder({
        name: formState.name,
        address: formState.address,
        mobileNumber: formState.mobileNumber,
        email: formState.email || undefined,
        requirements: formState.requirements,
        priorityRequest: formState.priorityRequest,
      });
      setSubmitted(response);
      toast.success("Bulk inquiry submitted");
    } catch {
      toast.error("Unable to submit bulk inquiry right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setFormState((current) => ({
        ...current,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }
    setFormState((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className="shell section page-section bulk-order-page">
      <div className="page-header">
        <span className="eyebrow">Bulk Orders</span>
        <h1>Send your bulk requirement</h1>
      </div>

      <div className="bulk-layout">
        <form className="store-card form-card" onSubmit={handleSubmit}>
          <h2>Bulk inquiry form</h2>
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={formState.name} onChange={handleChange} required />
            </label>
            <label>
              Mobile number
              <input name="mobileNumber" value={formState.mobileNumber} onChange={handleChange} required />
            </label>
            <label className="form-grid__wide">
              Address
              <textarea name="address" rows={3} value={formState.address} onChange={handleChange} required />
            </label>
            <label className="form-grid__wide">
              Email optional
              <input name="email" type="email" value={formState.email} onChange={handleChange} />
            </label>
            <label className="form-grid__wide">
              Mandatory requirement
              <textarea
                name="requirements"
                rows={5}
                value={formState.requirements}
                onChange={handleChange}
                placeholder="Describe product names, quantity, delivery needs, budget, or any other requirement."
                required
              />
            </label>
            <label className="checkout-inline-check">
              <input
                type="checkbox"
                name="priorityRequest"
                checked={formState.priorityRequest}
                onChange={handleChange}
              />
              <span>Mark this inquiry as urgent</span>
            </label>
          </div>

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? (
              <span className="button-loading">
                <span className="button-loading__spinner" aria-hidden="true" />
                Submitting...
              </span>
            ) : (
              "Submit inquiry"
            )}
          </button>
          {submitted ? (
            <p className="form-success">Thanks. Your bulk inquiry has been captured for follow-up.</p>
          ) : null}
        </form>

        <aside className="store-card support-card">
          <h2>What happens next</h2>
          <ul>
            <li>Admin receives your name, address, mobile number, optional email, and requirement.</li>
            <li>The team reviews availability and pricing before contacting you.</li>
            <li>Urgent inquiries are marked clearly in the admin panel.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default BulkOrderPage;
