import React, { useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { CreateMerchantForm } from "./CreateMerchantForm";
import { useGetAllMerchantsQuery } from "../../store/api";
import type { MerchantResponse, PageableRequest } from "../../store/api";
import { AlertMessage } from "../../components/common/AlertMessage";
import { Modal } from "../../components/common/Modal";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { Link } from "react-router-dom";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";
import { getSafeErrorMessage } from "../../utils/errorUtils";

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];
const INITIAL_PAGE_SIZE = DEFAULT_PAGE_SIZES[0];

export const MerchantsPage: React.FC = () => {
  const [queryArgs, setQueryArgs] = useState<PageableRequest>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: merchantsData,
    error: merchantsApiError,
    isLoading: merchantsLoading,
    isFetching: merchantsIsFetching,
  } = useGetAllMerchantsQuery(queryArgs);

  const handlePageChange = (newPage: number) => {
    setQueryArgs((prevArgs) => ({ ...prevArgs, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setQueryArgs((prevArgs) => ({ ...prevArgs, size: newPageSize, page: 0 }));
  };

  const handleMerchantCreated = () => {
    setIsCreateModalOpen(false);
    setQueryArgs((prevArgs) => ({ ...prevArgs, page: 0 }));
  };

  const merchantColumns: ColumnDefinition<MerchantResponse>[] = [
    {
      header: "Name",
      cell: (row) => (
        <Link
          to={`/admin/merchants/${row.merchantId}`}
          className="text-indigo-600 hover:text-indigo-900 hover:underline"
        >
          {row.name}
        </Link>
      ),
      cellClassName: "text-gray-900 font-medium",
    },
    { header: "Merchant ID", accessorKey: "merchantId" },
    { header: "CNPJ", accessorKey: "cnpj" },
    {
      header: "Account ID",
      cell: (row) => (row.accountId ? <>{row.accountId}</> : "N/A"),
    },
  ];

  return (
    <DashboardLayout pageTitle="Merchants Management" navType="admin">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Create Merchant
        </button>
      </div>

      {merchantsApiError && (
        <AlertMessage
          type="error"
          title="Error Loading Merchants"
          message={getSafeErrorMessage(
            merchantsApiError as AppFetchBaseQueryError | SerializedError,
            "merchants list"
          )}
        />
      )}
      <DataTable<MerchantResponse>
        columns={merchantColumns}
        data={merchantsData?.content || []}
        isLoading={merchantsLoading || merchantsIsFetching}
        error={
          merchantsApiError as
            | AppFetchBaseQueryError
            | SerializedError
            | undefined
        }
        page={merchantsData?.number ?? queryArgs.page ?? 0}
        pageSize={merchantsData?.size ?? queryArgs.size ?? INITIAL_PAGE_SIZE}
        totalElements={merchantsData?.totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        availablePageSizes={DEFAULT_PAGE_SIZES}
        getRowId={(merchant) => merchant.merchantId}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Merchant"
        size="lg"
      >
        <CreateMerchantForm onSuccess={handleMerchantCreated} />
      </Modal>
    </DashboardLayout>
  );
};
