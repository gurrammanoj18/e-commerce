import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminBrandLogo,
  deleteAdminBrandLogo,
  fetchAdminBrandLogos,
  updateAdminBrandLogo,
} from "../services/adminService";
import { BrandLogo, BrandLogoPayload } from "../types/store";
import { optimizeImageFile } from "../utils/imageUpload";
import { resolveMediaUrl } from "../utils/mediaUrl";
import "../styles/pages/AdminDashboardPage.css";

const emptyLogo: BrandLogoPayload = {
  brandName: "",
  logoUrl: "",
  displayOrder: 10,
  active: true,
};

const AdminBrandLogosPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logos, setLogos] = useState<BrandLogo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<BrandLogoPayload>(emptyLogo);
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
      toast.error("You do not have permission to manage brand logos.");
      return;
    }

    const responseMessage =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
    toast.error(responseMessage || fallback);
  }, [location, logout, navigate]);

  const loadLogos = useCallback(async () => {
    try {
      setLogos(await fetchAdminBrandLogos());
    } catch (error) {
      handleAdminRequestError(error, "Unable to load brand logos right now.");
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadLogos();
  }, [loadLogos]);

  const resetForm = () => {
    setEditingId(null);
    setFormState(emptyLogo);
  };

  const saveLogo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.logoUrl.trim()) {
      toast.error("Please add a logo image before saving.");
      return;
    }

    setUploading(true);
    try {
      const payload = {
        ...formState,
        brandName: formState.brandName.trim(),
        logoUrl: formState.logoUrl.trim(),
        displayOrder: Number(formState.displayOrder) || 0,
      };

      if (editingId) {
        await updateAdminBrandLogo(editingId, payload);
        toast.success("Brand logo updated");
      } else {
        await createAdminBrandLogo(payload);
        toast.success("Brand logo created");
      }

      resetForm();
      await loadLogos();
    } catch (error) {
      handleAdminRequestError(error, "Unable to save brand logo right now.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Brand logos</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Brand form</span>
            <h2>{editingId ? "Edit brand logo" : "Upload brand logo"}</h2>
          </div>
          {editingId ? (
            <button className="link-button" type="button" onClick={resetForm}>
              Reset form
            </button>
          ) : null}
        </div>

        <form className="form-grid" onSubmit={saveLogo}>
          <label>
            Brand name
            <input
              value={formState.brandName}
              onChange={(event) => setFormState((current) => ({ ...current, brandName: event.target.value }))}
              placeholder="Anchor"
              required
            />
          </label>
          <label>
            Display order
            <input
              type="number"
              value={formState.displayOrder}
              onChange={(event) => setFormState((current) => ({ ...current, displayOrder: Number(event.target.value) }))}
              required
            />
          </label>
          <label className="form-grid__wide">
            Logo image
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
                  setFormState((current) => ({ ...current, logoUrl: imageUrl }));
                } catch {
                  toast.error("Unable to prepare selected brand logo.");
                } finally {
                  setUploading(false);
                  event.target.value = "";
                }
              }}
            />
            <span className="admin-field-hint">
              Upload a logo from your device, or paste a logo URL below.
            </span>
            <input
              value={formState.logoUrl}
              onChange={(event) => setFormState((current) => ({ ...current, logoUrl: event.target.value }))}
              placeholder="/brand-logos/anchor-p.jpg"
            />
            {formState.logoUrl ? (
              <div className="admin-brand-logo-preview">
                <img src={resolveMediaUrl(formState.logoUrl)} alt="Brand logo preview" />
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setFormState((current) => ({ ...current, logoUrl: "" }))}
                >
                  Remove logo
                </button>
              </div>
            ) : null}
          </label>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(event) => setFormState((current) => ({ ...current, active: event.target.checked }))}
            />
            <span>Active on homepage</span>
          </label>
          <div className="admin-form-actions">
            <button className="button" type="submit" disabled={uploading}>
              {editingId ? "Update logo" : "Create logo"}
            </button>
          </div>
        </form>
      </section>

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Logo list</span>
            <h2>Homepage brand logos</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Brand</th>
                <th>Logo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logos.map((logo) => (
                <tr key={logo.id}>
                  <td>{logo.displayOrder}</td>
                  <td><strong>{logo.brandName}</strong></td>
                  <td>
                    {logo.logoUrl ? (
                      <img
                        src={resolveMediaUrl(logo.logoUrl)}
                        alt={`${logo.brandName} logo`}
                        style={{ width: 120, height: 52, objectFit: "contain", background: "#fff", borderRadius: 10 }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>
                  <td>
                    <span className={`admin-status-pill ${logo.active ? "is-success" : "is-warning"}`}>
                      {logo.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => {
                          setEditingId(logo.id);
                          setFormState({
                            brandName: logo.brandName,
                            logoUrl: logo.logoUrl,
                            displayOrder: logo.displayOrder,
                            active: logo.active,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="link-button admin-danger-button"
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${logo.brandName}?`)) {
                            return;
                          }
                          try {
                            await deleteAdminBrandLogo(logo.id);
                            toast.success("Brand logo deleted");
                            await loadLogos();
                          } catch (error) {
                            handleAdminRequestError(error, "Unable to delete brand logo right now.");
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

export default AdminBrandLogosPage;
