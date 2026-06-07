import React, { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchOrders, reorderOrder } from "../services/orderService";
import { fetchReturnRequests, submitReturnRequest } from "../services/returnService";
import "../styles/pages/OrdersPage.css";
import { Order, ReturnRequest, ReturnRequestType, ReturnResolution } from "../types/store";
import { formatCurrency } from "../utils/currency";

const ORDER_STATUS_FLOW = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const RETURN_STATUS_FLOW = ["CONFIRMED", "READY_TO_PICKUP", "PICKUP_SCHEDULED", "PICKED_UP", "REFUNDED"] as const;
const REPLACEMENT_STATUS_FLOW = ["UNDER_REVIEW", "READY_TO_PICKUP", "PICKUP_SCHEDULED", "SHIPPED", "DELIVERED"] as const;

const ORDER_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURN_REQUESTED", label: "Return requested" },
  { value: "REFUNDED", label: "Refunded" },
] as const;

type OrderFilterValue = (typeof ORDER_FILTERS)[number]["value"];

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

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

const formatLongDate = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const getPrimaryItem = (order: Order) => order.items[0];

const getLatestReturnRequest = (returnRequests: ReturnRequest[], orderId: number) =>
  returnRequests
    .filter((request) => request.orderId === orderId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

const getReturnStatusFlow = (request: ReturnRequest) =>
  request.requestType === "REPLACEMENT" ? REPLACEMENT_STATUS_FLOW : RETURN_STATUS_FLOW;

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    RETURN_REQUESTED: "Return requested",
    UNDER_REVIEW: "Under review",
    READY_TO_PICKUP: "Return pickup",
    PICKUP_SCHEDULED: "Scheduled",
    PICKED_UP: "Returned",
    REFUNDED: "Refunded",
    REJECTED: "Rejected",
    REQUESTED: "Requested",
    APPROVED: "Approved",
    CLOSED: "Closed",
  };

  return labels[status] || formatStatus(status);
};

const getStatusNote = (status: string, returnRequest?: ReturnRequest | undefined) => {
  if (!returnRequest) {
    const notes: Record<string, string> = {
      CONFIRMED: "Your order is confirmed and ready for the next step.",
      PROCESSING: "We're preparing your items for dispatch.",
      SHIPPED: "Your order is on the way.",
      DELIVERED: "Your order reached the delivery address.",
    };

    return notes[status] || "Order status updated.";
  }

  const actionLabel = returnRequest.requestType === "REPLACEMENT" ? "Replacement" : "Return";
  const notes: Record<string, string> = {
    CONFIRMED: `${actionLabel} request received on ${formatLongDate(returnRequest.createdAt)}.`,
    UNDER_REVIEW: "Support is reviewing the request.",
    READY_TO_PICKUP: "Pickup has been arranged.",
    PICKUP_SCHEDULED: "Pickup is scheduled soon.",
    PICKED_UP: "The item has been collected for inspection.",
    SHIPPED: "Replacement item has been dispatched.",
    DELIVERED: "Replacement item has been delivered.",
    REFUNDED: "Refund has been completed.",
    REJECTED: "The request was rejected by support.",
  };

  return notes[status] || `${actionLabel} status updated.`;
};

const getStatusDate = (status: string, order: Order, returnRequest?: ReturnRequest | undefined) => {
  if (!returnRequest) {
    return formatShortDate(order.createdAt);
  }

  if (status === "CONFIRMED" || status === "UNDER_REVIEW") {
    return formatShortDate(returnRequest.createdAt);
  }

  if (status === "REFUNDED" && returnRequest.refundedAt) {
    return formatShortDate(returnRequest.refundedAt);
  }

  return formatShortDate(returnRequest.createdAt);
};

const isReturnComplete = (request?: ReturnRequest | undefined) =>
  Boolean(
    request &&
      (request.status === "REFUNDED" ||
        (request.requestType === "REPLACEMENT" && request.status === "DELIVERED")),
  );

const getOrderFilterValue = (order: Order, returnRequest?: ReturnRequest | undefined): OrderFilterValue => {
  if (isReturnComplete(returnRequest)) {
    return "REFUNDED";
  }

  if (returnRequest) {
    return "RETURN_REQUESTED";
  }

  if (ORDER_STATUS_FLOW.includes(order.status as (typeof ORDER_STATUS_FLOW)[number])) {
    return order.status as OrderFilterValue;
  }

  return "ALL";
};

