import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { AlertMessage } from "../../components/common/AlertMessage";
import { useGetAllSystemTransactionsQuery } from "../../store/api";
import type {
  TransactionResponse,
  SystemWideTransactionsRequestParams,
} from "../../store/api";
import { FormField } from "../../components/common/FormField";
import type {
  AppSerializedError,
  AppFetchBaseQueryError,
} from "../../utils/errorUtils";
import { formatTimestampToLocaleString } from "../../utils/dateUtils";

const getSafeErrorMessage = (
  error: AppFetchBaseQueryError | AppSerializedError | unknown,
  resourceName: string
): string => {
  if (!error)
    return `An unknown error occurred while fetching ${resourceName}.`;
  let msg = `Error fetching ${resourceName}.`;
  if (typeof error === "object" && error !== null) {
    if ("status" in error && (error as AppFetchBaseQueryError).status) {
      msg += ` Status: ${(error as AppFetchBaseQueryError).status}.`;
      if ("data" in error && (error as AppFetchBaseQueryError).data) {
        const errorData = (error as AppFetchBaseQueryError).data;
        if (
          typeof errorData === "object" &&
          errorData !== null &&
          "message" in errorData &&
          typeof (errorData as { message?: unknown }).message === "string"
        ) {
          msg += ` Message: ${(errorData as { message: string }).message}`;
        } else if (typeof errorData === "string") {
          msg += ` Data: ${errorData}`;
        }
      }
    } else if (
      "message" in error &&
      typeof (error as AppSerializedError).message === "string"
    ) {
      msg = `Error: ${(error as AppSerializedError).message}`;
    } else if (
      "error" in error &&
      typeof (error as AppFetchBaseQueryError).error === "string"
    ) {
      msg += ` Details: ${(error as AppFetchBaseQueryError).error}`;
    }
  }
  return msg;
};

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

const formatInputDateToISO = (inputDate?: string) => {
  if (!inputDate) return undefined;
  return inputDate.length === 16 ? `${inputDate}:00` : inputDate;
};

export const AdminTransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState<
    Omit<SystemWideTransactionsRequestParams, "page" | "size" | "sort">
  >({
    startDate: "",
    endDate: "",
    type: undefined,
    accountId: "",
  });
  const [pagination, setPagination] = useState<{
    page: number;
    size: number;
  }>({
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
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters]);

  const queryArgs: SystemWideTransactionsRequestParams = {
    startDate: formatInputDateToISO(debouncedFilters.startDate),
    endDate: formatInputDateToISO(debouncedFilters.endDate),
    type: debouncedFilters.type,
    accountId: debouncedFilters.accountId || undefined,
    page: pagination.page,
    size: pagination.size,
    sort: `${String(sort.field)},${sort.direction}`,
  };

  const {
    data: transactionsData,
    error: apiError,
    isLoading,
    isFetching,
  } = useGetAllSystemTransactionsQuery(queryArgs);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 0, size: newPageSize });
  };

  const handleSortChange = (
    sortField: keyof TransactionResponse,
    sortDirection: "asc" | "desc"
  ) => {
    setSort({ field: sortField, direction: sortDirection });
  };

  const transactionColumns: ColumnDefinition<TransactionResponse>[] = [
    {
      header: "ID",
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
      header: "Account ID",
      accessorKey: "accountId",
      sortable: true,
      sortField: "accountId",
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

  return (
    <DashboardLayout pageTitle="System-Wide Transactions" navType="admin">
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <FormField
            label="Account ID"
            type="text"
            id="accountId"
            name="accountId"
            value={filters.accountId || ""}
            onChange={handleFilterChange}
            placeholder="Enter Account UUID"
          />
        </div>
      </div>

      {apiError && (
        <AlertMessage
          type="error"
          title="Error Loading Transactions"
          message={getSafeErrorMessage(apiError, "system transactions")}
        />
      )}
      <DataTable<TransactionResponse>
        columns={transactionColumns}
        data={transactionsData?.content || []}
        isLoading={isLoading || isFetching}
        error={
          apiError as AppFetchBaseQueryError | AppSerializedError | undefined
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
    </DashboardLayout>
  );
};
