const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${Number(day)} ${MONTH_NAMES[Number(month) - 1]} ${year}`;
};
