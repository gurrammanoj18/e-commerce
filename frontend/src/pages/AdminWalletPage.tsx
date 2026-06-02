import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminWalletCoupon,
  deleteAdminWalletCoupon,
  fetchAdminWalletCoupons,
  fetchAdminWalletCouponRedemptions,
  grantAdminWalletCouponRedemptions,
  updateAdminWalletCoupon,
} from "../services/adminService";
import { WalletCoupon, WalletCouponPayload, WalletCouponRedemption } from "../types/store";
import "../styles/pages/AdminDashboardPage.css";

const emptyCoupon: WalletCouponPayload = {
  code: "",
  type: "WALLET_TOPUP",
  amount: 0,
  discountPercentage: 0,
  description: "",
  assignedCustomerEmails: "",
  active: true,
  rewardDelayMinutes: 60,
  redemptionFrequency: "ONCE",
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
};

const AdminWalletPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [coupons, setCoupons] = useState<WalletCoupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [redemptions, setRedemptions] = useState<WalletCouponRedemption[]>([]);
  const [editingCouponId, setEditingCouponId] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState<WalletCouponPayload>(emptyCoupon);

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
      toast.error(extractErrorMessage(error, "You do not have permission to manage wallet coupons."));
      return;
    }

    toast.error(extractErrorMessage(error, fallback));
  }, [location, logout, navigate]);

  const loadData = useCallback(async () => {
    try {
      const walletCoupons = await fetchAdminWalletCoupons();
      setCoupons(walletCoupons);
      setSelectedCouponId((current) => current ?? walletCoupons[0]?.id ?? null);
    } catch (error) {
      handleAdminRequestError(error, "Unable to load wallet coupons.");
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selectedCouponId) {
      setRedemptions([]);
      return;
    }
    void fetchAdminWalletCouponRedemptions(selectedCouponId)
      .then(setRedemptions)
      .catch((error) => handleAdminRequestError(error, "Unable to load coupon redemption access."));
  }, [handleAdminRequestError, selectedCouponId]);

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Wallet management</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <div className="admin-orders-layout">
        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Wallet coupon form</span>
              <h2>{editingCouponId ? "Edit wallet coupon" : "Create wallet coupon"}</h2>
            </div>
          </div>
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                const payload: WalletCouponPayload =
                  couponForm.type === "ORDER_DISCOUNT"
                    ? {
                        ...couponForm,
                        amount: 0,
                        discountPercentage: couponForm.discountPercentage ?? 0,
                      }
                    : {
                        ...couponForm,
                        discountPercentage: 0,
                      };
                if (editingCouponId) {
                  await updateAdminWalletCoupon(editingCouponId, payload);
                  toast.success("Wallet coupon updated.");
                } else {
                  await createAdminWalletCoupon(payload);
                  toast.success("Wallet coupon created.");
                }
                setCouponForm(emptyCoupon);
                setEditingCouponId(null);
                await loadData();
              } catch (error) {
                handleAdminRequestError(error, "Unable to save wallet coupon.");
              }
            }}
          >
            <label>
              Coupon code
              <input
                value={couponForm.code}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                }
                required
              />
            </label>
            <label>
              Type
                <select
                  value={couponForm.type}
                  onChange={(event) =>
                    setCouponForm((current) => ({
                      ...current,
                      type: event.target.value as WalletCouponPayload["type"],
                      amount: event.target.value === "ORDER_DISCOUNT" ? 0 : current.amount,
                      discountPercentage:
                        event.target.value === "ORDER_DISCOUNT" ? current.discountPercentage ?? 0 : 0,
                    }))
                  }
                >
                <option value="WALLET_TOPUP">Wallet top-up code</option>
                <option value="ORDER_CASHBACK">Checkout cashback code</option>
                <option value="ORDER_DISCOUNT">Instant discount code</option>
              </select>
            </label>
            {couponForm.type === "ORDER_DISCOUNT" ? (
              <label>
                Discount percentage
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={couponForm.discountPercentage ?? 0}
                  onChange={(event) =>
                    setCouponForm((current) => ({
                      ...current,
                      discountPercentage: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
            ) : (
              <label>
                Amount
                <input
                  type="number"
                  min={0}
                  value={couponForm.amount}
                  onChange={(event) =>
                    setCouponForm((current) => ({ ...current, amount: Number(event.target.value) }))
                  }
                  required
                />
              </label>
            )}
            <label>
              Reward delay in minutes
              <input
                type="number"
                min={0}
                value={couponForm.rewardDelayMinutes}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    rewardDelayMinutes: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Redeem frequency
              <select
                value={couponForm.redemptionFrequency}
                onChange={(event) =>
                  setCouponForm((current) => ({
                    ...current,
                    redemptionFrequency: event.target.value as WalletCouponPayload["redemptionFrequency"],
                  }))
                }
              >
                <option value="ONCE">Only once</option>
                <option value="WEEKLY">Once every week</option>
                <option value="MONTHLY">Once every month</option>
                <option value="YEARLY">Once every year</option>
              </select>
            </label>
            <label className="form-grid__wide">
              Description
              <textarea
                rows={3}
                value={couponForm.description}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <label className="form-grid__wide">
              Assigned customer emails optional
              <textarea
                rows={3}
                value={couponForm.assignedCustomerEmails || ""}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, assignedCustomerEmails: event.target.value }))
                }
                placeholder="Leave blank for all customers, or enter emails separated by commas/new lines."
              />
            </label>
            <label className="checkout-inline-check">
              <input
                type="checkbox"
                checked={couponForm.active}
                onChange={(event) =>
                  setCouponForm((current) => ({ ...current, active: event.target.checked }))
                }
              />
              <span>Coupon is active</span>
            </label>
            <div className="admin-form-actions">
              <button className="button" type="submit">
                {editingCouponId ? "Update coupon" : "Create coupon"}
              </button>
            </div>
          </form>
        </section>

        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Wallet coupons</span>
              <h2>Hidden codes</h2>
            </div>
          </div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>{coupon.code}</td>
                    <td>
                      {coupon.type === "ORDER_DISCOUNT"
                        ? "Instant discount"
                        : coupon.type === "ORDER_CASHBACK"
                          ? "Checkout cashback"
                          : "Wallet top-up"}
                    </td>
                    <td>
                      {coupon.type === "ORDER_DISCOUNT"
                        ? `${coupon.discountPercentage ?? 0}% off`
                        : coupon.amount}
                    </td>
                    <td>{coupon.redemptionFrequency}</td>
                    <td>{coupon.active ? "Active" : "Inactive"}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => {
                            setEditingCouponId(coupon.id);
                            setCouponForm({
                              code: coupon.code,
                              type: coupon.type,
                              amount: coupon.amount,
                              discountPercentage: coupon.discountPercentage ?? 0,
                              description: coupon.description || "",
                              assignedCustomerEmails: coupon.assignedCustomerEmails || "",
                              active: coupon.active,
                              rewardDelayMinutes: coupon.rewardDelayMinutes,
                              redemptionFrequency: coupon.redemptionFrequency || "ONCE",
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
                              await deleteAdminWalletCoupon(coupon.id);
                              toast.success("Coupon deleted.");
                              if (selectedCouponId === coupon.id) {
                                setSelectedCouponId(null);
                              }
                              await loadData();
                            } catch (error) {
                              handleAdminRequestError(error, "Unable to delete wallet coupon.");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!coupons.length ? (
                  <tr>
                    <td colSpan={6}>No wallet coupons created yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Redeem access</span>
              <h2>Allow selected users to redeem again</h2>
            </div>
          </div>
          <div className="form-grid">
            <label>
              Coupon
              <select
                value={selectedCouponId ?? ""}
                onChange={(event) => setSelectedCouponId(Number(event.target.value) || null)}
              >
                <option value="">Select coupon</option>
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} - {coupon.type === "ORDER_DISCOUNT" ? `${coupon.discountPercentage ?? 0}% off` : coupon.type}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Redeemed</th>
                  <th>Allowed</th>
                  <th>Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.userName}</td>
                    <td>{entry.userEmail}</td>
                    <td>{entry.redeemedCount}</td>
                    <td>{entry.allowedRedemptions}</td>
                    <td>{entry.remainingRedemptions}</td>
                    <td>
                      <button
                        className="link-button"
                        type="button"
                        onClick={async () => {
                          if (!selectedCouponId) {
                            return;
                          }
                          try {
                            await grantAdminWalletCouponRedemptions(selectedCouponId, {
                              userId: entry.userId,
                              additionalRedemptions: 1,
                            });
                            toast.success("One more redeem granted.");
                            const refreshed = await fetchAdminWalletCouponRedemptions(selectedCouponId);
                            setRedemptions(refreshed);
                          } catch (error) {
                            handleAdminRequestError(error, "Unable to update coupon redeem access.");
                          }
                        }}
                      >
                        Allow 1 more
                      </button>
                    </td>
                  </tr>
                ))}
                {!redemptions.length ? (
                  <tr>
                    <td colSpan={6}>No user has redeemed the selected coupon yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AdminWalletPage;
