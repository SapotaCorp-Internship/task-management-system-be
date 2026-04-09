export const isValidDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};
