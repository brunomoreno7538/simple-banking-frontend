import React, { useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataCard } from "../../components/dashboard/DataCard";
import { Modal } from "../../components/common/Modal";
import { CreateTransactionForm } from "../transactions/CreateTransactionForm";
import {
  useGetAccountBalanceQuery,
  useGetAccountDetailsQuery,
  useGetTransactionsForAccountQuery,
  useGetMyMerchantProfileQuery,
} from "../../store/api";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

const TrendingUpIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    ></path>
  </svg>
);
const CurrencyDollarIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);
const BriefcaseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    ></path>
  </svg>
);
const DocumentTextIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}

export const MerchantDashboardPage: React.FC = () => {
  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
  } = useGetMyMerchantProfileQuery();

  const merchantData = profileData?.merchant;
  const userData = profileData?.user;
  const accountId = merchantData?.accountId;

  const [isCreateTransactionModalOpen, setIsCreateTransactionModalOpen] =
    useState(false);

  const {
    data: accountBalanceData,
    error: accountBalanceError,
    isLoading: accountBalanceLoading,
  } = useGetAccountBalanceQuery(accountId!, {
    skip: !accountId || profileLoading,
  });

  const {
    data: accountDetailsData,
    error: accountDetailsError,
    isLoading: accountDetailsLoading,
  } = useGetAccountDetailsQuery(accountId!, {
    skip: !accountId || profileLoading,
  });

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useGetTransactionsForAccountQuery(
    {
      accountId: accountId!,
      params: { page: 0, size: 5, sort: "timestamp,desc" },
    },
    { skip: !accountId || profileLoading }
  );

  const isLoadingAny =
    profileLoading ||
    accountBalanceLoading ||
    accountDetailsLoading ||
    transactionsLoading;

  const renderError = (
    error: AppFetchBaseQueryError | SerializedError | undefined,
    resourceName: string
  ) => {
    if (!error) return null;
    let message = `Error fetching ${resourceName}.`;
    if (typeof error === "object" && error !== null) {
      if ("status" in error) message += ` Status: ${error.status}.`;
      if ("data" in error && isDataWithMessage(error.data))
        message += ` Message: ${error.data.message}`;
      else if ("message" in error && typeof error.message === "string")
        message += ` Details: ${error.message}`;
      else if ("error" in error && typeof error.error === "string")
        message += ` Details: ${error.error}`;
    }
    return (
      <AlertMessage
        type="error"
        title={`API Error (${resourceName})`}
        message={message}
      />
    );
  };

  return (
    <DashboardLayout
      pageTitle={
        merchantData?.name
          ? `${merchantData.name} - Dashboard`
          : profileLoading
            ? "Loading Dashboard..."
            : "Merchant Dashboard"
      }
      navType="merchant"
    >
      {renderError(profileError, "Merchant Profile")}
      {renderError(accountBalanceError, "Account Balance")}
      {renderError(accountDetailsError, "Account Details")}
      {renderError(transactionsError, "Recent Transactions")}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataCard
          title="Account Balance"
          value={
            accountBalanceLoading || !accountId
              ? "Loading..."
              : `$${accountBalanceData?.balance?.toFixed(2) ?? "N/A"}`
          }
          icon={<CurrencyDollarIcon />}
          description="Current available balance"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="Recent Transactions (Count)"
          value={
            transactionsLoading || !accountId
              ? "Loading..."
              : (transactionsData?.numberOfElements ?? "N/A")
          }
          icon={<TrendingUpIcon />}
          description="Number of recent transactions"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="Merchant Name"
          value={profileLoading ? "Loading..." : (merchantData?.name ?? "N/A")}
          icon={<BriefcaseIcon />}
          description="Registered merchant name"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="Account Number"
          value={
            accountDetailsLoading || !accountId
              ? "Loading..."
              : (accountDetailsData?.accountNumber ?? "N/A")
          }
          icon={<DocumentTextIcon />}
          description="Your primary account number"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="New Transaction"
          value="+ Create"
          icon={<CurrencyDollarIcon />}
          description="Quickly create a PayIn or PayOut"
          className={`cursor-pointer hover:shadow-md ${isLoadingAny || !accountId ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => {
            if (accountId && !isLoadingAny) {
              setIsCreateTransactionModalOpen(true);
            }
          }}
        />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Welcome, {userData?.fullName || "Merchant User"}!
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>
            This dashboard displays key information related to your merchant
            account.
          </li>
          {profileLoading && <li>Profile data: Loading...</li>}
          {profileError && <li>Profile data: Error loading.</li>}
          {!profileLoading && !profileError && profileData && (
            <li>Profile data: Loaded successfully for {userData?.username}.</li>
          )}
          {!profileLoading && !profileError && !merchantData && (
            <li>Merchant details not found in profile.</li>
          )}

          {!accountId && !profileLoading && merchantData && (
            <li>Account ID not found for this merchant in profile.</li>
          )}

          {accountBalanceLoading && accountId && (
            <li>Account balance: Loading...</li>
          )}
          {accountBalanceError && accountId && (
            <li>Account balance: Error loading.</li>
          )}
          {!accountBalanceLoading &&
            !accountBalanceError &&
            accountBalanceData &&
            accountId && <li>Account balance: Loaded.</li>}

          {accountDetailsLoading && accountId && (
            <li>Account details: Loading...</li>
          )}
          {accountDetailsError && accountId && (
            <li>Account details: Error loading.</li>
          )}
          {!accountDetailsLoading &&
            !accountDetailsError &&
            accountDetailsData &&
            accountId && <li>Account details: Loaded.</li>}

          {transactionsLoading && accountId && (
            <li>Recent transactions: Loading...</li>
          )}
          {transactionsError && accountId && (
            <li>Recent transactions: Error loading.</li>
          )}
          {!transactionsLoading &&
            !transactionsError &&
            transactionsData &&
            accountId && (
              <li>
                Recent transactions: Loaded ({transactionsData.numberOfElements}{" "}
                items).
              </li>
            )}
        </ul>
      </div>

      {accountId && (
        <Modal
          isOpen={isCreateTransactionModalOpen}
          onClose={() => setIsCreateTransactionModalOpen(false)}
          title="Create New Transaction"
          size="lg"
        >
          <CreateTransactionForm
            accountId={accountId}
            onSuccess={() => {
              setIsCreateTransactionModalOpen(false);
            }}
            onCancel={() => setIsCreateTransactionModalOpen(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
};
