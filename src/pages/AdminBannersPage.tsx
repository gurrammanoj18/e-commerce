import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import {
  createAdminBanner,
  deleteAdminBanner,
  fetchAdminBanners,
  updateAdminBanner,
} from "../services/adminService";
import { Banner } from "../types/store";
import "../styles/pages/AdminDashboardPage.css";

const emptyBanner = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  displayOrder: 1,
  active: true,
};

const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState(emptyBanner);

  const loadBanners = async () => {
    const response = await fetchAdminBanners();
    setBanners(response);
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Banner management</h1>
          <p>Control homepage banner copy, images, call-to-actions, and order.</p>
        </div>
      </div>
      <AdminWorkspaceNav />

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Banner form</span>
            <h2>{editingId ? "Edit banner" : "Create banner"}</h2>
          </div>
        </div>
        <form
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            if (editingId) {
              await updateAdminBanner(editingId, formState);
              toast.success("Banner updated");
            } else {
              await createAdminBanner(formState);
              toast.success("Banner created");
            }
            setEditingId(null);
            setFormState(emptyBanner);
            await loadBanners();
          }}
        >
          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              required
            />
          </label>
          <label>
            Display order
            <input
              type="number"
              min={1}
              value={formState.displayOrder}
              onChange={(event) =>
                setFormState((current) => ({ ...current, displayOrder: Number(event.target.value) }))
              }
            />
          </label>
          <label className="form-grid__wide">
            Subtitle
            <textarea
              rows={3}
              value={formState.subtitle}
              onChange={(event) => setFormState((current) => ({ ...current, subtitle: event.target.value }))}
            />
          </label>
          <label className="form-grid__wide">
            Image URL
            <input
              value={formState.imageUrl}
              onChange={(event) => setFormState((current) => ({ ...current, imageUrl: event.target.value }))}
              required
            />
          </label>
          <label>
            CTA label
            <input
              value={formState.ctaLabel}
              onChange={(event) => setFormState((current) => ({ ...current, ctaLabel: event.target.value }))}
            />
          </label>
          <label>
            CTA link
            <input
              value={formState.ctaHref}
              onChange={(event) => setFormState((current) => ({ ...current, ctaHref: event.target.value }))}
            />
          </label>
          <label className="checkout-inline-check">
            <input
              type="checkbox"
              checked={formState.active}
              onChange={(event) => setFormState((current) => ({ ...current, active: event.target.checked }))}
            />
            <span>Banner is active</span>
          </label>
          <div className="admin-form-actions">
            <button className="button" type="submit">
              {editingId ? "Update banner" : "Create banner"}
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
                <th>Banner</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <strong>{banner.title}</strong>
                    <div>{banner.subtitle}</div>
                  </td>
                  <td>{banner.displayOrder}</td>
                  <td>{banner.active ? "Active" : "Hidden"}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => {
                          setEditingId(banner.id);
                          setFormState({
                            title: banner.title,
                            subtitle: banner.subtitle || "",
                            imageUrl: banner.imageUrl,
                            ctaLabel: banner.ctaLabel || "",
                            ctaHref: banner.ctaHref || "",
                            displayOrder: banner.displayOrder,
                            active: banner.active,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="link-button admin-danger-button"
                        type="button"
                        onClick={async () => {
                          await deleteAdminBanner(banner.id);
                          toast.success("Banner deleted");
                          await loadBanners();
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
