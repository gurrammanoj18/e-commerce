import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  updateAdminBanner,
} from "../services/adminService";
import { Banner, BannerPayload } from "../types/store";
import { optimizeImageFile } from "../utils/imageUpload";
import "../styles/pages/AdminDashboardPage.css";

const emptyBanner: BannerPayload = {
  imageUrl: "",
};

const AdminBannersPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<BannerPayload>(emptyBanner);
  const [uploading, setUploading] = useState(false);

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
      toast.error("You do not have permission to manage banners.");
      return;
    }

    const responseMessage =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
    toast.error(responseMessage || fallback);
  }, [location, logout, navigate]);

  const loadBanners = useCallback(async () => {
    try {
      const response = await fetchAdminBanners();
      setBanners(response);
    } catch (error) {
      handleAdminRequestError(error, "Unable to load banners right now.");
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Banner management</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Banner form</span>
            <h2>{editingId ? "Edit banner image" : "Upload banner image"}</h2>
          </div>
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              if (editingId) {
                await updateAdminBanner(editingId, formState);
                toast.success("Banner image updated");
              } else {
                await createAdminBanner(formState);
                toast.success("Banner image created");
              }
              setEditingId(null);
              setFormState(emptyBanner);
              await loadBanners();
            } catch (error) {
              handleAdminRequestError(error, "Unable to save banner right now.");
            }
          }}
        >
          <label className="form-grid__wide">
            Banner image
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }
                setUploading(true);
                try {
                  const imageUrl = await optimizeImageFile(file);
                  setFormState((current) => ({ ...current, imageUrl }));
                } catch {
                  toast.error("Unable to prepare selected banner image.");
                } finally {
                  setUploading(false);
                  event.target.value = "";
                }
              }}
              required={!formState.imageUrl}
            />
          </label>
          {formState.imageUrl ? (
            <div className="form-grid__wide admin-image-preview-grid">
              <div className="admin-image-preview-card">
                <img src={formState.imageUrl} alt="Banner preview" />
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setFormState((current) => ({ ...current, imageUrl: "" }))}
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : null}
          <div className="admin-form-actions">
            <button className="button" type="submit" disabled={uploading}>
              {editingId ? "Update image" : "Create image"}
            </button>
          </div>
        </form>
      </section>

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Banner list</span>
            <h2>Homepage banners</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={`Banner ${banner.id}`}
                        style={{ width: "100%", maxWidth: 420, borderRadius: 18, display: "block" }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => {
                          setEditingId(banner.id);
                          setFormState({
                            imageUrl: banner.imageUrl || "",
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
                            await deleteAdminBanner(banner.id);
                            setBanners((current) => current.filter((item) => item.id !== banner.id));
                            if (editingId === banner.id) {
                              setEditingId(null);
                              setFormState(emptyBanner);
                            }
                            toast.success("Banner image deleted");
                            await loadBanners();
                          } catch (error) {
                            handleAdminRequestError(error, "Unable to delete banner right now.");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
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

export default AdminBannersPage;
