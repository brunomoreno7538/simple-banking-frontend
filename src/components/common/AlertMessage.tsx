import React from "react";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string | null;
  title?: string;
}

const alertStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    iconBg: "bg-green-100",
    iconText: "text-green-600",
    titleText: "text-green-800",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    iconBg: "bg-red-100",
    iconText: "text-red-600",
    titleText: "text-red-800",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-700",
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-600",
    titleText: "text-yellow-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    titleText: "text-blue-800",
  },
};

const Icons: Record<string, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 102 0V5zm-1 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.004-1.742 3.004H4.42c-1.526 0-2.492-1.67-1.742-3.004l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 6a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  title,
}) => {
  if (!message) return null;

  const styles = alertStyles[type];
  const Icon = Icons[type];

  if (!styles || !Icon) {
    console.warn(`AlertMessage: Unsupported type "${type}" provided.`);
    return (
      <div
        className={`border-l-4 border-gray-400 bg-gray-50 p-4 rounded-md shadow-md my-4`}
      >
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium text-gray-800`}>{title}</h3>
          )}
          <div className={`text-sm text-gray-700`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-l-4 ${styles.border} ${styles.bg} p-4 rounded-md shadow-md my-4`}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.iconText}`}>{Icon}</div>
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${styles.titleText}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.text}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
