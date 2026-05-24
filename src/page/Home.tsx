import React from "react";
import Navbar from "../components/navbar/Navbar";
import Banner from "../components/banner/Banner";
import FAQ from "../components/faqs/Faq";
import ProductGrid from "../components/productGrid/ProductGrid";
import DiscoverySection from "../components/discovery/DiscoverySection";

const Home: React.FC = () => {
  return (
    <>
      <FAQ />
      
      <Navbar />
      <Banner />
      <ProductGrid/>
      <DiscoverySection/>
    </>
  );
};

export default Home;
