// Helper function for fee invoices receipt rendering
export const generateFeeReceipt = (feeRecord) => {
  console.log(`Generating receipt for fee invoice: ${feeRecord._id}`);
  return {
    success: true,
    receiptNo: `REC-${Date.now()}`
  };
};

export default generateFeeReceipt;
