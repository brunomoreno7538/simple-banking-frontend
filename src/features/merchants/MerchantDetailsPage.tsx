import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { FormField } from "../../components/common/FormField";
import {
  useGetMerchantByIdQuery,
  useGetMerchantUsersByMerchantIdQuery,
  useGetTransactionsForAccountQuery,
  useGetAccountBalanceQuery,
  useDeleteMerchantUserMutation,
} from "../../store/api";
import type {
  MerchantUserResponse,
  TransactionResponse,
  PageableRequest,
  AccountTransactionsRequestParams,
} from "../../store/api";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { AlertMessage } from "../../components/common/AlertMessage";
import { Modal } from "../../components/common/Modal";
import { CreateMerchantUserForm } from "./CreateMerchantUserForm";
import { EditMerchantUserForm } from "./EditMerchantUserForm";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { getSafeErrorMessage } from "../../utils/errorUtils";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";
import { formatTimestampToLocaleString } from "../../utils/dateUtils";

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZES_USERS = [5, 10, 20];
const DEFAULT_PAGE_SIZES_TRANSACTIONS = [10, 20, 50];

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 px-4 sm:px-6">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {value || "N/A"}
    </dd>
  </div>
);

const formatInputDateToISO = (inputDate?: string) => {
  if (!inputDate) return undefined;
  return inputDate.length === 16 ? `${inputDate}:00` : inputDate;
};

