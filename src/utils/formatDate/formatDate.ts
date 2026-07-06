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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const formatDate = (isoDate: string | null | undefined): string => {
  if (isoDate === null || isoDate === undefined || !ISO_DATE_PATTERN.test(isoDate)) {
    return '';
  }

  const [year, month, day] = isoDate.split('-');
  const monthName = MONTH_NAMES[Number(month) - 1];

  if (monthName === undefined) {
    return '';
  }

  return `${Number(day)} ${monthName} ${year}`;
};
