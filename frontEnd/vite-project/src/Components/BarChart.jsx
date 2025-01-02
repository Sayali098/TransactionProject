import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BarChart.css";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState("09");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!month) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "http://localhost:5000/api/bar-chart",
          {
            params: { month },
          }
        );
        setData(response.data.priceRanges);
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [month]);

  const chartData = {
    labels: data.map((range) => range.range),
    datasets: [
      {
        label: "Number of Items",
        data: data.map((range) => range.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        barThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Price Range Distribution",
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Remove vertical grid lines
        },
      },
      y: {
        grid: {
          drawBorder: true, // Show border line
          drawOnChartArea: true, // Keep horizontal grid lines
        },
        beginAtZero: true,
      },
    },
  };


  if (loading) return <div>{loading}</div>
  if (error) return <div>{error}</div>;

  return (
    <div id="bar" className="bar">
      <h2>Bar Chart</h2>
      <select
        className="month"
        onChange={(e) => setMonth(e.target.value)}
        value={month}
      >
        <option value="">Select Month</option>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={`0${i + 1}`.slice(-2)}>
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      <div className="bar-chart">
        {data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p>No data available for the selected month.</p>
        )}
      </div>
    </div>
  );
};

export default BarChart;
