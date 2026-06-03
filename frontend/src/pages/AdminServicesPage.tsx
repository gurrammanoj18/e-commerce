import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminServiceablePincode,
  deleteAdminServiceablePincode,
  fetchAdminServiceablePincodes,
  fetchAdminServiceRequests,
  updateAdminServiceablePincode,
} from "../services/adminService";
import {
  ServiceRequest,
  ServiceablePincode,
  ServiceablePincodePayload,
} from "../types/store";
import { useProcessing } from "../contexts/ProcessingContext";

const emptyPincode: ServiceablePincodePayload = {
  pincode: "",
  label: "",
  active: true,
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
};

const AdminServicesPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { startProcessing, stopProcessing } = useProcessing();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [serviceablePincodes, setServiceablePincodes] = useState<ServiceablePincode[]>([]);
  const [editingPincodeId, setEditingPincodeId] = useState<number | null>(null);
  const [pincodeForm, setPincodeForm] = useState<ServiceablePincodePayload>(emptyPincode);
  const [savingPincode, setSavingPincode] = useState(false);

  const handleAdminRequestError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      toast.error("Your admin session has expired. Please log in again.");
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error("You do not have permission to manage services.");
      return;
    }

    toast.error(extractErrorMessage(error, fallback));
  }, [location, logout, navigate]);

  const loadData = useCallback(async () => {
    const processingId = startProcessing({
      title: "Loading services",
      message: "Fetching serviceable pincodes and customer requests...",
    });
    const [pincodeResult, requestResult] = await Promise.allSettled([
      fetchAdminServiceablePincodes(),
      fetchAdminServiceRequests(),
    ]);

    if (pincodeResult.status === "fulfilled") {
      setServiceablePincodes(pincodeResult.value);
    } else {
      handleAdminRequestError(pincodeResult.reason, "Unable to load serviceable pincodes.");
    }

    if (requestResult.status === "fulfilled") {
      setServiceRequests(requestResult.value);
    } else {
      handleAdminRequestError(requestResult.reason, "Unable to load service requests.");
    }
    stopProcessing(processingId);
  }, [handleAdminRequestError, startProcessing, stopProcessing]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Services management</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <div className="admin-orders-layout">
        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Pincode service</span>
              <h2>{editingPincodeId ? "Edit serviceable pincode" : "Add serviceable pincode"}</h2>
            </div>
          </div>
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              const processingId = startProcessing({
                title: editingPincodeId ? "Updating pincode" : "Adding pincode",
                message: "Saving service coverage and refreshing the list...",
              });
              setSavingPincode(true);
              try {
                const payload = {
                  ...pincodeForm,
                  pincode: pincodeForm.pincode.replace(/\D/g, "").slice(0, 6),
                };
                if (editingPincodeId) {
                  await updateAdminServiceablePincode(editingPincodeId, payload);
                  toast.success("Pincode updated.");
                } else {
                  await createAdminServiceablePincode(payload);
                  toast.success("Pincode added.");
                }
                setPincodeForm(emptyPincode);
                setEditingPincodeId(null);
                await loadData();
              } catch (error) {
                handleAdminRequestError(error, "Unable to save pincode.");
              } finally {
                setSavingPincode(false);
                stopProcessing(processingId);
              }
            }}
          >
            <label>
              Pincode
              <input
                value={pincodeForm.pincode}
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  setPincodeForm((current) => ({
                    ...current,
                    pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                  }))
                }
                required
              />
            </label>
            <label>
              Label
              <input
                value={pincodeForm.label || ""}
                onChange={(event) =>
                  setPincodeForm((current) => ({ ...current, label: event.target.value }))
                }
                placeholder="Hyderabad main service area"
              />
            </label>
            <label className="checkout-inline-check">
              <input
                type="checkbox"
                checked={pincodeForm.active}
                onChange={(event) =>
                  setPincodeForm((current) => ({ ...current, active: event.target.checked }))
                }
              />
              <span>Pincode is active</span>
            </label>
            <div className="admin-form-actions">
              <button className="button" type="submit" disabled={savingPincode}>
                {savingPincode ? (
                  <span className="button-loading">
                    <span className="button-loading__spinner" aria-hidden="true" />
                    Saving...
                  </span>
                ) : editingPincodeId ? (
                  "Update pincode"
                ) : (
                  "Add pincode"
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Home delivery coverage</span>
              <h2>Serviceable pincodes</h2>
            </div>
          </div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Pincode</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceablePincodes.map((pincode) => (
                  <tr key={pincode.id}>
                    <td>{pincode.pincode}</td>
                    <td>{pincode.label || "Service area"}</td>
                    <td>{pincode.active ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => {
                            setEditingPincodeId(pincode.id);
                            setPincodeForm({
                              pincode: pincode.pincode,
                              label: pincode.label || "",
                              active: pincode.active,
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="link-button admin-danger-button"
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteAdminServiceablePincode(pincode.id);
                              toast.success("Pincode deleted.");
                              if (editingPincodeId === pincode.id) {
                                setEditingPincodeId(null);
                                setPincodeForm(emptyPincode);
                              }
                              await loadData();
                            } catch (error) {
                              handleAdminRequestError(error, "Unable to delete pincode.");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!serviceablePincodes.length ? (
                  <tr>
                    <td colSpan={4}>No serviceable pincodes added yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="store-card admin-panel admin-panel--full" style={{ marginTop: 24 }}>
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Service requests</span>
            <h2>Customer service bookings</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Problem</th>
              </tr>
            </thead>
            <tbody>
              {serviceRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.serviceName}</td>
                  <td>{request.customerName}</td>
                  <td>{request.phoneNumber}</td>
                  <td>
                    {request.address}
                    <div>{request.postalCode}</div>
                  </td>
                  <td>
                    {request.description}
                    {request.problemImages.length ? (
                      <div className="admin-image-preview-grid" style={{ marginTop: 12 }}>
                        {request.problemImages.map((image, index) => (
                          <div key={`${request.id}-${index}`} className="admin-image-preview-card">
                            <img src={image} alt={`${request.serviceName} ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
};

export default AdminServicesPage;
