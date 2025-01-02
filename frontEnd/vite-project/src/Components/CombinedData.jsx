import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import './CombinedData.css'

const CombinedData = () => {
  const [combinedData, setCombinedData] = useState(null);
  const [month, setMonth] = useState('07');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombinedData = async () => {
      if (!month) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('http://localhost:5000/api/combined-data', { params: { month } });
        setCombinedData(response.data);
      } catch (err) {
        console.error('Error fetching combined data:', err);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, [month]);

  const renderBarChart = () => {
    if (!combinedData || !combinedData.barChartData) return null;

    const barChartData = {
      labels: combinedData.barChartData.priceRanges.map((range) => range.range),
      datasets: [
        {
          label: 'Number of Items',
          data: combinedData.barChartData.priceRanges.map((range) => range.count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          barThickness: 60,

        },
        
      ],
    };

    return <Bar data={barChartData} />;
  };

  const renderPieChart = () => {
    if (!combinedData || !combinedData.pieChartData || !combinedData.pieChartData.categories) {
      return <p>No data available for the Pie Chart.</p>;
    }

    const pieChartData = {
      labels: combinedData.pieChartData.categories.map((category) => category.name),
      datasets: [
        {
          data: combinedData.pieChartData.categories.map((category) => category.count),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };

    return <div style={{width:'400px', height:"400px"}}>  <Pie data={pieChartData} /></div>;
  };

  const renderStatistics = () => {
    if (!combinedData) return null;

    return (
      <div style={{marginTop:'10px ' ,display:'flex',flexDirection:"column",gap:"10px"}}>
        <h3>Statistics</h3>
     
        <ul >
        {Object.entries(combinedData.statistics).map(([key, value]) => (
          <li  key={key}>
            <strong style={{padding:'4px'}}>{key.replace(/([A-Z])/g, ' $1')}: </strong>
          {value}
          </li>
        ))}
      </ul>
      </div>
    );
  };

  return (
    <div>
      <h1 style={{marginBottom:"10px"}}>Combined Data</h1>
      <select className='month' onChange={(e) => setMonth(e.target.value)} value={month}>
        <option value="">Select Month</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={`0${i + 1}`.slice(-2)}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>

      {loading && <p>Loading data...</p>}
      {error && <p>{error}</p>}

      {combinedData && (
        <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          {renderStatistics()}
          <h3>Pie Chart - Category Distribution</h3>
          {renderPieChart()}
          <h3>Bar Chart - Price Range Distribution</h3>
          {renderBarChart()}
        </div>
      )}
    </div>
  );
};

export default CombinedData;
