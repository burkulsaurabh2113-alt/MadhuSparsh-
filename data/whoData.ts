
// WHO Weight-for-Age Data (0-9 Years)
// Format: Age in Months -> [3rd, 15th, 50th, 85th, 97th] percentiles in kg

export const WHO_DATA: Record<'boys' | 'girls', Record<number, number[]>> = {
  boys: {
    0: [2.5, 2.9, 3.3, 3.9, 4.4],
    1: [3.4, 4.0, 4.5, 5.3, 5.9],
    2: [4.3, 4.9, 5.6, 6.5, 7.2],
    3: [5.0, 5.7, 6.4, 7.4, 8.1],
    4: [5.6, 6.3, 7.0, 8.1, 8.9],
    5: [6.1, 6.9, 7.6, 8.7, 9.6],
    6: [6.4, 7.3, 7.9, 9.1, 10.1],
    9: [7.2, 8.3, 9.2, 10.7, 11.8],
    12: [7.7, 8.9, 9.6, 11.3, 12.5],
    18: [8.5, 9.4, 10.2, 11.5, 12.6], // 1.5 yrs
    24: [9.2, 10.8, 12.2, 13.6, 14.8], // 2 yrs
    30: [9.8, 11.6, 13.3, 15.0, 16.3], // 2.5 yrs
    36: [10.4, 12.4, 14.3, 16.2, 17.8], // 3 yrs
    48: [11.7, 14.0, 16.3, 18.5, 20.5], // 4 yrs
    60: [12.9, 15.6, 18.3, 21.0, 23.2], // 5 yrs
    72: [14.1, 17.3, 20.5, 24.0, 26.8], // 6 yrs
    84: [15.3, 19.1, 22.9, 27.0, 30.2], // 7 yrs
    96: [16.6, 21.1, 25.6, 30.5, 34.4], // 8 yrs
    108: [18.0, 23.3, 28.6, 34.2, 39.0], // 9 yrs
  },
  girls: {
    0: [2.4, 2.8, 3.2, 3.7, 4.2],
    1: [3.2, 3.7, 4.2, 5.0, 5.6],
    2: [3.9, 4.5, 5.1, 6.0, 6.7],
    3: [4.5, 5.1, 5.8, 6.8, 7.5],
    4: [5.0, 5.6, 6.4, 7.4, 8.1],
    5: [5.4, 6.1, 6.9, 7.9, 8.7],
    6: [5.7, 6.5, 7.3, 8.3, 9.2],
    9: [6.5, 7.4, 8.6, 9.9, 11.0],
    12: [7.0, 8.0, 8.9, 10.3, 11.5],
    18: [7.8, 8.7, 9.5, 10.8, 11.9], // 1.5 yrs
    24: [8.6, 10.0, 11.5, 13.0, 14.2], // 2 yrs
    30: [9.2, 10.8, 12.4, 14.0, 15.4], // 2.5 yrs
    36: [9.8, 11.8, 13.9, 15.6, 17.1], // 3 yrs
    48: [11.1, 13.4, 15.8, 17.9, 19.8], // 4 yrs
    60: [12.2, 15.0, 17.9, 20.3, 22.5], // 5 yrs
    72: [13.2, 16.3, 19.5, 22.6, 25.4], // 6 yrs
    84: [14.4, 18.1, 21.9, 25.5, 28.8], // 7 yrs
    96: [15.7, 20.2, 24.8, 28.8, 32.4], // 8 yrs
    108: [17.1, 22.6, 28.1, 33.0, 37.4], // 9 yrs
  }
};

const getAgeData = (gender: 'Boy' | 'Girl', ageMonths: number) => {
  const table = gender === 'Boy' ? WHO_DATA.boys : WHO_DATA.girls;
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
  const closestAge = ages.reduce((prev, curr) => 
    (Math.abs(curr - ageMonths) < Math.abs(prev - ageMonths) ? curr : prev)
  );
  return table[closestAge];
};

export const getWhoStandards = (gender: 'Boy' | 'Girl', ageMonths: number) => {
  const [p3, p15, p50, p85, p97] = getAgeData(gender, ageMonths);
  return { p3, p15, p50, p85, p97 };
};

export const getWhoPercentile = (gender: 'Boy' | 'Girl', ageMonths: number, weight: number) => {
  const [p3, p15, p50, p85, p97] = getAgeData(gender, ageMonths);

  let status = "Normal";
  let color = "green";
  let percentileValue = 50; // default middle

  if (weight < p3) {
    status = "Severely Underweight";
    color = "red";
    percentileValue = 10;
  } else if (weight < p15) {
    status = "Underweight";
    color = "orange";
    percentileValue = 25;
  } else if (weight > p97) {
    status = "Obese";
    color = "red";
    percentileValue = 95;
  } else if (weight > p85) {
    status = "Overweight";
    color = "orange";
    percentileValue = 85;
  } else {
    status = "Healthy Weight";
    color = "green";
    // Interpolate roughly between 30 and 70 for visual gauge
    if (weight < p50) percentileValue = 30 + ((weight - p15) / (p50 - p15)) * 20;
    else percentileValue = 50 + ((weight - p50) / (p85 - p50)) * 20;
  }

  return { status, color, percentileValue, median: p50 };
};
