import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { AlertMessage } from "../../components/common/AlertMessage";
import { Modal } from "../../components/common/Modal";
import { CreateTransactionForm } from "./CreateTransactionForm";
import {
  useGetMyMerchantProfileQuery,
  useGetTransactionsForAccountQuery,
} from "../../store/api";
import type {
  TransactionResponse,
  AccountTransactionsRequestParams,
} from "../../store/api";
import { FormField } from "../../components/common/FormField";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";
import { formatTimestampToLocaleString } from "../../utils/dateUtils";

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}
const getSafeErrorMessage = (
  error: AppFetchBaseQueryError | SerializedError | undefined,
  resourceName: string
): string => {
  if (!error)
    return `An unknown error occurred while fetching ${resourceName}.`;
  let msg = `Error fetching ${resourceName}.`;
  if (typeof error === "object" && error !== null) {
    if ("status" in error && typeof error.status === "number")
      msg += ` Status: ${error.status}.`;
    if ("data" in error && isDataWithMessage(error.data))
      msg += ` Message: ${error.data.message}`;
    else if ("message" in error && typeof error.message === "string")
      msg += ` Details: ${error.message}`;
    else if ("error" in error && typeof error.error === "string")
      msg += ` Details: ${error.error}`;
  }
  return msg;
};

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

const formatInputDateToISO = (inputDate?: string) => {
  if (!inputDate) return undefined;
  return inputDate.length === 16 ? `${inputDate}:00` : inputDate;
};

export const MerchantTransactionsPage: React.FC = () => {
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useGetMyMerchantProfileQuery();

  const accountId = profileData?.merchant?.accountId;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState<
    Omit<AccountTransactionsRequestParams, "page" | "size" | "sort">
  >({
    startDate: "",
    endDate: "",
    type: undefined,
  });

  const [pagination, setPagination] = useState<{ page: number; size: number }>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
  });
  const [sort, setSort] = useState<{
    field: keyof TransactionResponse | string;
    direction: "asc" | "desc";
  }>({
    field: "timestamp",
    direction: "desc",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilters(filters), 500);
    return () => clearTimeout(handler);
  }, [filters]);

  const queryArgs: AccountTransactionsRequestParams = {
    startDate: formatInputDateToISO(debouncedFilters.startDate),
    endDate: formatInputDateToISO(debouncedFilters.endDate),
    type: debouncedFilters.type,
    page: pagination.page,
    size: pagination.size,
    sort: `${String(sort.field)},${sort.direction}`,
  };

  const {
    data: pagedTransactionsResponse,
    error: transactionsApiError,
    isLoading: transactionsLoading,
    isFetching: transactionsIsFetching,
  } = useGetTransactionsForAccountQuery(
    { accountId: accountId!, params: queryArgs },
    { skip: !accountId || profileLoading }
  );

  const transactionsData = pagedTransactionsResponse?.transactionsPage;
  const transactionSummary = pagedTransactionsResponse?.summary;

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handleTransactionCreated = () => setIsCreateModalOpen(false);
  const handlePageChange = (newPage: number) =>
    setPagination((prev) => ({ ...prev, page: newPage }));
  const handlePageSizeChange = (newPageSize: number) =>
    setPagination({ page: 0, size: newPageSize });
  const handleSortChange = (
    sortField: keyof TransactionResponse,
    sortDirection: "asc" | "desc"
  ) => {
    setSort({ field: sortField, direction: sortDirection });
  };

  const transactionColumns: ColumnDefinition<TransactionResponse>[] = [
    {
      header: "Transaction ID",
      accessorKey: "transactionId",
      sortable: true,
      sortField: "transactionId",
      cell: (row) => (
        <span title={row.transactionId}>
          {row.transactionId.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      sortField: "type",
      cellClassName: (row) =>
        row.type === "PAYIN"
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      sortField: "amount",
      cell: (row) => `$${Number(row.amount).toFixed(2)}`,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      sortField: "status",
    },
    {
      header: "Timestamp",
      accessorKey: "timestamp",
      sortable: true,
      sortField: "timestamp",
      cell: (row) => formatTimestampToLocaleString(row.timestamp),
    },
    {
      header: "Description",
      accessorKey: "description",
      sortable: true,
      sortField: "description",
      cell: (row) => row.description || "-",
    },
  ];

  const effectiveIsLoading =
    profileLoading || transactionsLoading || transactionsIsFetching;

  if (profileLoading) {
    return (
      <DashboardLayout pageTitle="Loading Transactions..." navType="merchant">
        <p className="text-center p-8">Loading user profile...</p>
      </DashboardLayout>
    );
  }

  if (profileError) {
    return (
      <DashboardLayout pageTitle="Error" navType="merchant">
        <AlertMessage
          type="error"
          title="Failed to load profile"
          message={getSafeErrorMessage(
            profileError as AppFetchBaseQueryError | SerializedError,
            "profile data"
          )}
        />
      </DashboardLayout>
    );
  }

  if (!accountId) {
    return (
      <DashboardLayout pageTitle="Transactions" navType="merchant">
        <AlertMessage
          type="warning"
          title="Account ID Missing"
          message="Merchant account ID is not available. Cannot fetch transactions."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="My Transactions" navType="merchant">
      {transactionSummary && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow">
          <h4 className="text-md font-semibold text-blue-700">
            Summary for Current View
          </h4>
          <p className="text-sm text-blue-600">
            Total Transactions: {transactionSummary.quantity}
          </p>
          <p className="text-sm text-blue-600">
            Total Amount: ${transactionSummary.totalAmount.toFixed(2)}
          </p>
        </div>
      )}

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <FormField
            label="Start Date/Time"
            type="datetime-local"
            id="startDate"
            name="startDate"
            value={filters.startDate || ""}
            onChange={handleFilterChange}
          />
          <FormField
            label="End Date/Time"
            type="datetime-local"
            id="endDate"
            name="endDate"
            value={filters.endDate || ""}
            onChange={handleFilterChange}
          />
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={filters.type || ""}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="PAYIN">PAYIN</option>
              <option value="PAYOUT">PAYOUT</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!accountId || profileLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Create Transaction
          </button>
        </div>
      </div>

      {transactionsApiError && (
        <AlertMessage
          type="error"
          title="Error Loading Transactions"
          message={getSafeErrorMessage(
            transactionsApiError as AppFetchBaseQueryError | SerializedError,
            "transactions list"
          )}
        />
      )}
      <DataTable<TransactionResponse>
        columns={transactionColumns}
        data={transactionsData?.content || []}
        isLoading={effectiveIsLoading}
        error={
          transactionsApiError as
            | AppFetchBaseQueryError
            | SerializedError
            | undefined
        }
        page={transactionsData?.number ?? pagination.page ?? 0}
        pageSize={
          transactionsData?.size ?? pagination.size ?? INITIAL_PAGE_SIZE
        }
        totalElements={transactionsData?.totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        availablePageSizes={DEFAULT_PAGE_SIZES}
        getRowId={(transaction) => transaction.transactionId}
        onSortChange={handleSortChange}
        currentSortField={sort.field as keyof TransactionResponse}
        currentSortDirection={sort.direction}
      />

      {accountId && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Transaction"
          size="lg"
        >
          <CreateTransactionForm
            accountId={accountId}
            onSuccess={handleTransactionCreated}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
};
