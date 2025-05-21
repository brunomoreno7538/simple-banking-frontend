import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/AuthRoutes";
import { CoreUserLoginForm } from "./features/auth/CoreUserLoginForm";
import { MerchantLoginForm } from "./features/auth/MerchantLoginForm";
import { AdminDashboardPage } from "./features/dashboard/AdminDashboardPage";
import { MerchantDashboardPage } from "./features/dashboard/MerchantDashboardPage";
import { MerchantDetailsPage } from "./features/merchants/MerchantDetailsPage";
import { MerchantsPage } from "./features/merchants/MerchantsPage";
import { AdminTransactionsPage } from "./features/transactions/AdminTransactionsPage";
import { MerchantTransactionsPage } from "./features/transactions/MerchantTransactionsPage";
import { CoreUsersManagementPage } from "./features/users/CoreUsersManagementPage";
import { MerchantUsersManagementPage } from "./features/users/MerchantUsersManagementPage";
import { HomePage } from "./App";

const MerchantLoginPage = () => <MerchantLoginForm />;
const CoreUserLoginPage = () => <CoreUserLoginForm />;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/merchant" element={<MerchantLoginPage />} />
        <Route path="/core" element={<CoreUserLoginPage />} />
      </Route>

      <Route element={<ProtectedRoute requiredUserType="merchant" />}>
        <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
        <Route
          path="/merchant/transactions"
          element={<MerchantTransactionsPage />}
        />
        <Route
          path="/merchant/users"
          element={<MerchantUsersManagementPage />}
        />
      </Route>

      <Route element={<ProtectedRoute requiredUserType="core" />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/merchants" element={<MerchantsPage />} />
        <Route
          path="/admin/merchants/:merchantId"
          element={<MerchantDetailsPage />}
        />
        <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
        <Route path="/admin/core-users" element={<CoreUsersManagementPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
