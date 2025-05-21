import React from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataCard } from "../../components/dashboard/DataCard";
import {
  useGetAllMerchantsQuery,
  useGetAllCoreUsersQuery,
  useGetAllSystemTransactionsQuery,
} from "../../store/api";
import type {
  SystemWideTransactionsRequestParams,
  TransactionResponse,
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
const UsersGroupIcon = () => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.08-.997-.237-1.293m.237 1.293V10a2 2 0 00-2-2H9a2 2 0 00-2 2v6c0 .331.1.64.237.907M9 12a3 3 0 100-6 3 3 0 000 6zm-1 7a3 3 0 015.356-1.857M5 20v-2a3 3 0 015.356-1.857M5 20H2"
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

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}

export const AdminDashboardPage: React.FC = () => {
  const {
    data: merchantsData,
    error: merchantsError,
    isLoading: merchantsLoading,
  } = useGetAllMerchantsQuery();
  const {
    data: coreUsersData,
    error: coreUsersError,
    isLoading: coreUsersLoading,
  } = useGetAllCoreUsersQuery();

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const formatToYyyyMmDdTHhMmSs = (date: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const last24hParams: SystemWideTransactionsRequestParams = {
    startDate: formatToYyyyMmDdTHhMmSs(yesterday),
    endDate: formatToYyyyMmDdTHhMmSs(now),
    page: 0,
    size: 1000,
    sort: "timestamp,desc",
  };

  const {
    data: transactionsLast24hData,
    error: transactionsError,
    isLoading: transactionsLoading,
  } = useGetAllSystemTransactionsQuery(last24hParams);

  const dailyTransactionsCount = transactionsLast24hData?.totalElements;
  let netTransactionValueLast24h = 0;
  if (transactionsLast24hData?.content) {
    transactionsLast24hData.content.forEach((tx: TransactionResponse) => {
      if (tx.type === "PAYIN") {
        netTransactionValueLast24h += tx.amount;
      } else if (tx.type === "PAYOUT") {
        netTransactionValueLast24h -= tx.amount;
      }
    });
  }

  const totalMerchants = merchantsData?.totalElements;
  const totalCoreUsers = coreUsersData?.totalElements;

  const isLoadingAny =
    merchantsLoading || coreUsersLoading || transactionsLoading;

  const renderError = (
    error: AppFetchBaseQueryError | SerializedError | undefined,
    resourceName: string
  ) => {
    if (!error) return null;
    let message = `Error fetching ${resourceName}.`;

    if (typeof error === "object" && error !== null) {
      if ("status" in error) {
        message += ` Status: ${error.status}.`;
      }

      if ("data" in error && isDataWithMessage(error.data)) {
        message += ` Message: ${error.data.message}`;
      } else if ("message" in error && typeof error.message === "string") {
        message += ` Details: ${error.message}`;
      } else if ("error" in error && typeof error.error === "string") {
        message += ` Details: ${error.error}`;
      }
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
    <DashboardLayout pageTitle="Admin Dashboard Overview" navType="admin">
      {renderError(merchantsError, "Merchants")}
      {renderError(coreUsersError, "Core Users")}
      {renderError(transactionsError, "Recent Transactions")}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataCard
          title="Transactions (Last 24h)"
          value={
            transactionsLoading
              ? "Loading..."
              : (dailyTransactionsCount ?? "N/A")
          }
          icon={<TrendingUpIcon />}
          description="Total transactions in the last 24 hours"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="Net Value (Last 24h)"
          value={
            transactionsLoading
              ? "Loading..."
              : `$${netTransactionValueLast24h.toFixed(2)}`
          }
          icon={<CurrencyDollarIcon />}
          description="Pay-ins minus Pay-outs in the last 24 hours"
          className={isLoadingAny ? "opacity-50" : ""}
        />
        <DataCard
          title="Total Registered Merchants"
          value={merchantsLoading ? "Loading..." : (totalMerchants ?? "N/A")}
          icon={<BriefcaseIcon />}
          description="Total merchant accounts from API"
          className={merchantsLoading ? "opacity-50" : ""}
        />
        <DataCard
          title="Total Core Users"
          value={coreUsersLoading ? "Loading..." : (totalCoreUsers ?? "N/A")}
          icon={<UsersGroupIcon />}
          description="Total core user accounts from API"
          className={coreUsersLoading ? "opacity-50" : ""}
        />
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Notes & API Status
        </h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>
            Data for "Transactions (Last 24h)" and "Net Value (Last 24h)" is now
            fetched from the API.
          </li>
          <li>
            Displaying total merchants and core users based on `totalElements`
            from paginated API responses.
          </li>
          {merchantsLoading && <li>Merchants data: Loading...</li>}
          {merchantsError && (
            <li>Merchants data: Error loading (see details above).</li>
          )}
          {!merchantsLoading && !merchantsError && merchantsData && (
            <li>Merchants data: Loaded successfully.</li>
          )}
          {coreUsersLoading && <li>Core Users data: Loading...</li>}
          {coreUsersError && (
            <li>Core Users data: Error loading (see details above).</li>
          )}
          {!coreUsersLoading && !coreUsersError && coreUsersData && (
            <li>Core Users data: Loaded successfully.</li>
          )}
          {transactionsLoading && <li>Recent transactions data: Loading...</li>}
          {transactionsError && (
            <li>
              Recent transactions data: Error loading (see details above).
            </li>
          )}
          {!transactionsLoading &&
            !transactionsError &&
            transactionsLast24hData && (
              <li>Recent transactions data: Loaded successfully.</li>
            )}
        </ul>
      </div>
    </DashboardLayout>
  );
};
