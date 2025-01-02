import React, { useState, useEffect } from "react";
import axios from "axios";
import BarChart from "./Components/BarChart";
import PieChart from "./Components/PieChart";
import "./App.css";
import CombinedData from "./Components/CombinedData";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [month, setMonth] = useState("03");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  const perPage = 10;

  // Fetch product transactions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/product-transaction",
          {
            params: { search: searchQuery, month, page, perPage },
          }
        );
        setData(response.data.transactions);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError("Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, page, month]);

  // Fetch statistics for the selected month
  useEffect(() => {
    if (!month) return;

    const fetchStatistics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/statistics",
          {
            params: { month },
          }
        );
        setStatistics(response.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
      }
    };

    fetchStatistics();
  }, [month]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setSearchQuery(search); // Update search query only on Enter key press
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <header>
        <nav>
          <p>Products</p>
          <ul>
            <li>
              <a href="#pie">Piechart</a>
            </li>
            <li>
              <a href="#bar">Barchart</a>
            </li>
          </ul>
        </nav>
      </header>
      <h1 className="heading-h1">Product Transactions</h1>

      <div className="section">
        <div className="table-search">
          <div className="Search-MonthInput">
            <input
              type="text"
              placeholder="Search Transaction"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <select onChange={(e) => setMonth(e.target.value)} value={month}>
              <option value="">Select Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={`0${i + 1}`.slice(-2)}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Transactions Table */}
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Sale</th>
                <th>Date of Sale</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.price}</td>
                  <td>{item.category}</td>
                  <td>{item.sold ? "Sold" : "Not Sold"}</td>
                  <td>
                    {new Date(item.dateOfSale).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <img
                      style={{ width: "100px" }}
                      src={item.image}
                      alt={item.title || "Product Image"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}

          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span>
              {" "}
              Page {page} of {totalPages}{" "}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Search and Month Filters */}
        <div className="statistics-section">
          <div>
            <span className="stats-word">Statistics</span> -{" "}
            <select
              className="stats-select month"
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
          </div>

          {/* Statistics Box */}
          <div className="statistics">
            <h4>Statistics for Selected Month {month}</h4>
            <p>
              <span>Total Sale Amount : </span> $
              {statistics.totalSaleAmount.toFixed(2)}
            </p>
            <p>
              <span>Total Sold Items: </span> {statistics.totalSoldItems}
            </p>
            <p>
              <span>Total Not Sold Items: </span>
              {statistics.totalNotSoldItems}
            </p>
          </div>
        </div>

        <PieChart id="pie" />
        <BarChart />
        <CombinedData></CombinedData>
      </div>
    </div>
  );
};

export default App;
