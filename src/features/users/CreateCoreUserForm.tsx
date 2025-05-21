import React, { useState, useEffect } from "react";
import { useCreateCoreUserMutation } from "../../store/api";
import type { CreateCoreUserRequest, CoreUserResponse } from "../../store/api";
import { FormField } from "../../components/common/FormField";
import { SubmitButton } from "../../components/common/SubmitButton";
import { AlertMessage } from "../../components/common/AlertMessage";
import type { SerializedError } from "@reduxjs/toolkit";
import type { AppFetchBaseQueryError } from "../../utils/errorUtils";

interface CreateCoreUserFormProps {
  onSuccess?: (newUser: CoreUserResponse) => void;
  onCancel?: () => void;
  allowedRoles?: ("ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")[];
}

const ALL_CORE_USER_ROLES: ("ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER")[] = [
  "ADMIN",
  "MERCHANT_ADMIN",
  "MERCHANT_USER",
];

export const CreateCoreUserForm: React.FC<CreateCoreUserFormProps> = ({
  onSuccess,
  onCancel,
  allowedRoles = ALL_CORE_USER_ROLES,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<
    "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
  >(allowedRoles.length > 0 ? allowedRoles[0] : "MERCHANT_USER");
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [
    createCoreUser,
    { isLoading, error: apiError, isSuccess, data: newUser },
  ] = useCreateCoreUserMutation();

  useEffect(() => {
    if (isSuccess && newUser) {
      setFormFeedback({
        type: "success",
        message: `Core user "${newUser.username}" created successfully!`,
      });
      setUsername("");
      setPassword("");
      setEmail("");
      setFullName("");
      setRole(allowedRoles.length > 0 ? allowedRoles[0] : "MERCHANT_USER");
      if (onSuccess) onSuccess(newUser);
    } else if (apiError) {
      const err = apiError as AppFetchBaseQueryError | SerializedError;
      let message = "An unexpected error occurred.";
      if (
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
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
  }, [isSuccess, newUser, apiError, onSuccess, allowedRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);
    if (username.length < 3 || username.length > 50) {
      setFormFeedback({
        type: "error",
        message: "Username must be 3-50 characters.",
      });
      return;
    }
    if (password.length < 8 || password.length > 100) {
      setFormFeedback({
        type: "error",
        message: "Password must be 8-100 characters.",
      });
      return;
    }

    const userData: CreateCoreUserRequest = {
      username,
      password,
      email,
      fullName,
      role,
    };
    await createCoreUser(userData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFeedback && (
        <AlertMessage
          type={formFeedback.type}
          message={formFeedback.message}
          title={formFeedback.type === "success" ? "Success" : "Error"}
        />
      )}
      <FormField
        label="Username"
        type="text"
        id="core_username"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="off"
      />
      <FormField
        label="Password"
        type="password"
        id="core_password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />
      <FormField
        label="Email"
        type="email"
        id="core_email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FormField
        label="Full Name"
        type="text"
        id="core_fullName"
        name="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <div>
        <label
          htmlFor="core_role"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Role
        </label>
        <select
          id="core_role"
          name="role"
          value={role}
          onChange={(e) =>
            setRole(
              e.target.value as "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER"
            )
          }
          required
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {allowedRoles.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
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
          text="Create Core User"
          loadingText="Creating..."
          className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
        />
      </div>
    </form>
  );
};
