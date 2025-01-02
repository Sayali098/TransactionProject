import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/statistics', {
          params: { month },
        });
        setStatistics(response.data);
      } catch (error) {
        setError('Error fetching statistics');
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (month) {
      fetchStatistics();
    }
  }, [month]);

//   if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Statistics for Month {month}</h2>
      {statistics ? (
        <div>
          <p>Total Sale Amount: ${statistics.totalSaleAmount.toFixed(2)}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
      ) : (
        <div>No statistics available for this month.</div>
      )}
    </div>
  );
};

export default Statistics;
