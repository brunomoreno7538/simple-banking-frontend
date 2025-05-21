import React, { useState, useEffect } from "react";
import { useUpdateCoreUserMutation } from "../../store/api";
import type { CoreUserResponse, UpdateCoreUserRequest } from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

interface EditCoreUserFormProps {
  coreUser: CoreUserResponse;
  onSuccess?: (updatedUser: CoreUserResponse) => void;
  onCancel?: () => void;
  loggedInUserId?: string;
}

const CORE_USER_ROLES: ("ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")[] = [
  "ADMIN",
  "MERCHANT_ADMIN",
  "MERCHANT_USER",
];

export const EditCoreUserForm: React.FC<EditCoreUserFormProps> = ({
  coreUser,
  onSuccess,
  onCancel,
  loggedInUserId,
}) => {
  const [email, setEmail] = useState(coreUser.email || "");
  const [fullName, setFullName] = useState(coreUser.fullName || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(coreUser.role || "MERCHANT_USER");
  const [enabled, setEnabled] = useState(coreUser.enabled ?? true);
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const [
    updateCoreUser,
    { isLoading, error: apiError, isSuccess, data: updatedUser },
  ] = useUpdateCoreUserMutation();

  const isSelfEdit = coreUser.userId === loggedInUserId;

  useEffect(() => {
    if (isSuccess && updatedUser) {
      setFormFeedback({
        type: "success",
        message: `User "${updatedUser.username}" updated successfully!`,
      });
      if (onSuccess) onSuccess(updatedUser);
    } else if (apiError) {
      const err = apiError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data &&
        typeof (err.data as { message?: string }).message === "string"
      )
        message = (err.data as { message: string }).message;
      else if ("message" in err && typeof err.message === "string")
        message = err.message;
      else if ("error" in err && typeof err.error === "string")
        message = err.error;
      setFormFeedback({ type: "error", message });
    }
  }, [isSuccess, updatedUser, apiError, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const payload: UpdateCoreUserRequest = {
      email: email !== coreUser.email ? email : undefined,
      fullName: fullName !== coreUser.fullName ? fullName : undefined,
      password: password || undefined,
      role:
        isSelfEdit && coreUser.role === "ADMIN"
          ? undefined
          : role !== coreUser.role
            ? (role as "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")
            : undefined,
      enabled:
        isSelfEdit && coreUser.role === "ADMIN"
          ? undefined
          : enabled !== coreUser.enabled
            ? enabled
            : undefined,
    };
    Object.keys(payload).forEach(
      (key) =>
        payload[key as keyof UpdateCoreUserRequest] === undefined &&
        delete payload[key as keyof UpdateCoreUserRequest]
    );

    if (Object.keys(payload).length === 0) {
      setFormFeedback({
        type: "info",
        message: "No changes detected to update.",
      });
      return;
    }
    await updateCoreUser({ userId: coreUser.userId, payload });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFeedback && (
        <AlertMessage
          type={formFeedback.type}
          message={formFeedback.message}
          title={
            formFeedback.type === "success"
              ? "Success"
              : formFeedback.type === "info"
                ? "Information"
                : "Error"
          }
        />
      )}
      <FormField
        label="Username (cannot be changed)"
        type="text"
        id="core_edit_username"
        name="username"
        value={coreUser.username}
        onChange={() => {}}
        disabled
      />
      <FormField
        label="Email"
        type="email"
        id="core_edit_email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FormField
        label="Full Name"
        type="text"
        id="core_edit_fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <FormField
        label="New Password (optional)"
        type="password"
        id="core_edit_password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <div>
        <label
          htmlFor="core_edit_role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Role
        </label>
        <select
          id="core_edit_role"
          name="role"
          value={role}
          onChange={(e) =>
            setRole(
              e.target.value as "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
            )
          }
          disabled={isSelfEdit && coreUser.role === "ADMIN"}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {CORE_USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
        {isSelfEdit && coreUser.role === "ADMIN" && (
          <p className="mt-1 text-xs text-gray-500">
            ADMINs cannot change their own role.
          </p>
        )}
      </div>
      <div className="flex items-center">
        <input
          id="core_edit_enabled"
          name="enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={isSelfEdit && coreUser.role === "ADMIN" && coreUser.enabled}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="core_edit_enabled"
          className="ml-2 block text-sm text-gray-900"
        >
          Enabled
        </label>
        {isSelfEdit && coreUser.role === "ADMIN" && coreUser.enabled && (
          <p className="mt-1 text-xs text-gray-500">
            ADMINs cannot disable their own account.
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <SubmitButton
          isLoading={isLoading}
          text="Update Core User"
          loadingText="Updating..."
        />
      </div>
    </form>
  );
};
