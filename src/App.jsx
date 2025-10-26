import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import { KeyboardProvider } from './context/KeyboardContext';
import KeyboardManager from './components/KeyboardManager';
import KeyboardToggleButton from './components/KeyboardToggleButton';
import OfflineModal from './components/OfflineModal';
import UpdateNotification from './components/UpdateNotification';

// Lazy load all pages for better performance on weaker PCs
const PhoneInput = lazy(() => import('./pages/PhoneInput'));
const OTPVerify = lazy(() => import('./pages/OTPVerify'));
const Homepage = lazy(() => import('./pages/Homepage'));
const Profile = lazy(() => import('./pages/Profile'));
const ProductTypes = lazy(() => import('./pages/ProductTypes'));
const ProductList = lazy(() => import('./pages/ProductList'));
const SupplyingHome = lazy(() => import('./pages/SupplyingHome'));
const SupplySelection = lazy(() => import('./pages/SupplySelection'));
const SupplyProductTypes = lazy(() => import('./pages/SupplyProductTypes'));
const SupplyProductList = lazy(() => import('./pages/SupplyProductList'));
const GivenProductsHistory = lazy(() => import('./pages/GivenProductsHistory'));
const FactoryManagerHome = lazy(() => import('./pages/FactoryManagerHome'));
const FactoryManagerStatistics = lazy(() => import('./pages/FactoryManagerStatistics'));
const FactoryManagerReports = lazy(() => import('./pages/FactoryManagerReports'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const ViewReport = lazy(() => import('./pages/ViewReport'));
const DressesList = lazy(() => import('./pages/DressesList'));
const IdeasList = lazy(() => import('./pages/IdeasList'));
const DressDetails = lazy(() => import('./pages/DressDetails'));
const IdeaDetails = lazy(() => import('./pages/IdeaDetails'));

// Salon role pages
const SalonHome = lazy(() => import('./pages/SalonHome'));
const SalonDressList = lazy(() => import('./pages/SalonDressList'));
const SalonDressDetails = lazy(() => import('./pages/SalonDressDetails'));
const SalonsList = lazy(() => import('./pages/SalonsList'));
const SalonDetails = lazy(() => import('./pages/SalonDetails'));
const SimpleSale = lazy(() => import('./pages/SimpleSale'));
const FiftyFiftySale = lazy(() => import('./pages/FiftyFiftySale'));
const AccessorySale = lazy(() => import('./pages/AccessorySale'));
const FiftyFiftyNoSalon = lazy(() => import('./pages/FiftyFiftyNoSalon'));
const SalonOrderPlacement = lazy(() => import('./pages/SalonOrderPlacement'));
const SalonShipments = lazy(() => import('./pages/SalonShipments'));
const SalonStatistics = lazy(() => import('./pages/SalonStatistics'));
const SalonReports = lazy(() => import('./pages/SalonReports'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900 mb-4"></div>
      <p className="text-xl text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <KeyboardProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <PhoneInput />}
        />
        <Route path="/otp" element={<OTPVerify />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/types"
          element={
            <ProtectedRoute>
              <ProductTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/products/:typeId"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplying"
          element={
            <ProtectedRoute>
              <SupplyingHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplying/give"
          element={
            <ProtectedRoute>
              <SupplySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplying/product-types"
          element={
            <ProtectedRoute>
              <SupplyProductTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplying/products/:typeId"
          element={
            <ProtectedRoute>
              <SupplyProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplying/history"
          element={
            <ProtectedRoute>
              <GivenProductsHistory />
            </ProtectedRoute>
          }
        />

        {/* Factory Manager Routes */}
        <Route
          path="/factory-manager/home"
          element={
            <ProtectedRoute>
              <FactoryManagerHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/order/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/statistics"
          element={
            <ProtectedRoute>
              <FactoryManagerStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/reports"
          element={
            <ProtectedRoute>
              <FactoryManagerReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/view-report"
          element={
            <ProtectedRoute>
              <ViewReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/dresses"
          element={
            <ProtectedRoute>
              <DressesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/dress/:id"
          element={
            <ProtectedRoute>
              <DressDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/ideas"
          element={
            <ProtectedRoute>
              <IdeasList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/factory-manager/idea/:id"
          element={
            <ProtectedRoute>
              <IdeaDetails />
            </ProtectedRoute>
          }
        />

        {/* Salon Routes */}
        <Route
          path="/salon/home"
          element={
            <ProtectedRoute>
              <SalonHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/dresses"
          element={
            <ProtectedRoute>
              <SalonDressList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/dress/:id"
          element={
            <ProtectedRoute>
              <SalonDressDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/salons"
          element={
            <ProtectedRoute>
              <SalonsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/salon/:id"
          element={
            <ProtectedRoute>
              <SalonDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/simple-sale"
          element={
            <ProtectedRoute>
              <SimpleSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/fifty-fifty-sale"
          element={
            <ProtectedRoute>
              <FiftyFiftySale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/accessory-sale"
          element={
            <ProtectedRoute>
              <AccessorySale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/fifty-fifty-no-salon"
          element={
            <ProtectedRoute>
              <FiftyFiftyNoSalon />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/order-placement"
          element={
            <ProtectedRoute>
              <SalonOrderPlacement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/shipments"
          element={
            <ProtectedRoute>
              <SalonShipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/statistics"
          element={
            <ProtectedRoute>
              <SalonStatistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salon/reports"
          element={
            <ProtectedRoute>
              <SalonReports />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or login */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
        />
          </Routes>
        </Suspense>
        <KeyboardManager />
        <KeyboardToggleButton />
        <OfflineModal />
        <UpdateNotification />
      </HashRouter>
    </KeyboardProvider>
  );
}

export default App;
