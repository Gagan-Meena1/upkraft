export const getQualityText = (score: number): string => {
    if (score > 9) return 'Excellent';
    if (score > 7) return 'Good';
    if (score > 5) return 'Average';
    if (score > 3) return 'Below Average';
    return 'Poor';
  };