import React, { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminWorkspaceNav from "../components/admin/AdminWorkspaceNav";
import { useAuth } from "../contexts/AuthContext";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "../services/adminService";
import "../styles/pages/AdminDashboardPage.css";
import { CategorySummary } from "../types/store";
import { optimizeImageFile } from "../utils/imageUpload";

const emptyForm = {
  name: "",
  image: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const AdminCategoriesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [formState, setFormState] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleAdminRequestError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error("Your admin session has expired or no longer has access. Please log in again.");
      logout();
      navigate("/admin/login", {
        replace: true,
        state: { from: location, adminOnly: true },
      });
      return;
    }

    toast.error(extractErrorMessage(error, fallback));
  }, [location, logout, navigate]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetchAdminCategories();
      setCategories(response);
    } catch (error) {
      handleAdminRequestError(error, "Unable to load categories right now.");
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const flattenCategories = categories.flatMap((category) => [
    category,
    ...(category.subcategories || []),
  ]);

  const handleCategoryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedImage = await optimizeImageFile(file);
      setFormState((current) => ({ ...current, image: uploadedImage }));
    } catch (error) {
      toast.error(extractErrorMessage(error, "Unable to prepare the selected category image."));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  return (
    <section className="shell section page-section">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Category management</h1>
        </div>
      </div>
      <AdminWorkspaceNav />

      <div className="admin-orders-layout">
        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Category form</span>
              <h2>{editingId ? "Edit category" : "Create category"}</h2>
            </div>
          </div>
          <form
            className="form-grid"
            onSubmit={async (event) => {
              event.preventDefault();
              const trimmedName = formState.name.trim();
              if (!trimmedName) {
                toast.error("Enter a category name.");
                return;
              }
              if (!formState.image) {
                toast.error("Upload a category image.");
                return;
              }

              const payload = {
                name: trimmedName,
                slug: slugify(trimmedName),
                description: "",
                icon: "",
                parentId: null,
                image: formState.image,
              };

              try {
                if (editingId) {
                  await updateAdminCategory(editingId, payload);
                  toast.success("Category updated");
                } else {
                  await createAdminCategory(payload);
                  toast.success("Category created");
                }
                setFormState(emptyForm);
                setEditingId(null);
                await loadCategories();
              } catch (error) {
                handleAdminRequestError(error, "Unable to save category right now.");
              }
            }}
          >
            <label>
              Category name
              <input
                value={formState.name}
                onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                placeholder="Appliances"
                required
              />
            </label>
            <label>
              Cover image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void handleCategoryImageUpload(event)}
              />
            </label>
            <label className="form-grid__wide">
              Generated slug
              <input value={slugify(formState.name)} readOnly placeholder="appliances" />
            </label>
            {formState.image ? (
              <div className="form-grid__wide admin-image-preview-grid">
                <div className="admin-image-preview-card">
                  <img src={formState.image} alt={formState.name || "Category preview"} />
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => setFormState((current) => ({ ...current, image: "" }))}
                  >
                    Remove image
                  </button>
                </div>
              </div>
            ) : null}
            <div className="admin-form-actions">
              <button className="button" type="submit" disabled={uploadingImage}>
                {uploadingImage
                  ? "Preparing image..."
                  : editingId
                    ? "Update category"
                    : "Create category"}
              </button>
              <button
                className="link-button"
                type="button"
                onClick={() => {
                  setFormState(emptyForm);
                  setEditingId(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="store-card admin-panel admin-panel--full">
          <div className="admin-panel__heading">
            <div>
              <span className="eyebrow">Category list</span>
              <h2>Current categories</h2>
            </div>
          </div>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flattenCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 12 }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.count}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="link-button"
                          type="button"
                          onClick={() => {
                            setEditingId(category.id || null);
                            setFormState({
                              name: category.name,
                              image: category.image || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="link-button admin-danger-button"
                          type="button"
                          onClick={async () => {
                            if (!category.id) {
                              return;
                            }
                            try {
                              await deleteAdminCategory(category.id);
                              toast.success("Category deleted");
                              await loadCategories();
                            } catch (error) {
                              handleAdminRequestError(error, "Unable to delete category right now.");
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
      </div>
    </section>
  );
};

export default AdminCategoriesPage;
