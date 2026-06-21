// Helper function for PDF report card rendering
export const generatePDFReport = (studentData, grades) => {
  console.log(`Generating PDF report card for ${studentData.name}`);
  return {
    success: true,
    fileUrl: '/uploads/dummy-report.pdf'
  };
};

export default generatePDFReport;
