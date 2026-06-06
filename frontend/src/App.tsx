import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import Layout from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProcessingProvider } from "./contexts/ProcessingContext";
import { ProductProvider } from "./contexts/ProductContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminBannersPage from "./pages/AdminBannersPage";
import AdminBulkInquiriesPage from "./pages/AdminBulkInquiriesPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminBrandLogosPage from "./pages/AdminBrandLogosPage";
import AdminHomeSectionsPage from "./pages/AdminHomeSectionsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminReturnsPage from "./pages/AdminReturnsPage";
import AddressPage from "./pages/AddressPage";
import AboutPage from "./pages/AboutPage";
import BulkOrderPage from "./pages/BulkOrderPage";
import BuyingGuidesPage from "./pages/BuyingGuidesPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacyPage from "./pages/PrivacyPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductsPage from "./pages/ProductsPage";
import ReturnsPage from "./pages/ReturnsPage";
import ServicesPage from "./pages/ServicesPage";
import TermsPage from "./pages/TermsPage";
import WalletPage from "./pages/WalletPage";
import WishlistPage from "./pages/WishlistPage";
import AdminServicesPage from "./pages/AdminServicesPage";
import AdminWalletPage from "./pages/AdminWalletPage";

const App: React.FC = () => {
  return (
    <ProcessingProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                    <Route path="login" element={<LoginPage />} />
                    <Route
                      element={<Layout />}
                    >
                      <Route index element={<HomePage />} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="products/:slug" element={<ProductDetailsPage />} />
                      <Route
                        path="wishlist"
                        element={
                          <ProtectedRoute customerOnly>
                            <WishlistPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="cart"
                        element={
                          <ProtectedRoute customerOnly>
                            <CartPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="checkout"
                        element={
                          <ProtectedRoute customerOnly>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <ProtectedRoute customerOnly>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute customerOnly>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="address"
                        element={
                          <ProtectedRoute customerOnly>
                            <AddressPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="wallet"
                        element={
                          <ProtectedRoute customerOnly>
                            <WalletPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="services" element={<ServicesPage />} />
                      <Route path="help-center" element={<HelpCenterPage />} />
                      <Route path="terms" element={<TermsPage />} />
                      <Route path="privacy" element={<PrivacyPage />} />
                      <Route path="returns" element={<ReturnsPage />} />
                      <Route path="buying-guides" element={<BuyingGuidesPage />} />
                      <Route path="bulk-order" element={<BulkOrderPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                    <Route
                      path="admin"
                      element={<AdminLayout />}
                    >
                      <Route path="login" element={<AdminLoginPage />} />
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route
                        path="dashboard"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="inventory"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="orders"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="returns"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminReturnsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="categories"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminCategoriesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="banners"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminBannersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="home-sections"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminHomeSectionsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="brand-logos"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminBrandLogosPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bulk-inquiries"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminBulkInquiriesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="services"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminServicesPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="wallet"
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminWalletPage />
                          </ProtectedRoute>
                        }
                      />
                    </Route>
                  </Routes>
                  <ToastContainer position="top-right" autoClose={2500} />
                </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ProcessingProvider>
  );
};

export default App;
