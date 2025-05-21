import React, { useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { DataTable } from "../../components/common/DataTable";
import type { ColumnDefinition } from "../../components/common/DataTable";
import { AlertMessage } from "../../components/common/AlertMessage";
import { Modal } from "../../components/common/Modal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { CreateCoreUserForm } from "./CreateCoreUserForm";
import { EditCoreUserForm } from "./EditCoreUserForm";
import {
  useGetAllCoreUsersQuery,
  useDeleteCoreUserMutation,
} from "../../store/api";
import type { CoreUserResponse, PageableRequest } from "../../store/api";
import { getSafeErrorMessage } from "../../utils/errorUtils";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

const INITIAL_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZES = [10, 20, 50];

export const CoreUsersManagementPage: React.FC = () => {
  const [queryArgs, setQueryArgs] = useState<PageableRequest>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
    sort: "username,asc",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] =
    useState<CoreUserResponse | null>(null);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
    useState(false);
  const [userToDelete, setUserToDelete] = useState<CoreUserResponse | null>(
    null
  );

  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetAllCoreUsersQuery(queryArgs);

  const loggedInAdminProfile: CoreUserResponse | undefined =
    usersData?.content?.find((u) => u.role === "ADMIN");
  const loggedInAdminUserId = loggedInAdminProfile?.userId;

  const [deleteCoreUser, { isLoading: isDeletingUser }] =
    useDeleteCoreUserMutation();

  const handlePageChange = (newPage: number) =>
    setQueryArgs((prev) => ({ ...prev, page: newPage }));
  const handlePageSizeChange = (newPageSize: number) =>
    setQueryArgs((prev) => ({ ...prev, size: newPageSize, page: 0 }));
  const handleSortChange = (field: string, direction: "asc" | "desc") => {
    setQueryArgs((prev) => ({ ...prev, sort: `${field},${direction}` }));
  };
  const handleUserCreatedOrUpdated = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedUserToEdit(null);
  };
  const openEditModal = (user: CoreUserResponse) => {
    if (user.userId === loggedInAdminUserId) {
      alert(
        "As a security measure, you cannot edit your own ADMIN account directly from this table. Please use specific profile settings if available, or ask another admin."
      );
      return;
    }
    setSelectedUserToEdit(user);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (user: CoreUserResponse) => {
    if (user.userId === loggedInAdminUserId) {
      alert("You cannot delete your own ADMIN account.");
      return;
    }
    setUserToDelete(user);
    setIsDeleteConfirmModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteCoreUser(userToDelete.userId).unwrap();
    } catch (err) {
      alert(getSafeErrorMessage(err, "delete core user"));
    }
    setIsDeleteConfirmModalOpen(false);
    setUserToDelete(null);
  };
  const columns: ColumnDefinition<CoreUserResponse>[] = [
    {
      header: "Username",
      accessorKey: "username",
      sortable: true,
      sortField: "username",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Full Name",
      accessorKey: "fullName",
      sortable: true,
      sortField: "fullName",
    },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
      sortField: "email",
    },
    { header: "Role", accessorKey: "role", sortable: true, sortField: "role" },
    {
      header: "Enabled",
      accessorKey: "enabled",
      sortable: true,
      sortField: "enabled",
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
        const isSelf = user.userId === loggedInAdminUserId;
        return (
          <div className="space-x-2 whitespace-nowrap">
            <button
              onClick={() => openEditModal(user)}
              className="text-indigo-600 hover:text-indigo-900"
              disabled={isSelf}
            >
              Edit
            </button>
            <button
              onClick={() => openDeleteModal(user)}
              className="text-red-600 hover:text-red-900"
              disabled={
                isSelf ||
                (isDeletingUser && userToDelete?.userId === user.userId)
              }
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

  return (
    <DashboardLayout pageTitle="Manage Core Users" navType="admin">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Create Core User
        </button>
      </div>
      {usersError && (
        <AlertMessage
          type="error"
          title="Error Loading Core Users"
          message={getSafeErrorMessage(
            usersError as AppFetchBaseQueryError | SerializedError | undefined,
            "core users list"
          )}
        />
      )}
      <DataTable<CoreUserResponse>
        columns={columns}
        data={usersData?.content || []}
        isLoading={usersLoading || usersFetching}
        error={
          usersError as AppFetchBaseQueryError | SerializedError | undefined
        }
        page={usersData?.number ?? queryArgs.page ?? 0}
        pageSize={usersData?.size ?? queryArgs.size ?? INITIAL_PAGE_SIZE}
        totalElements={usersData?.totalElements}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        availablePageSizes={DEFAULT_PAGE_SIZES}
        getRowId={(user) => user.userId}
        onSortChange={
          handleSortChange as (
            sortField: keyof CoreUserResponse,
            sortDirection: "asc" | "desc"
          ) => void
        }
        currentSortField={
          queryArgs.sort?.split(",")[0] as keyof CoreUserResponse
        }
        currentSortDirection={
          (queryArgs.sort?.split(",")[1] as "asc" | "desc") || "asc"
        }
      />
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Core User"
        size="lg"
      >
        <CreateCoreUserForm
          onSuccess={handleUserCreatedOrUpdated}
          onCancel={() => setIsCreateModalOpen(false)}
          allowedRoles={["ADMIN"]}
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
          <EditCoreUserForm
            coreUser={selectedUserToEdit}
            onSuccess={handleUserCreatedOrUpdated}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUserToEdit(null);
            }}
            loggedInUserId={loggedInAdminUserId}
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
          title="Delete Core User"
          message={`Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.`}
          confirmButtonText={isDeletingUser ? "Deleting..." : "Delete"}
          isConfirming={isDeletingUser}
        />
      )}
    </DashboardLayout>
  );
};
