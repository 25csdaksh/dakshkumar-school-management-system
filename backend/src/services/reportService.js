// Helper service for formatting excel/report layouts
export const formatReportData = (data) => {
  return data.map(item => ({
    id: item._id,
    generatedAt: new Date(),
    status: 'Ready'
  }));
};

export default { formatReportData };