const getOrderHeadline = (order: Order, returnRequest?: ReturnRequest | undefined) => {
  if (isReturnComplete(returnRequest)) {
    return returnRequest?.requestType === "REPLACEMENT" ? "Replacement delivered" : "Refund completed";
  }

  if (order.status === "DELIVERED") {
    return `Delivered on ${formatShortDate(order.createdAt)}`;
  }

  return getStatusLabel(order.status);
};

const getOrderSubheadline = (order: Order, returnRequest?: ReturnRequest | undefined) => {
  const primaryItem = getPrimaryItem(order);

  if (isReturnComplete(returnRequest)) {
    return primaryItem ? primaryItem.productName : `Order ${order.orderNumber.slice(0, 8)}`;
  }

  if (order.status === "DELIVERED") {
    return primaryItem ? primaryItem.productName : "Delivered order";
  }

  if (primaryItem) {
    return primaryItem.productName;
  }

  return `Order ${order.orderNumber.slice(0, 8)}`;
};

const getBadgeTone = (order: Order, returnRequest?: ReturnRequest | undefined) => {
  if (isReturnComplete(returnRequest)) {
    return "success";
  }

  if (returnRequest) {
    return "warning";
  }

  if (order.status === "DELIVERED") {
    return "success";
  }

  return "info";
};

const getBadgeLabel = (order: Order, returnRequest?: ReturnRequest | undefined) => {
  if (isReturnComplete(returnRequest)) {
    return returnRequest?.requestType === "REPLACEMENT" ? "Replacement delivered" : "Refund completed";
  }

  if (returnRequest) {
    return `${returnRequest.requestType === "REPLACEMENT" ? "Replacement" : "Return"}: ${getStatusLabel(returnRequest.status)}`;
  }

  if (order.status === "DELIVERED") {
    return "Delivered";
  }

  return getStatusLabel(order.status);
};

const getDisplayStatus = (order: Order, returnRequest?: ReturnRequest | undefined) => {
  if (isReturnComplete(returnRequest)) {
    return "REFUNDED";
  }

  if (returnRequest) {
    return "RETURN_REQUESTED";
  }

  return order.status;
};

const getActiveStepIndex = (currentStatus: string, steps: readonly string[]) => {
  const normalized = currentStatus.toUpperCase();
  const index = steps.findIndex((step) => step === normalized);
  if (index >= 0) {
    return index;
  }

  if (normalized === "RETURN_REQUESTED") {
    return 0;
  }

  if (normalized === "REQUESTED" || normalized === "APPROVED") {
    return 0;
  }

  return -1;
};

