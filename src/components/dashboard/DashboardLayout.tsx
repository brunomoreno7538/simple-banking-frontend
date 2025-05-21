import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useGetMyMerchantProfileQuery } from "../../store/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  navType: "admin" | "merchant";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle,
  navType,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: profileData, isLoading: profileLoading } =
    useGetMyMerchantProfileQuery(undefined, {
      skip: navType !== "merchant",
    });

  const userRole = navType === "merchant" ? profileData?.user?.role : undefined;

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={toggleMobileSidebar}
        navType={navType}
        userRole={userRole}
        isProfileLoading={navType === "merchant" && profileLoading}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={toggleMobileSidebar}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {pageTitle && (
              <h1 className="text-lg font-semibold text-gray-700 truncate">
                {pageTitle}
              </h1>
            )}
            <div className="w-6"></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {pageTitle && (
            <h1 className="text-3xl font-semibold text-gray-800 mb-6 hidden md:block">
              {pageTitle}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
