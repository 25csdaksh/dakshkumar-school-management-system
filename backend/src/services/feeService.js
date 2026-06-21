// Helper business calculations for school fees
export const calculateDueStatus = (amount, amountPaid) => {
  if (amountPaid >= amount) return 'Paid';
  if (amountPaid > 0) return 'Partially Paid';
  return 'Unpaid';
};

export default { calculateDueStatus };
