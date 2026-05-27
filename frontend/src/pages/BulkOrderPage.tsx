import React, { useEffect, useMemo, useState } from "react";
import "../styles/pages/BulkOrderPage.css";
import { toast } from "react-toastify";
import { submitBulkOrder } from "../services/supportService";
import { getProducts } from "../services/productService";
import { BulkInquiry, Product } from "../types/store";
import { formatCurrency } from "../utils/currency";

interface BulkOrderFormState {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productCategory: string;
  estimatedQuantity: number;
  requirements: string;
  deliveryCity: string;
  budgetAmount: string;
  rfqRequired: boolean;
  priorityRequest: boolean;
}

const BulkOrderPage: React.FC = () => {
  const [submitted, setSubmitted] = useState<BulkInquiry | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [formState, setFormState] = useState<BulkOrderFormState>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    productCategory: "",
    estimatedQuantity: 1,
    requirements: "",
    deliveryCity: "",
    budgetAmount: "",
    rfqRequired: true,
    priorityRequest: false,
  });
  const [items, setItems] = useState([
    { productId: "", productName: "", quantity: 1 },
  ]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await getProducts({ page: 0, size: 100 });
        setCatalog(response.content);
      } catch {
        setCatalog([]);
      }
    };

    void loadCatalog();
  }, []);

  const estimatedQuantity = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await submitBulkOrder({
      ...formState,
      estimatedQuantity,
      budgetAmount: formState.budgetAmount ? Number(formState.budgetAmount) : null,
      items: items.map((item) => {
        const matchedProduct = catalog.find((product) => product.id === Number(item.productId));
        return {
          productId: item.productId ? Number(item.productId) : null,
          productName: matchedProduct?.name || item.productName,
          quantity: Number(item.quantity),
        };
      }),
    });
    setSubmitted(response);
    toast.success("Bulk inquiry submitted");
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormState((current) => ({
        ...current,
        [name as keyof BulkOrderFormState]: checked,
      }));
      return;
    }
    setFormState((current) => ({
      ...current,
      [name as keyof BulkOrderFormState]: value,
    }));
  };

  const handleLineItemChange = (index: number, field: string, value: string | number) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Bulk order desk</span>
        <h1>Request pricing for larger hardware requirements</h1>
        <p>
          Build a multi-product quote, request an RFQ, and see the estimated bulk pricing
          engine before our team follows up.
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
                <option>Appliances</option>
                <option>Electricals</option>
                <option>Power & Hand Tools</option>
                <option>Hardware</option>
                <option>Lighting & Fans</option>
                <option>Bathroom</option>
                <option>Plumbing</option>
                <option>Kitchen</option>
              </select>
            </label>
            <label>
              Delivery city
              <input name="deliveryCity" value={formState.deliveryCity} onChange={handleChange} />
            </label>
            <label>
              Budget
              <input
                name="budgetAmount"
                type="number"
                min={0}
                value={formState.budgetAmount}
                onChange={handleChange}
              />
            </label>
            <label>
              Estimated quantity
              <input name="estimatedQuantity" type="number" value={estimatedQuantity} readOnly />
            </label>
            <label className="form-grid__wide">
              Requirements
              <textarea
                name="requirements"
                rows={5}
                value={formState.requirements}
                onChange={handleChange}
                placeholder="Share preferred models, use case, target budget, delivery constraints, and commercial expectations."
              />
            </label>
            <label className="checkout-inline-check">
              <input
                type="checkbox"
                name="rfqRequired"
                checked={formState.rfqRequired}
                onChange={handleChange}
              />
              <span>This inquiry requires a formal RFQ response</span>
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

          <div className="bulk-line-item-list">
            <h3>Requested products</h3>
            {items.map((item, index) => (
              <div key={`bulk-item-${index}`} className="form-grid">
                <label className="form-grid__wide">
                  Product
                  <select
                    value={item.productId}
                    onChange={(event) => {
                      const productId = event.target.value;
                      const matchedProduct = catalog.find(
                        (product) => product.id === Number(productId),
                      );
                      handleLineItemChange(index, "productId", productId);
                      handleLineItemChange(index, "productName", matchedProduct?.name || "");
                    }}
                  >
                    <option value="">Custom / not listed</option>
                    {catalog.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                {!item.productId ? (
                  <label className="form-grid__wide">
                    Custom product name
                    <input
                      value={item.productName}
                      onChange={(event) =>
                        handleLineItemChange(index, "productName", event.target.value)
                      }
                    />
                  </label>
                ) : null}
                <label>
                  Quantity
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) =>
                      handleLineItemChange(index, "quantity", Number(event.target.value))
                    }
                  />
                </label>
              </div>
            ))}
            <div className="cart-item__actions">
              <button
                className="link-button"
                type="button"
                onClick={() =>
                  setItems((current) => [...current, { productId: "", productName: "", quantity: 1 }])
                }
              >
                Add another product
              </button>
              {items.length > 1 ? (
                <button
                  className="link-button"
                  type="button"
                  onClick={() => setItems((current) => current.slice(0, -1))}
                >
                  Remove last row
                </button>
              ) : null}
            </div>
          </div>

          <button className="button" type="submit">
            Submit inquiry
          </button>
          {submitted ? (
            <p className="form-success">Thanks. Your bulk inquiry has been captured for follow-up.</p>
          ) : null}
        </form>

        <aside className="store-card support-card">
          <h2>Estimated quote snapshot</h2>
          {submitted ? (
            <div className="admin-summary-stack">
              <div>
                <span>Status</span>
                <strong>{submitted.quoteStatus}</strong>
              </div>
              <div>
                <span>Estimated total</span>
                <strong>{formatCurrency(submitted.estimatedTotal || 0)}</strong>
              </div>
              <div>
                <span>RFQ requested</span>
                <strong>{submitted.rfqRequired ? "Yes" : "No"}</strong>
              </div>
              {submitted.items.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <strong>
                    {formatCurrency(item.estimatedLineTotal)} ({item.discountPercentage}% off)
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <ul>
              <li>Commercial pricing tiers apply at 10, 20, 50, and 100 units.</li>
              <li>Formal RFQ handling can be flagged from this form.</li>
              <li>Multi-product quote lines are included in the same inquiry.</li>
              <li>Priority requests surface clearly for admin follow-up.</li>
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
};

export default BulkOrderPage;
