export const formatTimestampToLocaleString = (
  timestamp: string | number | Date
): string => {
  return new Date(timestamp).toLocaleString();
};
