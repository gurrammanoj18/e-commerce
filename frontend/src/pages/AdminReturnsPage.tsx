import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import { fetchAdminReturnRequests, updateAdminReturnRequest } from "../services/returnService";
import { ReturnRequest, ReturnRequestStatus, ReturnRequestType } from "../types/store";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const formatRequestType = (value: string) => (value === "REPLACEMENT" ? "Replacement" : "Return");
const formatStatus = (value: string) => value.replace(/_/g, " ");
const getStatusLabel = (value: string) => {
  const labels: Record<string, string> = {
    REQUESTED: "Requested",
    UNDER_REVIEW: "Under review",
    CONFIRMED: "Confirmed",
    APPROVED: "Approved",
    READY_TO_PICKUP: "Return pickup",
    PICKUP_SCHEDULED: "Scheduled",
    PICKED_UP: "Returned",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    REFUNDED: "Refunded",
    REJECTED: "Rejected",
    CLOSED: "Closed",
  };

  return labels[value] || formatStatus(value);
};

const TYPE_FILTERS: Array<"ALL" | ReturnRequestType> = ["ALL", "RETURN", "REPLACEMENT"];

const getStatusOptionsForType = (type: ReturnRequestType) =>
  type === "REPLACEMENT"
    ? [
        "UNDER_REVIEW",
        "READY_TO_PICKUP",
        "PICKUP_SCHEDULED",
        "SHIPPED",
        "DELIVERED",
        "REJECTED",
      ]
    : [
        "CONFIRMED",
        "READY_TO_PICKUP",
        "PICKUP_SCHEDULED",
        "PICKED_UP",
        "REFUNDED",
      ];

const AdminReturnsPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<number, ReturnRequestStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [activeTypeFilter, setActiveTypeFilter] = useState<"ALL" | ReturnRequestType>("ALL");

  const handleAdminRequestError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      toast.error("Your admin session has expired or no longer has access. Please log in again.");
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    const message =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string } | undefined)?.message || fallback
        : error instanceof Error && error.message.trim()
        ? error.message
        : fallback;
    toast.error(message);
  }, [location, logout, navigate]);

  const loadData = useCallback(async () => {
    try {
      const response = await fetchAdminReturnRequests();
      setReturnRequests(response);
      setStatusDrafts(
        Object.fromEntries(response.map((request) => [request.id, request.status])),
      );
      setNoteDrafts(
        Object.fromEntries(response.map((request) => [request.id, request.adminNote || ""])),
      );
    } catch (error) {
      handleAdminRequestError(error, "Unable to load return requests.");
    } finally {
      setLoading(false);
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRequests =
    activeTypeFilter === "ALL"
      ? returnRequests
      : returnRequests.filter((request) => request.requestType === activeTypeFilter);

  const handleSave = async (requestId: number) => {
    const selectedRequest = returnRequests.find((request) => request.id === requestId);
    if (
      selectedRequest &&
      statusDrafts[requestId] === "REFUNDED" &&
      !selectedRequest.refundProcessed
    ) {
      const confirmed = window.confirm(
        `Mark order ${selectedRequest.orderNumber.slice(0, 8)} as refunded? This will complete the requested ${formatRequestType(selectedRequest.requestType).toLowerCase()} action.`,
      );
      if (!confirmed) {
        return;
      }
    }

    setSavingId(requestId);
    try {
      const updated = await updateAdminReturnRequest(requestId, {
        status: statusDrafts[requestId],
        adminNote: noteDrafts[requestId],
      });
      setReturnRequests((current) =>
        current.map((request) => (request.id === requestId ? updated : request)),
      );
      toast.success("Return request updated.");
    } catch (error) {
      handleAdminRequestError(error, "Unable to update the return request.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Return management</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      {loading ? (
        <div className="store-card empty-state">
          <h3>Loading return requests...</h3>
        </div>
      ) : (
        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Post-delivery operations</span>
              <h2>Return and replacement requests</h2>
            </div>
          </div>

          <div className="admin-returns__filters">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeTypeFilter === filter ? "button button--light" : "link-button"}
                onClick={() => setActiveTypeFilter(filter)}
              >
                {filter === "ALL" ? "All" : formatRequestType(filter)}
              </button>
            ))}
          </div>

          {filteredRequests.length ? (
            <div className="admin-returns__cards">
              {filteredRequests.map((request) => {
                const statusOptions = getStatusOptionsForType(request.requestType);

                return (
                  <article key={request.id} className="admin-returns__card">
                    <div className="admin-returns__card-header">
                      <div>
                        <span className="eyebrow">{formatRequestType(request.requestType)}</span>
                        <h3>Order #{request.orderNumber.slice(0, 8)}</h3>
                      </div>
                      <div className="admin-returns__card-badges">
                        <span className="order-card__badge order-card__badge--info">
                          {getStatusLabel(request.status)}
                        </span>
                        <span className="order-card__badge order-card__badge--neutral">
                          {request.initiatedByAdmin ? "Created by admin" : "Customer request"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-returns__detail-grid">
                      <div>
                        <span>Customer</span>
                        <strong>{request.customerName}</strong>
                        <p>
                          {request.phoneNumber}
                          <br />
                          {request.city}, {request.postalCode}
                        </p>
                      </div>
                      <div>
                        <span>Address</span>
                        <strong>{request.shippingAddress}</strong>
                      </div>
                      <div>
                        <span>Order status</span>
                        <strong>{request.orderStatus}</strong>
                        <p>Total: {formatCurrency(request.orderTotal)}</p>
                      </div>
                      <div>
                        <span>Request details</span>
                        <strong>{request.reason}</strong>
                        <p>{request.description}</p>
                      </div>
                    </div>

                    <div className="admin-returns__controls">
                      <label>
                        Status
                        <select
                          value={statusDrafts[request.id] || request.status}
                          onChange={(event) =>
                            setStatusDrafts((current) => ({
                              ...current,
                              [request.id]: event.target.value as ReturnRequestStatus,
                            }))
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {getStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-returns__note-field">
                        Admin note
                        <textarea
                          rows={3}
                          value={noteDrafts[request.id] ?? ""}
                          onChange={(event) =>
                            setNoteDrafts((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                          placeholder="Pickup date, shipping label, wallet credit, replacement note..."
                        />
                      </label>
                      <button
                        className="button"
                        type="button"
                        disabled={savingId === request.id}
                        onClick={() => void handleSave(request.id)}
                      >
                        {savingId === request.id ? "Saving..." : "Save"}
                      </button>
                    </div>

                    {request.refundProcessed ? (
                      <div className="admin-empty-note">
                        Refund completed
                        {request.refundedAt ? ` on ${formatDateTime(request.refundedAt)}` : ""}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty-note">No return requests match the selected filter.</div>
          )}
        </section>
      )}
    </section>
  );
};

export default AdminReturnsPage;