const getReturnStatusCopy = (request: ReturnRequest) => {
  const actionLabel = request.requestType === "REPLACEMENT" ? "Replacement" : "Return";

  if (request.status === "REFUNDED") {
    if (request.requestType === "REPLACEMENT" || request.preferredResolution === "REPLACEMENT") {
      return "Replacement completed by support.";
    }

    if (request.preferredResolution === "WALLET_CREDIT") {
      return "Refund completed as wallet credit.";
    }

    if (request.preferredResolution === "MANUAL_REFUND") {
      return "Manual COD refund completed by support.";
    }

    return `${actionLabel} completed by support.`;
  }

  if (request.requestType === "REPLACEMENT" && request.status === "DELIVERED") {
    return "Replacement delivered by support.";
  }

  if (request.status === "REJECTED") {
    return `${actionLabel} rejected by support.`;
  }

  return `${actionLabel} status: ${getStatusLabel(request.status)}`;
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilterValue>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [showUpdatesOrderId, setShowUpdatesOrderId] = useState<number | null>(null);
  const [activeReturnOrderId, setActiveReturnOrderId] = useState<number | null>(null);
  const [activeReturnType, setActiveReturnType] = useState<ReturnRequestType>("RETURN");
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnResolution, setReturnResolution] = useState<ReturnResolution>("WALLET_CREDIT");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const activeReturnOrder = useMemo(
    () => orders.find((order) => order.id === activeReturnOrderId) ?? null,
    [activeReturnOrderId, orders],
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderResponse = await fetchOrders();
        setOrders(orderResponse);
      } catch {
        setError("Unable to load your order history right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  useEffect(() => {
    const loadReturnRequests = async () => {
      try {
        const response = await fetchReturnRequests();
        setReturnRequests(response);
      } catch {
        setReturnRequests([]);
      }
    };

    void loadReturnRequests();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .slice()
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .filter((order) => {
        const returnRequest = getLatestReturnRequest(returnRequests, order.id);
        const filterValue = getOrderFilterValue(order, returnRequest);

        if (activeFilter !== "ALL" && filterValue !== activeFilter) {
          return false;
        }
        return true;
      });
  }, [activeFilter, orders, returnRequests]);

  const handleReturnSubmit = async (orderId: number) => {
    if (!returnReason.trim() || !returnDescription.trim()) {
      toast.error("Please add a reason and short description.");
      return;
    }

    const preferredResolution =
      activeReturnType === "REPLACEMENT"
        ? "REPLACEMENT"
        : returnResolution === "REPLACEMENT"
          ? "WALLET_CREDIT"
          : returnResolution;

    setSubmittingReturn(true);
    try {
      const createdRequest = await submitReturnRequest({
        orderId,
        requestType: activeReturnType,
        reason: returnReason,
        description: returnDescription,
        preferredResolution,
      });
      setReturnRequests((current) => [createdRequest, ...current]);
      setActiveReturnOrderId(null);
      setActiveReturnType("RETURN");
      setReturnReason("");
      setReturnDescription("");
      setReturnResolution("WALLET_CREDIT");
      toast.success("Return request submitted.");
    } catch (submissionError) {
      toast.error(
        getErrorMessage(submissionError, "Unable to submit the return request right now.")
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleReorder = async (orderId: number) => {
    try {
      await reorderOrder(orderId);
      toast.success("Added items back to your cart.");
      navigate("/cart");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reorder this purchase right now."));
    }
  };

  const openReturnForm = (orderId: number, requestType: ReturnRequestType) => {
    setExpandedOrderId(orderId);
    setActiveReturnOrderId(orderId);
    setActiveReturnType(requestType);
    setReturnResolution(requestType === "REPLACEMENT" ? "REPLACEMENT" : "WALLET_CREDIT");
    setShowFilters(false);
  };

  const toggleExpanded = (orderId: number) => {
    setExpandedOrderId((current) => {
      const next = current === orderId ? null : orderId;
      if (next === null) {
        setShowUpdatesOrderId(null);
        setActiveReturnOrderId(null);
        setActiveReturnType("RETURN");
      }
      return next;
    });
    setShowFilters(false);
  };

  const closeReturnModal = () => {
    setActiveReturnOrderId(null);
    setActiveReturnType("RETURN");
    setReturnReason("");
    setReturnDescription("");
    setReturnResolution("WALLET_CREDIT");
  };

  const renderTimeline = (order: Order, returnRequest?: ReturnRequest | undefined) => {
    const flow = returnRequest ? getReturnStatusFlow(returnRequest) : ORDER_STATUS_FLOW;
    const activeStatus = returnRequest ? returnRequest.status : order.status;
    const activeStepIndex = getActiveStepIndex(activeStatus, flow);

    return (
      <div className={returnRequest ? "order-card__timeline-group order-card__timeline-group--return" : "order-card__timeline-group"}>
        <div
          className={
            returnRequest ? "order-card__timeline order-card__timeline--return" : "order-card__timeline"
          }
        >
          {flow.map((step, index) => {
            const isActive = index <= activeStepIndex;
            return (
              <div
                className={isActive ? "order-card__timeline-step is-active" : "order-card__timeline-step"}
                key={step}
              >
                <span
                  className={
                    returnRequest
                      ? "order-card__timeline-dot order-card__timeline-dot--return"
                      : "order-card__timeline-dot"
                  }
                />
                <span className="order-card__timeline-label">{getStatusLabel(step)}</span>
              </div>
            );
          })}
        </div>
        {returnRequest ? (
          <div className="order-card__timeline-copy">
            <strong>{getReturnStatusCopy(returnRequest)}</strong>
            <span>Requested on {formatLongDate(returnRequest.createdAt)}</span>
          </div>
        ) : null}
      </div>
    );
  };

  const renderMobileStatusBar = (order: Order, returnRequest?: ReturnRequest | undefined) => {
    const flow = returnRequest ? getReturnStatusFlow(returnRequest) : ORDER_STATUS_FLOW;
    const activeStatus = returnRequest ? returnRequest.status : order.status;
    const activeStepIndex = getActiveStepIndex(activeStatus, flow);

    return (
      <div className="order-card__status-bar">
        {flow.map((status, index) => {
          const isActive = index <= activeStepIndex;
          const isLast = index === flow.length - 1;
          return (
            <div
              className={
                isActive ? "order-card__status-step is-active" : "order-card__status-step"
              }
              key={status}
            >
              <span
                className={
                  returnRequest
                    ? `order-card__status-dot order-card__status-dot--return ${
                        status === "REJECTED" ? "order-card__status-dot--warning" : ""
                      }`.trim()
                    : "order-card__status-dot"
                }
              />
              {!isLast ? <span className="order-card__status-rail" aria-hidden="true" /> : null}
              <div className="order-card__status-copy">
                <div className="order-card__status-title-row">
                  <span className="order-card__status-title">{getStatusLabel(status)}</span>
                  <span className="order-card__status-date">{getStatusDate(status, order, returnRequest)}</span>
                </div>
                <p>{getStatusNote(status, returnRequest)}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="shell section page-section orders-page">
        <div className="store-card empty-state">
          <h1>Loading your orders...</h1>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shell section page-section orders-page">
        <div className="store-card empty-state">
          <h1>Order history unavailable</h1>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="shell section page-section orders-page">
        <div className="store-card empty-state">
          <h1>No orders yet</h1>
          <p>Your future purchases will show up here with status and item details.</p>
          <Link className="button" to="/products">
            Start shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell section page-section orders-page">
      <div className="orders-page__header">
        <button className="orders-page__back-button" type="button" onClick={() => navigate(-1)}>
          <span aria-hidden="true">{"←"}</span>
          <span>My Orders</span>
        </button>

        <button
          className="orders-page__filters-button"
          type="button"
          onClick={() => setShowFilters((current) => !current)}
          aria-expanded={showFilters}
        >
          <span className="orders-page__filters-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Filters</span>
        </button>
      </div>

      <div className={showFilters ? "orders-page__filters is-open" : "orders-page__filters"}>
        {ORDER_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={activeFilter === filter.value ? "orders-page__chip is-active" : "orders-page__chip"}
            type="button"
            onClick={() => {
              setActiveFilter(filter.value);
              setShowFilters(false);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {!filteredOrders.length ? (
        <div className="store-card empty-state">
          <h2>No matching orders</h2>
          <p>Try a different order number, product name, or filter.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const returnRequest = getLatestReturnRequest(returnRequests, order.id);
            const isExpanded = expandedOrderId === order.id;
            const primaryItem = getPrimaryItem(order);
            const badgeTone = getBadgeTone(order, returnRequest);
            const badgeLabel = getBadgeLabel(order, returnRequest);
            const headline = getOrderHeadline(order, returnRequest);
            const subheadline = getOrderSubheadline(order, returnRequest);
            const statusValue = getDisplayStatus(order, returnRequest);
            const refundAmount = returnRequest?.orderTotal ?? order.totalAmount;
            const showMobileUpdates = showUpdatesOrderId === order.id;

            return (
              <article
                className={isExpanded ? "store-card order-card is-expanded" : "store-card order-card"}
                key={order.id}
              >
                <button
                  className="order-card__summary"
                  type="button"
                  onClick={() => toggleExpanded(order.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="order-card__media">
                    {primaryItem ? (
                      <img src={primaryItem.image} alt={primaryItem.productName} />
                    ) : (
                      <div className="order-card__image-fallback" aria-hidden="true" />
                    )}
                  </div>

                  <div className="order-card__summary-copy">
                    <div className="order-card__headline-row">
                      <div className="order-card__headline-copy">
                        <h2>{headline}</h2>
                        <p>{subheadline}</p>
                      </div>
                      <span className="order-card__chevron" aria-hidden="true" />
                    </div>

                    <div className="order-card__badge-row">
                      <span className={`order-card__badge order-card__badge--${badgeTone}`}>{badgeLabel}</span>
                      <span className="order-card__badge-copy">
                        {primaryItem ? `${order.items.length} item${order.items.length > 1 ? "s" : ""}` : "Order details"}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="order-card__action-strip">
                  <span className="order-card__status-copy">Status: {getStatusLabel(statusValue)}</span>

                  {returnRequest ? (
                    <div className="order-card__refund-row order-card__refund-row--success">
                      <span className="order-card__refund-icon" aria-hidden="true">
                        {returnRequest.requestType === "REPLACEMENT" ? "↻" : "✓"}
                      </span>
                      <span>
                        {isReturnComplete(returnRequest)
                          ? returnRequest.requestType === "REPLACEMENT"
                            ? "Replacement delivered"
                            : `Refund of ${formatCurrency(refundAmount)}`
                          : getReturnStatusCopy(returnRequest)}
                      </span>
                    </div>
                  ) : order.status !== "DELIVERED" ? null : (
                    <div className="order-card__post-delivery-actions">
                      <button
                        className="button button--light order-card__post-delivery-button"
                        type="button"
                        onClick={() => openReturnForm(order.id, "RETURN")}
                      >
                        Return
                      </button>
                      <button
                        className="link-button order-card__post-delivery-button"
                        type="button"
                        onClick={() => openReturnForm(order.id, "REPLACEMENT")}
                      >
                        Replacement
                      </button>
                      <button
                        className="link-button order-card__post-delivery-button"
                        type="button"
                        onClick={() => void handleReorder(order.id)}
                      >
                        Reorder
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded ? (
                  <div className="order-card__details">
                    <div className="order-card__mobile-panel">
                      <div className="order-card__mobile-panel-header">
                        <div className="order-card__mobile-panel-top">
                          <div className="order-card__mobile-media">
                            {primaryItem ? (
                              <img src={primaryItem.image} alt={primaryItem.productName} />
                            ) : (
                              <div className="order-card__image-fallback" aria-hidden="true" />
                            )}
                          </div>

                          <div className="order-card__mobile-copy">
                            <h3>{subheadline}</h3>
                            <p>{primaryItem ? primaryItem.productName : `Order ${order.orderNumber.slice(0, 8)}`}</p>
                            <span>Order #{order.orderNumber}</span>
                          </div>
                        </div>

                      </div>

                      <div className="order-card__mobile-status-card">
                        <div className="order-card__mobile-status-head">
                          <h4>
                            {returnRequest ? getStatusLabel(returnRequest.status) : getStatusLabel(order.status)}
                          </h4>
                          <p>
                            {returnRequest
                              ? getReturnStatusCopy(returnRequest)
                              : getStatusNote(order.status)}
                          </p>
                        </div>
                        <div className="order-card__mobile-status-meta">
                          <span>Order #{order.orderNumber}</span>
                          <span>{formatCurrency(returnRequest?.orderTotal ?? order.totalAmount)}</span>
                        </div>
                        {order.status === "DELIVERED" && !returnRequest ? (
                          <div className="order-card__mobile-post-actions">
                            <button
                              className="button button--light order-card__mobile-return-button"
                              type="button"
                              onClick={() => openReturnForm(order.id, "RETURN")}
                            >
                              Return
                            </button>
                            <button
                              className="link-button order-card__mobile-return-button"
                              type="button"
                              onClick={() => openReturnForm(order.id, "REPLACEMENT")}
                            >
                              Replacement
                            </button>
                            <button
                              className="link-button order-card__mobile-return-button"
                              type="button"
                              onClick={() => void handleReorder(order.id)}
                            >
                              Reorder
                            </button>
                          </div>
                        ) : null}
                        <button
                          className="order-card__status-toggle"
                          type="button"
                          onClick={() =>
                            setShowUpdatesOrderId((current) => (current === order.id ? null : order.id))
                          }
                        >
                          {showMobileUpdates ? "Hide updates" : "Check status"}
                        </button>
                        {showMobileUpdates ? (
                          <div className="order-card__mobile-updates">
                            {renderMobileStatusBar(order, returnRequest)}
                          </div>
                        ) : null}
                      </div>
                    </div>

                      <div className="order-card__details-header">
                        <div>
                          <span className="eyebrow">Order details</span>
                          <h3>Order #{order.orderNumber.slice(0, 8)}</h3>
                        </div>
                      <div className="order-card__details-actions">
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => toggleExpanded(order.id)}
                        >
                          Close order
                        </button>
                      </div>
                    </div>

                    <div className="order-card__timeline-desktop">{renderTimeline(order, returnRequest)}</div>

                    <div className="order-card__detail-grid">
                      <div>
                        <span>Placed on</span>
                        <strong>{formatLongDate(order.createdAt)}</strong>
                      </div>
                      <div>
                        <span>Delivery mode</span>
                        <strong>{order.deliveryMode === "STORE_PICKUP" ? "Store pickup" : "Home delivery"}</strong>
                      </div>
                      <div>
                        <span>Delivery slot</span>
                        <strong>{order.deliverySlot || "Standard slot"}</strong>
                      </div>
                      <div>
                        <span>Order status</span>
                        <strong>{getStatusLabel(order.status)}</strong>
                      </div>
                      <div>
                        <span>Payment total</span>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </div>
                      <div>
                        <span>Wallet debit</span>
                        <strong>{formatCurrency(order.walletDebitAmount ?? 0)}</strong>
                      </div>
                    </div>

                    <div className="order-card__detail-grid order-card__detail-grid--contact">
                      <div>
                        <span>Name</span>
                        <strong>{order.shippingName}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{order.email}</strong>
                      </div>
                      <div>
                        <span>Phone</span>
                        <strong>{order.phone}</strong>
                      </div>
                      <div>
                        <span>Address</span>
                        <strong>{order.shippingAddress}</strong>
                      </div>
                      <div>
                        <span>City</span>
                        <strong>{order.city}</strong>
                      </div>
                      <div>
                        <span>Postal code</span>
                        <strong>{order.postalCode}</strong>
                      </div>
                    </div>

                    <div className="order-card__items">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productSlug}`} className="order-card__item">
                          <img src={item.image} alt={item.productName} />
                          <div className="order-card__item-content">
                            <strong>{item.productName}</strong>
                            <span className="order-card__item-meta">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="order-card__item-meta">
                              Line total: {formatCurrency(item.quantity * item.unitPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {returnRequest ? (
                      <div className="order-card__return-note">
                        <strong>{getReturnStatusCopy(returnRequest)}</strong>
                        <span>
                          Requested on {formatLongDate(returnRequest.createdAt)}
                          {returnRequest.requestType === "RETURN" && returnRequest.refundedAt
                            ? ` · Refunded on ${formatLongDate(returnRequest.refundedAt)}`
                            : ""}
                        </span>
                        <span>Type: {getStatusLabel(returnRequest.requestType)}</span>
                        <span>
                          Resolution: {getStatusLabel(returnRequest.preferredResolution)}
                        </span>
                        {returnRequest.adminNote ? <p>{returnRequest.adminNote}</p> : null}
                      </div>
                    ) : null}

                    {!returnRequest && order.status === "DELIVERED" ? (
                      <div className="order-card__footer-hint">
                        <span>Returns open only after delivery.</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {activeReturnOrder ? (
        <div
          className="order-card__modal-overlay"
          role="presentation"
          onClick={closeReturnModal}
        >
          <div
            className="order-card__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-request-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-card__modal-header">
              <div>
                <span className="eyebrow">
                  {activeReturnType === "REPLACEMENT" ? "Replacement request" : "Return request"}
                </span>
                <h2 id="return-request-modal-title">
                  {activeReturnType === "REPLACEMENT"
                    ? "Request a replacement"
                    : "Request a return"}
                </h2>
              </div>
              <button className="order-card__modal-close" type="button" onClick={closeReturnModal}>
                ×
              </button>
            </div>

            <p className="order-card__modal-copy">
              Order #{activeReturnOrder.orderNumber.slice(0, 8)} from {formatLongDate(activeReturnOrder.createdAt)}
            </p>

            <div className="order-card__return-form order-card__return-form--modal">
              <div className="order-card__return-type-copy">
                {activeReturnType === "REPLACEMENT"
                  ? "You are requesting a replacement for this delivered order."
                  : "You are requesting a return for this delivered order."}
              </div>
              <label>
                Return reason
                <input
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  placeholder="Damaged item, wrong item, quality issue..."
                />
              </label>
              <label>
                Preferred resolution
                <select
                  value={returnResolution}
                  onChange={(event) => setReturnResolution(event.target.value as ReturnResolution)}
                  disabled={activeReturnType === "REPLACEMENT"}
                >
                  {activeReturnType === "REPLACEMENT" ? (
                    <option value="REPLACEMENT">Replacement</option>
                  ) : (
                    <>
                      <option value="WALLET_CREDIT">Wallet credit</option>
                      <option value="MANUAL_REFUND">Manual refund</option>
                    </>
                  )}
                </select>
              </label>
              <label>
                Description
                <textarea
                  rows={4}
                  value={returnDescription}
                  onChange={(event) => setReturnDescription(event.target.value)}
                  placeholder="Share what happened after delivery and any item condition notes."
                />
              </label>
              <div className="order-card__return-actions">
                <button
                  className="button"
                  type="button"
                  disabled={submittingReturn}
                  onClick={() => void handleReturnSubmit(activeReturnOrder.id)}
                >
                  {submittingReturn
                    ? "Submitting..."
                    : activeReturnType === "REPLACEMENT"
                      ? "Submit replacement request"
                      : "Submit return request"}
                </button>
                <button className="link-button" type="button" onClick={closeReturnModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default OrdersPage;
