import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminHomepageSection,
  deleteAdminHomepageSection,
  fetchAdminHomepageSections,
  updateAdminHomepageSection,
} from "../services/adminService";
import { HomepageSection, HomepageSectionPayload, HomepageSectionType } from "../types/store";
import "../styles/pages/AdminDashboardPage.css";

const emptySection: HomepageSectionPayload = {
  sectionKey: "",
  eyebrow: "",
  title: "",
  type: "KEYWORDS",
  keywords: "",
  displayOrder: 10,
  maxProducts: 8,
  active: true,
};

const sectionTypeOptions: { value: HomepageSectionType; label: string }[] = [
  { value: "KEYWORDS", label: "Keyword matched products" },
  { value: "BEST_SELLERS", label: "Best selling products" },
  { value: "RECENTLY_ADDED", label: "Recently added products" },
  { value: "FEATURED", label: "Featured products" },
];

const AdminHomepageSectionsPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<HomepageSectionPayload>(emptySection);
  const [saving, setSaving] = useState(false);

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
      toast.error("You do not have permission to manage homepage sections.");
      return;
    }

    const responseMessage =
      error instanceof AxiosError
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;
    toast.error(responseMessage || fallback);
  }, [location, logout, navigate]);

  const loadSections = useCallback(async () => {
    try {
      setSections(await fetchAdminHomepageSections());
    } catch (error) {
      handleAdminRequestError(error, "Unable to load homepage sections right now.");
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  const resetForm = () => {
    setEditingId(null);
    setFormState(emptySection);
  };

  const editSection = (section: HomepageSection) => {
    setEditingId(section.id);
    setFormState({
      sectionKey: section.sectionKey,
      eyebrow: section.eyebrow,
      title: section.title,
      type: section.type,
      keywords: section.keywords || "",
      displayOrder: section.displayOrder,
      maxProducts: section.maxProducts,
      active: section.active,
    });
  };

  const saveSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formState,
        keywords: formState.type === "KEYWORDS" ? formState.keywords : "",
        maxProducts: Math.max(1, Number(formState.maxProducts) || 8),
        displayOrder: Number(formState.displayOrder) || 0,
      };

      if (editingId) {
        await updateAdminHomepageSection(editingId, payload);
        toast.success("Homepage section updated");
      } else {
        await createAdminHomepageSection(payload);
        toast.success("Homepage section created");
      }

      resetForm();
      await loadSections();
    } catch (error) {
      handleAdminRequestError(error, "Unable to save homepage section right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Homepage sections</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Section form</span>
            <h2>{editingId ? "Edit homepage section" : "Create homepage section"}</h2>
          </div>
          {editingId ? (
            <button className="link-button" type="button" onClick={resetForm}>
              Reset form
            </button>
          ) : null}
        </div>
        <form className="form-grid" onSubmit={saveSection}>
          <label>
            Section key
            <input
              value={formState.sectionKey}
              onChange={(event) => setFormState((current) => ({ ...current, sectionKey: event.target.value }))}
              placeholder="hard-to-find"
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
          <label>
            Eyebrow
            <input
              value={formState.eyebrow}
              onChange={(event) => setFormState((current) => ({ ...current, eyebrow: event.target.value }))}
              placeholder="Hard-to-Find Products"
              required
            />
          </label>
          <label>
            Title
            <input
              value={formState.title}
              onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
              placeholder="Rare essentials that make VoltMart useful"
              required
            />
          </label>
          <label>
            Product source
            <select
              value={formState.type}
              onChange={(event) =>
                setFormState((current) => ({ ...current, type: event.target.value as HomepageSectionType }))
              }
              required
            >
              {sectionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Max products
            <input
              type="number"
              min="1"
              max="20"
              value={formState.maxProducts}
              onChange={(event) => setFormState((current) => ({ ...current, maxProducts: Number(event.target.value) }))}
              required
            />
          </label>
          <label className="form-grid__wide">
            Keywords
            <textarea
              rows={4}
              value={formState.keywords || ""}
              onChange={(event) => setFormState((current) => ({ ...current, keywords: event.target.value }))}
              placeholder="switch, wire, mcb, fastener"
              disabled={formState.type !== "KEYWORDS"}
            />
            <span className="admin-field-hint">
              Used only for keyword matched sections. Separate keywords with commas or new lines.
            </span>
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
            <button className="button" type="submit" disabled={saving}>
              {editingId ? "Update section" : "Create section"}
            </button>
          </div>
        </form>
      </section>

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Section list</span>
            <h2>Homepage product sections</h2>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Section</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id}>
                  <td>{section.displayOrder}</td>
                  <td>
                    <strong>{section.eyebrow}</strong>
                    <div>{section.title}</div>
                    {section.keywords ? <small>{section.keywords}</small> : null}
                  </td>
                  <td>{section.type.replace(/_/g, " ")}</td>
                  <td>
                    <span className={`admin-status-pill ${section.active ? "is-success" : "is-warning"}`}>
                      {section.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="link-button" type="button" onClick={() => editSection(section)}>
                        Edit
                      </button>
                      <button
                        className="link-button admin-danger-button"
                        type="button"
                        onClick={async () => {
                          if (!window.confirm(`Delete ${section.eyebrow}?`)) {
                            return;
                          }
                          try {
                            await deleteAdminHomepageSection(section.id);
                            toast.success("Homepage section deleted");
                            await loadSections();
                          } catch (error) {
                            handleAdminRequestError(error, "Unable to delete homepage section right now.");
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

export default AdminHomepageSectionsPage;
