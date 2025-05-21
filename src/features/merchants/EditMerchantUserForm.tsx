import React, { useState, useEffect } from "react";
import { useUpdateMerchantUserMutation } from "../../store/api";
import type {
  UpdateMerchantUserRequest,
  MerchantUserResponse,
} from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

function isDataWithMessage(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message") &&
    typeof (data as { message: unknown }).message === "string"
  );
}

interface EditMerchantUserFormProps {
  merchantUser: MerchantUserResponse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const USER_ROLES: Array<"ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"> = [
  "MERCHANT_USER",
  "MERCHANT_ADMIN",
  "ADMIN",
];

export const EditMerchantUserForm: React.FC<EditMerchantUserFormProps> = ({
  merchantUser,
  onSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState(merchantUser.email);
  const [fullName, setFullName] = useState(merchantUser.fullName);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(merchantUser.role);
  const [enabled, setEnabled] = useState(merchantUser.enabled);

  const [
    updateMerchantUser,
    { isLoading, error: apiCallError, isSuccess, data: updatedUser },
  ] = useUpdateMerchantUserMutation();

  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isSuccess && updatedUser) {
      setFormFeedback({
        type: "success",
        message: `User "${updatedUser.username || merchantUser.username}" updated successfully!`,
      });
      if (onSuccess) onSuccess();
    }
  }, [isSuccess, updatedUser, onSuccess]);

  useEffect(() => {
    if (apiCallError) {
      const error = apiCallError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (typeof error === "object" && error !== null) {
        if ("data" in error && isDataWithMessage(error.data)) {
          message = error.data.message;
        } else if ("message" in error && typeof error.message === "string") {
          message = error.message;
        } else if (
          "status" in error &&
          "error" in error &&
          typeof (error as AppFetchBaseQueryError).error === "string"
        ) {
          message = (error as AppFetchBaseQueryError).error as string;
        }
      }
      setFormFeedback({ type: "error", message });
    }
  }, [apiCallError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const payload: UpdateMerchantUserRequest = {};
    let changesMade = false;

    if (email !== merchantUser.email) {
      payload.email = email;
      changesMade = true;
    }
    if (fullName !== merchantUser.fullName) {
      payload.fullName = fullName;
      changesMade = true;
    }
    if (password) {
      payload.password = password;
      changesMade = true;
    }
    if (role !== merchantUser.role) {
      payload.role = role;
      changesMade = true;
    }
    if (enabled !== merchantUser.enabled) {
      payload.enabled = enabled;
      changesMade = true;
    }

    if (!changesMade) {
      setFormFeedback({ type: "info", message: "No changes detected." });
      return;
    }

    if (
      payload.password &&
      (payload.password.length < 8 || payload.password.length > 100)
    ) {
      setFormFeedback({
        type: "error",
        message: "New password must be 8-100 characters.",
      });
      return;
    }
    if (payload.email && !payload.email.includes("@")) {
      setFormFeedback({ type: "error", message: "Invalid email format." });
      return;
    }
    if (payload.fullName !== undefined && payload.fullName.trim() === "") {
      setFormFeedback({
        type: "error",
        message: "Full name cannot be empty if provided.",
      });
      return;
    }

    await updateMerchantUser({ userId: merchantUser.userId, payload });
  };

  return (
    <div className="">
      {formFeedback && (
        <AlertMessage
          type={formFeedback.type}
          message={formFeedback.message}
          title={
            formFeedback.type === "success"
              ? "Success"
              : formFeedback.type === "info"
                ? "Info"
                : "Update Error"
          }
        />
      )}
      <p className="text-sm text-gray-600 mb-4">
        Editing user:{" "}
        <span className="font-semibold">{merchantUser.username}</span> (ID:{" "}
        {merchantUser.userId})
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <FormField
          label="Full Name"
          type="text"
          id="edit_mu_fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <FormField
          label="Email"
          type="email"
          id="edit_mu_email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="New Password (optional)"
          type="password"
          id="edit_mu_password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current"
          autoComplete="new-password"
        />
        <div>
          <label
            htmlFor="edit_mu_role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role
          </label>
          <select
            id="edit_mu_role"
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value as "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
              )
            }
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          <label htmlFor="edit_mu_enabled" className="flex items-center">
            <input
              type="checkbox"
              id="edit_mu_enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enabled</span>
          </label>
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
            text="Update User"
            loadingText="Updating..."
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
          />
        </div>
      </form>
    </div>
  );
};
