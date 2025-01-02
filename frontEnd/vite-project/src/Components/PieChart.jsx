import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PieChart.css'
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const PieChart = () => {
  const [chartData, setChartData] = useState([]);
  const [month, setMonth] = useState('05');

  useEffect(() => {
    if (!month) return;

    const fetchPieChartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/pie-chart`, {
          params: { month },
        });
        setChartData(response.data);
      } catch (err) {
        console.error('Error fetching pie chart data:', err);
      }
    };

    fetchPieChartData();
  }, [month]);

  const data = {
    labels: chartData.map(item => item.category),
    datasets: [
      {
        label: 'Item Count',
        data: chartData.map(item => item.count),
        backgroundColor: [
          '#FF6384', // Red
          '#36A2EB', // Blue
          '#FFCE56', // Yellow
          '#4BC0C0', // Green
          '#9966FF', // Purple
          '#FF9F40', // Orange
        ], // Custom colors for categories
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        
        
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} items`,
        },
      },
    },
  };

  return (
    <div id="pie" className='piechart-section'>
      <h2>Pie Chart</h2>
     <select className='month' onChange={(e) => setMonth(e.target.value)} value={month}>
        <option value="">Select Month</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={`0${i + 1}`.slice(-2)}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </select>
    <div>
      <h3>Category Distribution for Month {month}</h3>
      <div className='pie'>
      {chartData.length > 0 ? (
        <Pie data={data} options={options} />
      ) : (
        <p>No data available for the selected month.</p>
      )}
      </div>
    </div>
    </div>
  );
};

export default PieChart;
