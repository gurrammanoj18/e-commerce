import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAdminHomepageSections,
  updateAdminHomepageSection,
} from "../services/adminService";
import { HomepageSectionContent } from "../types/store";

const sectionLabels: Record<string, string> = {
  categories: "Category section",
  "hard-to-find": "Hard to find section",
  "everyday-essentials": "Everyday essentials section",
  "shop-by-brand": "Shop by brand section",
  "electrical-essentials": "Electrical essentials section",
  "hardware-tools": "Hardware and tools section",
  "plumbing-bathroom": "Plumbing and bathroom section",
  "seasonal-picks": "Seasonal picks section",
  "recently-added": "Recently added section",
  "best-selling": "Best-selling section",
};

const AdminHomeSectionsPage: React.FC = () => {
  const [sections, setSections] = useState<HomepageSectionContent[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSections = async () => {
      try {
        const response = await fetchAdminHomepageSections();
        if (isMounted) {
          setSections(response);
        }
      } catch {
        toast.error("Unable to load homepage sections.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSections();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSectionField = (
    sectionKey: string,
    field: "tagline" | "heading",
    value: string,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.sectionKey === sectionKey
          ? {
              ...section,
              [field]: value,
            }
          : section,
      ),
    );
  };

  const saveSection = async (section: HomepageSectionContent) => {
    if (!section.tagline.trim() || !section.heading.trim()) {
      toast.error("Tagline and heading are required.");
      return;
    }

    setSavingKey(section.sectionKey);
    try {
      const updatedSection = await updateAdminHomepageSection(section.sectionKey, {
        tagline: section.tagline.trim(),
        heading: section.heading.trim(),
      });
      setSections((current) =>
        current.map((item) =>
          item.sectionKey === updatedSection.sectionKey ? updatedSection : item,
        ),
      );
      toast.success("Homepage section updated.");
    } catch {
      toast.error("Unable to update homepage section.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="shell section page-section">
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Admin workspace</span>
          <h1>Homepage section copy</h1>
        </div>
      </div>

      <section className="store-card admin-panel admin-panel--full">
        <div className="admin-panel__heading">
          <div>
            <span className="eyebrow">Section text</span>
            <h2>Edit taglines and headings</h2>
          </div>
        </div>

        {loading ? (
          <p className="admin-empty-state">Loading homepage sections...</p>
        ) : (
          <div className="admin-home-section-editor">
            {sections.map((section) => (
              <form
                key={section.sectionKey}
                className="admin-home-section-editor__item"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveSection(section);
                }}
              >
                <div className="admin-home-section-editor__title">
                  <strong>{sectionLabels[section.sectionKey] || section.sectionKey}</strong>
                  <span>{section.sectionKey}</span>
                </div>
                <label>
                  Section tagline
                  <input
                    maxLength={120}
                    value={section.tagline}
                    onChange={(event) =>
                      updateSectionField(section.sectionKey, "tagline", event.target.value)
                    }
                  />
                </label>
                <label>
                  Section heading
                  <input
                    maxLength={120}
                    value={section.heading}
                    onChange={(event) =>
                      updateSectionField(section.sectionKey, "heading", event.target.value)
                    }
                  />
                </label>
                <button
                  className="button"
                  type="submit"
                  disabled={savingKey === section.sectionKey}
                >
                  {savingKey === section.sectionKey ? "Saving..." : "Save"}
                </button>
              </form>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default AdminHomeSectionsPage;
