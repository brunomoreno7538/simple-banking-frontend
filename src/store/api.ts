import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

interface SortObject {
  sorted?: boolean;
  unsorted?: boolean;
  empty?: boolean;
}
interface PageableObject {
  offset?: number;
  pageNumber?: number;
  pageSize?: number;
  paged?: boolean;
  unpaged?: boolean;
  sort?: SortObject;
}

export interface MerchantResponse {
  merchantId: string;
  name: string;
  cnpj?: string;
  accountId?: string;
}
export interface PageMerchantResponse {
  content?: MerchantResponse[];
  pageable?: PageableObject;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
  sort?: SortObject;
}

export interface CoreUserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role?: string;
  enabled?: boolean;
}
export interface PageCoreUserResponse {
  content?: CoreUserResponse[];
  pageable?: PageableObject;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
  sort?: SortObject;
}

export interface PageableRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateMerchantRequest {
  name: string;
  cnpj: string;
}

export interface MerchantUserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
  merchantId: string;
  enabled: boolean;
}
export interface PageMerchantUserResponse {
  content?: MerchantUserResponse[];
  pageable?: PageableObject;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
  sort?: SortObject;
}

export interface TransactionResponse {
  transactionId: string;
  accountId: string;
  type: "PAYIN" | "PAYOUT";
  amount: number;
  timestamp: string;
  description?: string;
  status: string;
}
export interface PageTransactionResponse {
  content?: TransactionResponse[];
  pageable?: PageableObject;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
  sort?: SortObject;
}

export interface AccountBalanceResponse {
  accountId: string;
  balance: number;
}

export interface AccountDetailsResponse {
  accountId: string;
  accountNumber: string;
  balance: number;
  accountHolderType: string;
  holderId: string;
}

export interface CreateMerchantUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
  merchantId: string;
}

export interface UpdateMerchantUserRequest {
  fullName?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
  enabled?: boolean;
}

export interface MyMerchantProfileResponse {
  user: MerchantUserResponse;
  merchant: MerchantResponse;
}

export interface CreateTransactionRequest {
  accountId: string;
  type: "PAYIN" | "PAYOUT";
  amount: number;
  description?: string;
}

export interface SystemWideTransactionsRequestParams extends PageableRequest {
  startDate?: string;
  endDate?: string;
  type?: "PAYIN" | "PAYOUT";
  accountId?: string;
}

export interface AccountTransactionsRequestParams extends PageableRequest {
  startDate?: string;
  endDate?: string;
  type?: "PAYIN" | "PAYOUT";
}

export interface PagedTransactionsWithSummaryResponse {
  transactionsPage: PageTransactionResponse;
  summary?: TransactionSummaryResponse;
}

export interface TransactionSummaryResponse {
  quantity: number;
  totalAmount: number;
}

export interface CreateCoreUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
}

export interface UpdateCoreUserRequest {
  email?: string;
  fullName?: string;
  password?: string;
  role?: "ADMIN" | "MERCHANT_ADMIN" | "MERCHANT_USER";
  enabled?: boolean;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const activeUserType = localStorage.getItem("activeUserType");
    const coreToken = localStorage.getItem("coreUserToken");
    const merchantToken = localStorage.getItem("merchantToken");

    let tokenToUse = null;

    if (activeUserType === "merchant") {
      if (merchantToken) {
        tokenToUse = merchantToken;
      } else {
        console.warn(
          "Active user type is merchant, but merchantToken is not found."
        );
      }
    } else if (activeUserType === "core") {
      if (coreToken) {
        tokenToUse = coreToken;
      } else {
        console.warn(
          "Active user type is core, but coreUserToken is not found."
        );
      }
    } else {
      console.warn(
        `Unknown or undefined activeUserType: ${activeUserType}. Falling back to checking coreToken then merchantToken.`
      );
      if (coreToken) {
        tokenToUse = coreToken;
      } else if (merchantToken) {
        tokenToUse = merchantToken;
      }
    }

    if (tokenToUse) {
      headers.set("Authorization", `Bearer ${tokenToUse}`);
    } else {
      console.warn("No token available to set Authorization header.");
    }
    return headers;
  },
});

const baseQueryWithAuthHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const coreToken = localStorage.getItem("coreUserToken");
    const merchantToken = localStorage.getItem("merchantToken");

    if (coreToken || merchantToken) {
      console.warn(
        "Received 401 Unauthorized with an active token. Clearing tokens and redirecting to home."
      );
      localStorage.removeItem("coreUserToken");
      localStorage.removeItem("merchantToken");
      localStorage.removeItem("activeUserType");
      window.location.href = "/";
    } else {
      console.warn(
        "Received 401 Unauthorized, but no token was found in localStorage. No automatic redirection or token clearing performed."
      );
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: [
    "Merchant",
    "CoreUser",
    "MerchantUser",
    "Transaction",
    "SystemTransaction",
    "Account",
    "MyMerchantProfile",
  ],
  endpoints: (builder) => ({
    coreLogin: builder.mutation<AuthResponse, AuthRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/core/login",
        method: "POST",
        body: credentials,
      }),
    }),
    merchantLogin: builder.mutation<AuthResponse, AuthRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/merchant/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getAllMerchants: builder.query<
      PageMerchantResponse,
      PageableRequest | void
    >({
      query: (params) => ({
        url: "/api/v1/merchants",
        params: params || { page: 0, size: 10 },
      }),
      providesTags: (result) =>
        result && result.content
          ? [
              ...result.content.map(({ merchantId }) => ({
                type: "Merchant" as const,
                id: merchantId,
              })),
              { type: "Merchant", id: "LIST" },
            ]
          : [{ type: "Merchant", id: "LIST" }],
    }),
    createMerchant: builder.mutation<MerchantResponse, CreateMerchantRequest>({
      query: (merchantData) => ({
        url: "/api/v1/merchants",
        method: "POST",
        body: merchantData,
      }),
      invalidatesTags: [{ type: "Merchant", id: "LIST" }],
    }),
    getAllCoreUsers: builder.query<
      PageCoreUserResponse,
      PageableRequest | void
    >({
      query: (params) => ({
        url: "/api/v1/core-users",
        params: params || { page: 0, size: 1 },
      }),
      providesTags: (result) =>
        result && result.content
          ? [
              ...result.content.map(({ userId }) => ({
                type: "CoreUser" as const,
                id: userId,
              })),
              { type: "CoreUser", id: "LIST" },
            ]
          : [{ type: "CoreUser", id: "LIST" }],
    }),
    getMerchantById: builder.query<MerchantResponse, string>({
      query: (merchantId) => `/api/v1/merchants/${merchantId}`,
      providesTags: (result, error, id) => [{ type: "Merchant", id }],
    }),
    getMerchantUsersByMerchantId: builder.query<
      PageMerchantUserResponse,
      { merchantId: string; params?: PageableRequest }
    >({
      query: ({ merchantId, params }) => ({
        url: `/api/v1/merchant-users/by-merchant/${merchantId}`,
        params: params || { page: 0, size: 10 },
      }),
      providesTags: (result, error, { merchantId }) =>
        result && result.content
          ? [
              ...result.content.map(({ userId }) => ({
                type: "MerchantUser" as const,
                id: userId,
              })),
              { type: "MerchantUser", id: "LIST_FOR_MERCHANT_" + merchantId },
            ]
          : [{ type: "MerchantUser", id: "LIST_FOR_MERCHANT_" + merchantId }],
    }),
    getTransactionsForAccount: builder.query<
      PagedTransactionsWithSummaryResponse,
      { accountId: string; params?: AccountTransactionsRequestParams }
    >({
      query: ({ accountId, params }) => ({
        url: `/api/v1/transactions/account/${accountId}`,
        params: params
          ? Object.fromEntries(
              Object.entries(params).filter(
                ([_, value]) => value !== undefined && value !== ""
              )
            )
          : { page: 0, size: 10 },
      }),
      providesTags: (result, error, { accountId }) =>
        result && result.transactionsPage.content
          ? [
              ...result.transactionsPage.content.map(({ transactionId }) => ({
                type: "Transaction" as const,
                id: transactionId,
              })),
              { type: "Transaction", id: "LIST_FOR_ACCOUNT_" + accountId },
            ]
          : [{ type: "Transaction", id: "LIST_FOR_ACCOUNT_" + accountId }],
    }),
    getAccountBalance: builder.query<AccountBalanceResponse, string>({
      query: (accountId) => `/api/v1/accounts/${accountId}/balance`,
      providesTags: (result, error, id) => [
        { type: "Account", id: `${id}-balance` },
      ],
    }),
    getAccountDetails: builder.query<AccountDetailsResponse, string>({
      query: (accountId) => `/api/v1/accounts/${accountId}/details`,
      providesTags: (result, error, id) => [
        { type: "Account", id: `${id}-details` },
      ],
    }),
    createMerchantUser: builder.mutation<
      MerchantUserResponse,
      CreateMerchantUserRequest
    >({
      query: (merchantUserData) => ({
        url: "/api/v1/merchant-users",
        method: "POST",
        body: merchantUserData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MerchantUser", id: "LIST_FOR_MERCHANT_" + arg.merchantId },
      ],
    }),
    updateMerchantUser: builder.mutation<
      MerchantUserResponse,
      { userId: string; payload: UpdateMerchantUserRequest }
    >({
      query: ({ userId, payload }) => ({
        url: `/api/v1/merchant-users/${userId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MerchantUser", id: arg.userId },
        result
          ? {
              type: "MerchantUser",
              id: "LIST_FOR_MERCHANT_" + result.merchantId,
            }
          : { type: "MerchantUser", id: "LIST" },
      ],
    }),
    deleteMerchantUser: builder.mutation<
      void,
      { userId: string; merchantId: string }
    >({
      query: ({ userId }) => ({
        url: `/api/v1/merchant-users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MerchantUser", id: arg.userId },
        { type: "MerchantUser", id: "LIST_FOR_MERCHANT_" + arg.merchantId },
      ],
    }),
    getMyMerchantProfile: builder.query<MyMerchantProfileResponse, void>({
      query: () => "/api/v1/merchant-users/me",
      providesTags: (result) => {
        if (!result)
          return [{ type: "MyMerchantProfile" as const, id: "PROFILE" }];

        const tags: (
          | { type: "MyMerchantProfile"; id: string | number }
          | { type: "Merchant"; id: string | number }
          | { type: "MerchantUser"; id: string | number }
          | { type: "Account"; id: string | number }
          | { type: "Transaction"; id: string | number }
        )[] = [
          { type: "MyMerchantProfile", id: "PROFILE" },
          { type: "Merchant", id: result.merchant.merchantId },
          { type: "MerchantUser", id: result.user.userId },
        ];

        if (result.merchant.accountId) {
          tags.push({ type: "Account", id: result.merchant.accountId });
          tags.push({
            type: "Transaction",
            id: "LIST_FOR_ACCOUNT_" + result.merchant.accountId,
          });
        }
        return tags;
      },
    }),
    createTransaction: builder.mutation<
      TransactionResponse,
      CreateTransactionRequest
    >({
      query: (transactionData) => ({
        url: "/api/v1/transactions",
        method: "POST",
        body: transactionData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Transaction", id: "LIST_FOR_ACCOUNT_" + arg.accountId },
        { type: "Account", id: `${arg.accountId}-balance` },
      ],
    }),
    getAllSystemTransactions: builder.query<
      PageTransactionResponse,
      SystemWideTransactionsRequestParams | void
    >({
      query: (params) => ({
        url: "/api/v1/transactions/system-wide",
        params: params
          ? Object.fromEntries(
              Object.entries(params).filter(
                ([_, value]) => value !== undefined && value !== ""
              )
            )
          : { page: 0, size: 10 },
      }),
      providesTags: (result) =>
        result && result.content
          ? [
              ...result.content.map(({ transactionId }) => ({
                type: "SystemTransaction" as const,
                id: transactionId,
              })),
              { type: "SystemTransaction", id: "LIST" },
            ]
          : [{ type: "SystemTransaction", id: "LIST" }],
    }),
    createCoreUser: builder.mutation<CoreUserResponse, CreateCoreUserRequest>({
      query: (coreUserData) => ({
        url: "/api/v1/core-users",
        method: "POST",
        body: coreUserData,
      }),
      invalidatesTags: [{ type: "CoreUser", id: "LIST" }],
    }),
    getCoreUserById: builder.query<CoreUserResponse, string>({
      query: (userId) => `/api/v1/core-users/${userId}`,
      providesTags: (result, error, id) => [{ type: "CoreUser", id }],
    }),
    updateCoreUser: builder.mutation<
      CoreUserResponse,
      { userId: string; payload: UpdateCoreUserRequest }
    >({
      query: ({ userId, payload }) => ({
        url: `/api/v1/core-users/${userId}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "CoreUser", id: arg.userId },
        { type: "CoreUser", id: "LIST" },
      ],
    }),
    deleteCoreUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/core-users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "CoreUser", id: userId },
        { type: "CoreUser", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCoreLoginMutation,
  useMerchantLoginMutation,
  useGetAllMerchantsQuery,
  useCreateMerchantMutation,
  useGetAllCoreUsersQuery,
  useGetMerchantByIdQuery,
  useGetMerchantUsersByMerchantIdQuery,
  useGetTransactionsForAccountQuery,
  useGetAccountBalanceQuery,
  useGetAccountDetailsQuery,
  useCreateMerchantUserMutation,
  useUpdateMerchantUserMutation,
  useDeleteMerchantUserMutation,
  useGetMyMerchantProfileQuery,
  useCreateTransactionMutation,
  useGetAllSystemTransactionsQuery,
  useCreateCoreUserMutation,
  useGetCoreUserByIdQuery,
  useUpdateCoreUserMutation,
  useDeleteCoreUserMutation,
} = api;
