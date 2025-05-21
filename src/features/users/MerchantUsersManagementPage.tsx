import React, { useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { AlertMessage } from "../../components/common/AlertMessage";
import { Modal } from "../../components/common/Modal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { CreateMerchantUserForm } from "../merchants/CreateMerchantUserForm";
import { EditMerchantUserForm } from "../merchants/EditMerchantUserForm";
import {
  useGetMyMerchantProfileQuery,
  useGetMerchantUsersByMerchantIdQuery,
  useDeleteMerchantUserMutation,
} from "../../store/api";
import type { MerchantUserResponse, PageableRequest } from "../../store/api";
import { getSafeErrorMessage } from "../../utils/errorUtils";

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZES = [10, 20, 50];

export const MerchantUsersManagementPage: React.FC = () => {
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useGetMyMerchantProfileQuery();

  const merchantId = profileData?.merchant?.merchantId;
  const loggedInUser = profileData?.user;
  const isMerchantAdmin = loggedInUser?.role === "MERCHANT_ADMIN";

  const [queryArgs, setQueryArgs] = useState<PageableRequest>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] =
    useState<MerchantUserResponse | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<MerchantUserResponse | null>(
    null
  );

  const {
    data: usersData,
    error: usersApiError,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetMerchantUsersByMerchantIdQuery(
    { merchantId: merchantId!, params: queryArgs },
    { skip: !merchantId || profileLoading }
  );

  const [deleteMerchantUser, { isLoading: isDeletingUser }] =
    useDeleteMerchantUserMutation();

  const handlePageChange = (newPage: number) =>
    setQueryArgs((prev) => ({ ...prev, page: newPage }));
  const handlePageSizeChange = (newPageSize: number) =>
    setQueryArgs((prev) => ({ ...prev, size: newPageSize, page: 0 }));

  const handleUserCreatedOrUpdated = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUserToEdit(null);
  };

  const openEditModal = (user: MerchantUserResponse) => {
    setSelectedUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: MerchantUserResponse) => {
    setUserToDelete(user);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !merchantId) return;
    try {
      await deleteMerchantUser({
        userId: userToDelete.userId,
        merchantId,
      }).unwrap();
    } catch (err) {
      alert(getSafeErrorMessage(err, "delete user"));
    }
    setIsDeleteConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const columns: ColumnDefinition<MerchantUserResponse>[] = [
    {
      header: "Username",
      accessorKey: "username",
      cellClassName: "font-medium text-gray-900",
    },
    { header: "Full Name", accessorKey: "fullName" },
    { header: "Email", accessorKey: "email" },
    { header: "Role", accessorKey: "role" },
    {
      header: "Enabled",
      cell: (row) =>
        row.enabled ? (
          <span className="text-green-600">Yes</span>
        ) : (
          <span className="text-red-500">No</span>
        ),
    },
    {
      header: "Actions",
      cell: (user) => {
        const isSelf = user.userId === loggedInUser?.userId;
        return (
          <div className="space-x-2 whitespace-nowrap">
            <button
              onClick={() => openEditModal(user)}
              className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={isSelf}
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteModal(user)}
              className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={isSelf || isDeletingUser}
            >
              {isDeletingUser && userToDelete?.userId === user.userId
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        );
      },
    },
  ];

  if (profileLoading)
    return (
      <DashboardLayout pageTitle="Loading..." navType="merchant">
        <p>Loading profile...</p>
      </DashboardLayout>
    );
  if (profileError)
    return (
      <DashboardLayout pageTitle="Error" navType="merchant">
        <AlertMessage
          type="error"
          title="Profile Error"
          message={getSafeErrorMessage(profileError, "profile")}
        />
      </DashboardLayout>
    );
  if (!isMerchantAdmin)
    return (
      <DashboardLayout pageTitle="Access Denied" navType="merchant">
        <AlertMessage
          type="error"
          title="Access Denied"
          message="You do not have permission to manage users."
        />
      </DashboardLayout>
    );
  if (!merchantId)
    return (
      <DashboardLayout pageTitle="Error" navType="merchant">
        <AlertMessage
          type="error"
          title="Merchant Not Found"
          message="Merchant details not found for your profile."
        />
      </DashboardLayout>
    );

  return (
    <DashboardLayout pageTitle="Manage Merchant Users" navType="merchant">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Create User
        </button>
      </div>

      {usersApiError && (
        <AlertMessage
          type="error"
          title="Error Loading Users"
          message={getSafeErrorMessage(usersApiError, "users list")}
        />
      )}

      <DataTable<MerchantUserResponse>
        columns={columns}
        data={usersData?.content || []}
        isLoading={usersLoading || usersFetching || profileLoading}
        error={usersApiError}
        page={usersData?.number ?? queryArgs.page ?? 0}
        pageSize={usersData?.size ?? queryArgs.size ?? INITIAL_PAGE_SIZE}
        totalElements={usersData?.totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        availablePageSizes={DEFAULT_PAGE_SIZES}
        getRowId={(user) => user.userId}
      />

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Merchant User"
        size="lg"
      >
        <CreateMerchantUserForm
          merchantId={merchantId!}
          onSuccess={handleUserCreatedOrUpdated}
          onCancel={() => setIsCreateModalOpen(false)}
          allowedRoles={["MERCHANT_USER", "MERCHANT_ADMIN"]}
        />
      </Modal>

      {selectedUserToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUserToEdit(null);
          }}
          title={`Edit User: ${selectedUserToEdit.username}`}
          size="lg"
        >
          <EditMerchantUserForm
            merchantUser={selectedUserToEdit}
            onSuccess={handleUserCreatedOrUpdated}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUserToEdit(null);
            }}
          />
        </Modal>
      )}

      {userToDelete && (
        <ConfirmationModal
          isOpen={isDeleteConfirmModalOpen}
          onClose={() => {
            setUserToDelete(null);
            setIsDeleteConfirmModalOpen(false);
          }}
          onConfirm={confirmDelete}
          title="Delete Merchant User"
          message={`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`}
          confirmButtonText={isDeletingUser ? "Deleting..." : "Delete"}
          isConfirming={isDeletingUser}
        />
      )}
    </DashboardLayout>
  );
};
