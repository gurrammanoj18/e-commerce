import React, { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchOrders } from "../services/orderService";
import { fetchReturnRequests, submitReturnRequest } from "../services/returnService";
import "../styles/pages/OrdersPage.css";
import { Order, ReturnRequest, ReturnRequestType, ReturnResolution } from "../types/store";
import { formatCurrency } from "../utils/currency";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const formatStatus = (value: string) =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const ReturnsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<ReturnRequestType>("RETURN");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [preferredResolution, setPreferredResolution] =
    useState<ReturnResolution>("WALLET_CREDIT");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderResponse, requestResponse] = await Promise.all([
          fetchOrders(),
          fetchReturnRequests(),
        ]);
        setOrders(orderResponse);
        setReturnRequests(requestResponse);
      } catch {
        toast.error("Unable to load return management right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED"),
    [orders],
  );

  const selectedOrder = deliveredOrders.find((order) => order.id === selectedOrderId) ?? null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder) {
      toast.error("Choose a delivered order first.");
      return;
    }

    if (!reason.trim() || !description.trim()) {
      toast.error("Please fill in the reason and description.");
      return;
    }

    setSubmitting(true);
    try {
      const createdRequest = await submitReturnRequest({
        orderId: selectedOrder.id,
        requestType,
        reason,
        description,
        preferredResolution:
          requestType === "REPLACEMENT"
            ? "REPLACEMENT"
            : preferredResolution === "REPLACEMENT"
              ? "WALLET_CREDIT"
              : preferredResolution,
      });
      setReturnRequests((current) => [createdRequest, ...current]);
      setReason("");
      setDescription("");
      setPreferredResolution("WALLET_CREDIT");
      setRequestType("RETURN");
      setSelectedOrderId(null);
      toast.success("Return request submitted.");
    } catch (submissionError) {
      toast.error(getErrorMessage(submissionError, "Unable to submit the return request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="shell section page-section">
        <div className="store-card empty-state">
          <h1>Loading return management...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Returns</span>
          <h1>Return management after delivery</h1>
        </div>
      </div>

      <div className="orders-list">
        <article className="store-card order-card">
          <div className="order-card__header">
            <div>
              <span>How COD returns work</span>
              <h2>Why returns are still possible with cash on delivery</h2>
            </div>
          </div>
          <p className="order-card__copy">
            COD only changes how payment is collected at checkout. The customer pays when the order
            is delivered, so after delivery the order can still be managed as a return request.
            Since there is no card transaction to reverse, VoltMart can handle the return through a
            wallet credit, a replacement, or a manual refund arranged by support.
          </p>
          <p className="order-card__copy">
            This page is for delivered orders only. The admin team reviews the request, arranges
            pickup if needed, and updates the return status after inspection.
          </p>
          <div className="order-card__actions">
            <Link className="button" to="/orders">
              View my orders
            </Link>
            <Link className="link-button" to="/contact">
              Contact support
            </Link>
          </div>
        </article>

        <article className="store-card order-card">
          <div className="order-card__header">
            <div>
              <span>New request</span>
              <h2>Submit a return for a delivered order</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="order-card__return-type-toggle form-grid__wide">
              <button
                type="button"
                className={requestType === "RETURN" ? "button button--light" : "link-button"}
                onClick={() => {
                  setRequestType("RETURN");
                  setPreferredResolution("WALLET_CREDIT");
                }}
              >
                Return
              </button>
              <button
                type="button"
                className={requestType === "REPLACEMENT" ? "button button--light" : "link-button"}
                onClick={() => {
                  setRequestType("REPLACEMENT");
                  setPreferredResolution("REPLACEMENT");
                }}
              >
                Replacement
              </button>
            </div>

            <label className="form-grid__wide">
              Delivered order
              <select
                value={selectedOrderId ?? ""}
                onChange={(event) =>
                  setSelectedOrderId(event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">Select a delivered order</option>
                {deliveredOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.orderNumber.slice(0, 8)} · {formatCurrency(order.totalAmount)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Return reason
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Damaged item, wrong item, quality issue..."
              />
            </label>

            <label>
              Preferred resolution
              <select
                value={preferredResolution}
                onChange={(event) =>
                  setPreferredResolution(event.target.value as ReturnResolution)
                }
                disabled={requestType === "REPLACEMENT"}
              >
                {requestType === "REPLACEMENT" ? (
                  <option value="REPLACEMENT">Replacement</option>
                ) : (
                  <>
                    <option value="WALLET_CREDIT">Wallet credit</option>
                    <option value="MANUAL_REFUND">Manual refund</option>
                  </>
                )}
              </select>
            </label>

            <label className="form-grid__wide">
              Describe the issue
              <textarea
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what happened after delivery and anything the pickup team should know."
              />
            </label>

            {selectedOrder ? (
              <div className="order-card__copy form-grid__wide">
                Selected order #{selectedOrder.orderNumber.slice(0, 8)} is already delivered, so it
                is eligible for return review.
              </div>
            ) : (
              <div className="order-card__copy form-grid__wide">
                Pick a delivered order first. Only delivered orders can be returned.
              </div>
            )}

            <div className="order-card__actions form-grid__wide">
              <button className="button" type="submit" disabled={submitting}>
                {submitting
                  ? "Submitting..."
                  : requestType === "REPLACEMENT"
                    ? "Submit replacement request"
                    : "Submit return request"}
              </button>
            </div>
          </form>
        </article>

        <article className="store-card order-card">
          <div className="order-card__header">
            <div>
              <span>History</span>
              <h2>Your return requests</h2>
            </div>
          </div>

          {returnRequests.length ? (
            <div className="orders-list">
              {returnRequests.map((request) => (
                <div key={request.id} className="order-card__item" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="order-card__item-content">
                    <strong>
                      Order #{request.orderNumber.slice(0, 8)} · {formatStatus(request.status)}
                    </strong>
                    <span className="order-card__item-status">Reason: {request.reason}</span>
                    <span className="order-card__item-status">
                      Type: {formatStatus(request.requestType)}
                    </span>
                    <span className="order-card__item-status">
                      Resolution: {formatStatus(request.preferredResolution)}
                    </span>
                    <span className="order-card__item-status">
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                    <span className="order-card__copy">{request.description}</span>
                    {request.adminNote ? <span className="order-card__copy">Note: {request.adminNote}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="order-card__copy">No return requests have been submitted yet.</p>
          )}
        </article>
      </div>
    </section>
  );
};

export default ReturnsPage;
