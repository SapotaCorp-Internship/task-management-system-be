export const isValidDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
};

export const formatDate = (date: Date | undefined): string => {
  if (!date) return "";
  return date.toISOString();
};