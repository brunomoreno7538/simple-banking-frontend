import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const HomeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    ></path>
  </svg>
);
const BriefcaseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    ></path>
  </svg>
);
const TransactionsIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    ></path>
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M19 14a1 1 0 00-1-1h-1a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1zm4-10a3 3 0 00-3-3H6a3 3 0 00-3 3v12a3 3 0 003 3h10a3 3 0 003-3v-1a1 1 0 00-1-1h-1a1 1 0 100 2h1a1 1 0 001-1V4z"
    ></path>
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    ></path>
  </svg>
);

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg text-gray-200 hover:bg-indigo-700 hover:text-white transition-colors duration-200 ${isActive ? "bg-indigo-700 text-white font-semibold" : ""}`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </Link>
    </li>
  );
};

interface SidebarProps {
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  navType: "admin" | "merchant";
  userRole?: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
  isProfileLoading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  navType,
  userRole,
  isProfileLoading,
}) => {
  let navItems;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("coreUserToken");
    localStorage.removeItem("merchantToken");
    localStorage.removeItem("activeUserType");
    onCloseMobile();
    navigate("/");
  };

  if (navType === "admin") {
    navItems = (
      <>
        <NavItem
          to="/admin/dashboard"
          icon={<HomeIcon />}
          label="Admin Dashboard"
          onClick={onCloseMobile}
        />
        <NavItem
          to="/admin/merchants"
          icon={<BriefcaseIcon />}
          label="Merchants"
          onClick={onCloseMobile}
        />
        <NavItem
          to="/admin/transactions"
          icon={<TransactionsIcon />}
          label="All Transactions"
          onClick={onCloseMobile}
        />
        <NavItem
          to="/admin/core-users"
          icon={<UsersIcon />}
          label="Manage Core Users"
          onClick={onCloseMobile}
        />
      </>
    );
  } else if (navType === "merchant") {
    navItems = (
      <>
        <NavItem
          to="/merchant/dashboard"
          icon={<HomeIcon />}
          label="My Dashboard"
          onClick={onCloseMobile}
        />
        <NavItem
          to="/merchant/transactions"
          icon={<TransactionsIcon />}
          label="My Transactions"
          onClick={onCloseMobile}
        />
        {!isProfileLoading && userRole === "MERCHANT_ADMIN" && (
          <NavItem
            to="/merchant/users"
            icon={<UsersIcon />}
            label="Manage Users"
            onClick={onCloseMobile}
          />
        )}
      </>
    );
  }

  const sidebarContent = (
    <div className="flex flex-col flex-grow">
      <div className="p-6 mb-4 border-b border-gray-700">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Banking Assessment
        </Link>
      </div>
      <nav className="flex-grow px-4">
        <ul>{navItems}</ul>
      </nav>
      <div className="p-4 mt-auto border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 my-1 w-full rounded-lg text-gray-200 hover:bg-red-700 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <LogoutIcon />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-64 h-screen bg-gray-800 text-white shadow-lg hidden md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden transition-opacity duration-300 ease-linear"
          aria-hidden="true"
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden
                    ${isOpenOnMobile ? "translate-x-0" : "-translate-x-full"}`}
        aria-labelledby="mobile-sidebar-title"
      >
        <div className="absolute top-0 right-0 pt-2 pr-2">
          <button
            onClick={onCloseMobile}
            className="text-gray-300 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close sidebar"
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
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};
