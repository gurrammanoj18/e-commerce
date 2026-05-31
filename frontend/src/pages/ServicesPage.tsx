import React from "react";
import electricianImage from "../assets/services/electrician.png";
import plumberImage from "../assets/services/plumber.png";
import painterImage from "../assets/services/painter.png";
import constructorImage from "../assets/services/constructor.png";
import carpenterImage from "../assets/services/carpenter.png";
import cleaningImage from "../assets/services/cleaning.png";
import appliancesRepairImage from "../assets/services/appliances-repair.png";

const services = [
  {
    key: "electrician",
    name: "Electrician",
    title: "Electrical wiring",
    description: "Safe repair and installation support for switches, wiring, and fixtures.",
    image: electricianImage,
  },
  {
    key: "plumber",
    name: "Plumber",
    title: "Plumbing",
    description: "Leak fixing, pipe fitting, tap replacement, and water flow troubleshooting.",
    image: plumberImage,
  },
  {
    key: "painter",
    name: "Painter",
    title: "Painting",
    description: "Interior and exterior painting services with neat surface preparation.",
    image: painterImage,
  },
  {
    key: "constructor",
    name: "Constructor",
    title: "Constructing",
    description: "Site-ready building and renovation help for structured improvement work.",
    image: constructorImage,
  },
  {
    key: "carpenter",
    name: "Carpenter",
    title: "Carpentering",
    description: "Woodwork repair, fittings, modular setup, and furniture installation.",
    image: carpenterImage,
  },
  {
    key: "cleaning",
    name: "Cleaning",
    title: "Cleaning",
    description: "Deep cleaning support for homes, work areas, and post-project cleanup.",
    image: cleaningImage,
  },
  {
    key: "appliances-repair",
    name: "Appliances Repair",
    title: "Repairing appliances",
    description: "Diagnosis and repair support for common home and utility appliances.",
    image: appliancesRepairImage,
  },
];

const ServicesPage: React.FC = () => {
  return (
    <section className="shell section page-section services-page">
      <div className="page-header services-page__header">
        <span className="eyebrow">Services</span>
        <h1>Book reliable field services</h1>
      </div>

      <div className="category-grid">
        {services.map((service) => (
          <article key={service.key} className="category-card">
            <div className="category-card__media">
              <img src={service.image} alt={service.name} className="category-card__image" />
            </div>
            <div className="category-card__content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ServicesPage;
