import React from "react";

interface DataCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  description,
  icon,
  className = "bg-white",
  onClick,
}) => {
  return (
    <div
      className={`shadow-lg rounded-xl p-6 ${className} border border-gray-200 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-3xl font-semibold text-gray-800">{value}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-full text-indigo-600">
            {icon}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};