export const MerchantDetailsPage: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();

  const [usersPageArgs, setUsersPageArgs] = useState<PageableRequest>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
  });
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] =
    useState<MerchantUserResponse | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<MerchantUserResponse | null>(
    null
  );

  const [transactionFilters, setTransactionFilters] = useState<
    Omit<AccountTransactionsRequestParams, "page" | "size" | "sort">
  >({
    startDate: "",
    endDate: "",
    type: undefined,
  });
  const [transactionPaginationArgs, setTransactionPaginationArgs] = useState<{
    page: number;
    size: number;
  }>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
  });
  const [transactionSortArgs, setTransactionSortArgs] = useState<{
    field: keyof TransactionResponse | string;
    direction: "asc" | "desc";
  }>({
    field: "timestamp",
    direction: "desc",
  });
  const [debouncedTransactionFilters, setDebouncedTransactionFilters] =
    useState(transactionFilters);

  const [deleteMerchantUser, { isLoading: isDeletingUser }] =
    useDeleteMerchantUserMutation();

  const {
    data: merchant,
    error: merchantApiError,
    isLoading: merchantLoading,
  } = useGetMerchantByIdQuery(merchantId!, { skip: !merchantId });

  const accountId = merchant?.accountId;

  const {
    data: balanceData,
    error: balanceApiError,
    isLoading: balanceLoading,
  } = useGetAccountBalanceQuery(accountId!, { skip: !accountId });

  const {
    data: usersData,
    error: usersApiError,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetMerchantUsersByMerchantIdQuery(
    { merchantId: merchantId!, params: usersPageArgs },
    { skip: !merchantId }
  );

  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedTransactionFilters(transactionFilters),
      500
    );
    return () => clearTimeout(handler);
  }, [transactionFilters]);

  const finalTransactionQueryArgs: AccountTransactionsRequestParams = {
    startDate: formatInputDateToISO(debouncedTransactionFilters.startDate),
    endDate: formatInputDateToISO(debouncedTransactionFilters.endDate),
    type: debouncedTransactionFilters.type,
    page: transactionPaginationArgs.page,
    size: transactionPaginationArgs.size,
    sort: `${String(transactionSortArgs.field)},${transactionSortArgs.direction}`,
  };

  const {
    data: pagedTransactionsResponse,
    error: transactionsApiError,
    isLoading: transactionsLoading,
    isFetching: transactionsFetching,
  } = useGetTransactionsForAccountQuery(
    { accountId: accountId!, params: finalTransactionQueryArgs },
    { skip: !accountId }
  );
  const currentTransactionsData = pagedTransactionsResponse?.transactionsPage;
  const transactionSummary = pagedTransactionsResponse?.summary;

  if (merchantLoading)
    return (
      <DashboardLayout pageTitle="Loading Merchant Details..." navType="admin">
        <p className="text-center p-8">Loading basic merchant information...</p>
      </DashboardLayout>
    );
  if (merchantApiError && !merchant)
    return (
      <DashboardLayout pageTitle="Error" navType="admin">
        <AlertMessage
          type="error"
          title="Failed to load merchant"
          message={getSafeErrorMessage(
            merchantApiError as AppFetchBaseQueryError | SerializedError,
            "merchant details"
          )}
        />
      </DashboardLayout>
    );
  if (!merchant)
    return (
      <DashboardLayout pageTitle="Not Found" navType="admin">
        <AlertMessage
          type="warning"
          title="Merchant not found"
          message={`Merchant with ID ${merchantId} could not be found or is still loading.`}
        />
      </DashboardLayout>
    );

  const merchantUserColumns: ColumnDefinition<MerchantUserResponse>[] = [
    {
      header: "Username",
      accessorKey: "username",
      cellClassName: "text-gray-900 font-medium",
    },
    { header: "Full Name", accessorKey: "fullName" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    {
      header: "Enabled",
      cell: (row) =>
        row.enabled ? (
          <span className="text-green-600 font-semibold">Yes</span>
        ) : (
          <span className="text-red-600 font-semibold">No</span>
        ),
    },
    {
      header: "Actions",
      cell: (row) => {
        return (
          <div className="space-x-2 whitespace-nowrap">
            <button
              onClick={() => handleOpenEditUserModal(row)}
              className="text-indigo-600 hover:text-indigo-900 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteConfirmModal(row)}
              className="text-red-600 hover:text-red-900 font-medium"
              disabled={isDeletingUser && userToDelete?.userId === row.userId}
            >
              {isDeletingUser && userToDelete?.userId === row.userId
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        );
      },
    },
  ];

  const transactionColumns: ColumnDefinition<TransactionResponse>[] = [
    {
      header: "ID",
      accessorKey: "transactionId",
      sortable: true,
      sortField: "transactionId",
      cell: (row) => (
        <span title={row.transactionId} className="cursor-pointer">
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

  const handleUserCreated = () => {
    setIsCreateUserModalOpen(false);
  };

  const handleOpenEditUserModal = (user: MerchantUserResponse) => {
    setSelectedUserToEdit(user);
    setIsEditUserModalOpen(true);
  };

  const handleUserUpdated = () => {
    setIsEditUserModalOpen(false);
    setSelectedUserToEdit(null);
  };

  const openDeleteConfirmModal = (user: MerchantUserResponse) => {
    setUserToDelete(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !merchantId) return;
    try {
      await deleteMerchantUser({
        userId: userToDelete.userId,
        merchantId,
      }).unwrap();
      alert(`User ${userToDelete.username} deleted successfully.`);
    } catch (err) {
      const typedError = err as AppFetchBaseQueryError | SerializedError;
      alert(
        `Failed to delete user: ${getSafeErrorMessage(typedError, "delete user")}`
      );
    }
    setIsDeleteConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleTransactionFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTransactionFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };
  const handleTransactionPageChange = (newPage: number) =>
    setTransactionPaginationArgs((prev) => ({ ...prev, page: newPage }));
  const handleTransactionPageSizeChange = (newPageSize: number) =>
    setTransactionPaginationArgs({ page: 0, size: newPageSize });
  const handleTransactionSortChange = (
    sortField: keyof TransactionResponse,
    sortDirection: "asc" | "desc"
  ) => {
    setTransactionSortArgs({ field: sortField, direction: sortDirection });
  };

  return (
    <DashboardLayout
      pageTitle={merchant ? `Details: ${merchant.name}` : "Loading Merchant..."}
      navType="admin"
    >
      <div className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Merchant Information
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl className="sm:divide-y sm:divide-gray-200">
              <DetailItem label="Merchant ID" value={merchant.merchantId} />
              <DetailItem label="Name" value={merchant.name} />
              <DetailItem label="CNPJ" value={merchant.cnpj} />
              <DetailItem label="Account ID" value={accountId || "N/A"} />
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Account Balance
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5">
            {balanceLoading && (
              <p className="text-gray-500">Loading balance...</p>
            )}
            {balanceApiError && (
              <AlertMessage
                type="error"
                title="Balance Error"
                message={getSafeErrorMessage(
                  balanceApiError,
                  "account balance"
                )}
              />
            )}
            {balanceData && (
              <p className="text-3xl font-semibold text-gray-800">
                ${Number(balanceData.balance).toFixed(2)}
              </p>
            )}
            {!balanceData &&
              !balanceLoading &&
              !balanceApiError &&
              !accountId && (
                <p className="text-gray-500">
                  Merchant has no associated Account ID.
                </p>
              )}
            {!balanceData &&
              !balanceLoading &&
              !balanceApiError &&
              accountId && (
                <p className="text-gray-500">
                  No balance information available for this account.
                </p>
              )}
          </div>
        </div>

        <div className="">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Merchant Users
            </h3>
            <button
              type="button"
              onClick={() => setIsCreateUserModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              + Create User
            </button>
          </div>
          {usersApiError && (
            <AlertMessage
              type="error"
              title="Users Error"
              message={getSafeErrorMessage(usersApiError, "merchant users")}
            />
          )}
          <DataTable<MerchantUserResponse>
            columns={merchantUserColumns}
            data={usersData?.content || []}
            isLoading={usersLoading || usersFetching}
            error={
              usersApiError as
                | AppFetchBaseQueryError
                | SerializedError
                | undefined
            }
            page={usersData?.number ?? usersPageArgs.page ?? 0}
            pageSize={
              usersData?.size ?? usersPageArgs.size ?? INITIAL_PAGE_SIZE
            }
            totalElements={usersData?.totalElements}
            onPageChange={(p) =>
              setUsersPageArgs((prev) => ({ ...prev, page: p }))
            }
            onPageSizeChange={(s) =>
              setUsersPageArgs((prev) => ({ ...prev, size: s, page: 0 }))
            }
            availablePageSizes={DEFAULT_PAGE_SIZES_USERS}
            getRowId={(user) => user.userId}
          />
        </div>

        <div className="">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Account Transactions
          </h3>

          {accountId && (
            <div className="mb-6 p-4 bg-gray-50 shadow rounded-lg">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                Filter Transactions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Start Date/Time"
                  type="datetime-local"
                  id="txStartDate"
                  name="startDate"
                  value={transactionFilters.startDate || ""}
                  onChange={handleTransactionFilterChange}
                />
                <FormField
                  label="End Date/Time"
                  type="datetime-local"
                  id="txEndDate"
                  name="endDate"
                  value={transactionFilters.endDate || ""}
                  onChange={handleTransactionFilterChange}
                />
                <div>
                  <label
                    htmlFor="txType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Type
                  </label>
                  <select
                    id="txType"
                    name="type"
                    value={transactionFilters.type || ""}
                    onChange={handleTransactionFilterChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">All</option>
                    <option value="PAYIN">PAYIN</option>
                    <option value="PAYOUT">PAYOUT</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {accountId && transactionSummary && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow">
              <h4 className="text-md font-semibold text-blue-700">
                Summary for Filtered View
              </h4>
              <p className="text-sm text-blue-600">
                Total Transactions: {transactionSummary.quantity}
              </p>
              <p className="text-sm text-blue-600">
                Total Amount: ${transactionSummary.totalAmount.toFixed(2)}
              </p>
            </div>
          )}

          {transactionsApiError && (
            <AlertMessage
              type="error"
              title="Transactions Error"
              message={getSafeErrorMessage(
                transactionsApiError,
                "account transactions"
              )}
            />
          )}
          {accountId ? (
            <DataTable<TransactionResponse>
              columns={transactionColumns}
              data={currentTransactionsData?.content || []}
              isLoading={transactionsLoading || transactionsFetching}
              error={
                transactionsApiError as
                  | AppFetchBaseQueryError
                  | SerializedError
                  | undefined
              }
              page={
                currentTransactionsData?.number ??
                transactionPaginationArgs.page ??
                0
              }
              pageSize={
                currentTransactionsData?.size ??
                transactionPaginationArgs.size ??
                INITIAL_PAGE_SIZE
              }
              totalElements={currentTransactionsData?.totalElements}
              onPageChange={handleTransactionPageChange}
              onPageSizeChange={handleTransactionPageSizeChange}
              availablePageSizes={DEFAULT_PAGE_SIZES_TRANSACTIONS}
              getRowId={(tx) => tx.transactionId}
              onSortChange={handleTransactionSortChange}
              currentSortField={
                transactionSortArgs.field as keyof TransactionResponse
              }
              currentSortDirection={transactionSortArgs.direction}
            />
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                Merchant account ID not available to fetch transactions.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        title="Create New Merchant User"
        size="lg"
      >
        {merchantId && (
          <CreateMerchantUserForm
            merchantId={merchantId}
            onSuccess={handleUserCreated}
            onCancel={() => setIsCreateUserModalOpen(false)}
            allowedRoles={["MERCHANT_USER", "MERCHANT_ADMIN"]}
          />
        )}
      </Modal>

      {selectedUserToEdit && (
        <Modal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUserToEdit(null);
          }}
          title={`Edit User: ${selectedUserToEdit.username}`}
          size="lg"
        >
          <EditMerchantUserForm
            merchantUser={selectedUserToEdit}
            onSuccess={handleUserUpdated}
            onCancel={() => {
              setIsEditUserModalOpen(false);
              setSelectedUserToEdit(null);
            }}
          />
        </Modal>
      )}

      {userToDelete && (
        <ConfirmationModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => {
            setIsDeleteConfirmModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDeleteUser}
          title="Delete Merchant User"
          message={`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`}
          confirmButtonText={isDeletingUser ? "Deleting..." : "Delete"}
          isConfirming={isDeletingUser}
        />
      )}
    </DashboardLayout>
  );
};
