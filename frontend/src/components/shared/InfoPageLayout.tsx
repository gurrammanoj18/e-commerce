import React from "react";
import "../../styles/pages/InfoPage.css";

interface InfoPageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
  }>;
}

const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({
  eyebrow,
  title,
  intro,
  sections,
}) => {
  return (
    <section className="shell section page-section">
      <div className="page-header info-page-header">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>

      <div className="info-page-stack">
        {sections.map((section) => (
          <article key={section.heading} className="store-card info-page-card">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
};

export default InfoPageLayout;
