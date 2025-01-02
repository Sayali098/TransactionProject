const express = require('express');
const axios = require('axios');
const cors = require('cors');
const moment = require('moment');
const app = express();


app.use(cors());


const filterByMonth = (transactions, month) => {
  return transactions.filter(transaction => moment(transaction.dateOfSale, 'YYYY-MM-DD').format('MM') === month);
};


// Define a route to fetch data from the external URL for transactions
app.get('/api/product-transaction', async (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;

  try {
    // Fetch data from the provided S3 URL
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    let transactions = response.data;

    // Filter by month (ignoring year)
    if (month) {
      transactions = filterByMonth(transactions, month);
    }

    // Apply search filter for title, description, and price
    if (search) {
      transactions = transactions.filter(transaction => {
        const title = transaction.title || ''; // Default to empty string if undefined
        const description = transaction.description || ''; // Default to empty string if undefined
        const price = transaction.price || ''; // Default to empty string if undefined

        return title.toLowerCase().includes(search.toLowerCase()) ||
               description.toLowerCase().includes(search.toLowerCase()) ||
               price.toString().includes(search);
      });
    }

    // Implement pagination
    const startIndex = (parseInt(page) - 1) * parseInt(perPage);
    const endIndex = startIndex + parseInt(perPage);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    // Send the filtered and paginated data as a JSON response
    res.json({
      transactions: paginatedTransactions,
      totalTransactions: transactions.length,
      totalPages: Math.ceil(transactions.length / perPage),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Error fetching data from S3:', error);
    res.status(500).json({ message: 'Error fetching data from S3' });
  }
});


// Function to calculate statistics for a selected month
const calculateStatistics = (transactions, month) => {
  // Filter transactions by the selected month
  const filteredTransactions = filterByMonth(transactions, month);

  let totalSaleAmount = 0;
  let totalSoldItems = 0;
  let totalNotSoldItems = 0;

  filteredTransactions.forEach(transaction => {
    // Calculate total sale amount (sum of prices)
    if (transaction.price && !isNaN(transaction.price)) {
      totalSaleAmount += parseFloat(transaction.price);
    }

    // Count sold and not sold items
    if (transaction.sold && !isNaN(transaction.sold)) {
      totalSoldItems += transaction.sold;
    } else {
      totalNotSoldItems += 1; // Count items that are not sold (assuming `sold` field is 0 or undefined for unsold items)
    }
  });

  return {
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems,
  };
};


// Define a route to fetch statistics for the selected month
app.get('/api/statistics', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: 'Month parameter is required' });
  }

  try {
    // Fetch data from the provided S3 URL
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Calculate the statistics for the selected month
    const statistics = calculateStatistics(transactions, month);

    // Send the statistics as a JSON response
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching data for statistics:', error);
    res.status(500).json({ message: 'Error fetching data for statistics' });
  }
});


// Function to calculate price range statistics
const calculatePriceRanges = (transactions) => {
  const priceRanges = [
    { range: '0 - 100', count: 0 },
    { range: '101 - 200', count: 0 },
    { range: '201 - 300', count: 0 },
    { range: '301 - 400', count: 0 },
    { range: '401 - 500', count: 0 },
    { range: '501 - 600', count: 0 },
    { range: '601 - 700', count: 0 },
    { range: '701 - 800', count: 0 },
    { range: '801 - 900', count: 0 },
    { range: '901 - above', count: 0 },
  ];

  transactions.forEach(transaction => {
    if (transaction.price && !isNaN(transaction.price)) {
      const price = parseFloat(transaction.price);
      if (price <= 100) priceRanges[0].count++;
      else if (price <= 200) priceRanges[1].count++;
      else if (price <= 300) priceRanges[2].count++;
      else if (price <= 400) priceRanges[3].count++;
      else if (price <= 500) priceRanges[4].count++;
      else if (price <= 600) priceRanges[5].count++;
      else if (price <= 700) priceRanges[6].count++;
      else if (price <= 800) priceRanges[7].count++;
      else if (price <= 900) priceRanges[8].count++;
      else priceRanges[9].count++;
    }
  });

  return priceRanges;
};

// Define a route to fetch bar chart data
app.get('/api/bar-chart', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: 'Month parameter is required' });
  }

  try {
    // Fetch data from the provided S3 URL
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Filter transactions by the selected month
    const filteredTransactions = filterByMonth(transactions, month);

    // Calculate the price range statistics
    const priceRanges = calculatePriceRanges(filteredTransactions);

    // Send the bar chart data as a JSON response
    res.json({
      month,
      priceRanges,
    });
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ message: 'Error fetching bar chart data' });
  }
});



// Function to calculate category counts for the selected month
const calculateCategoryCounts = (transactions) => {
  const categoryCounts = {};

  transactions.forEach(transaction => {
    const category = transaction.category;
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });

  return categoryCounts;
};

// Define a route to fetch pie chart data
app.get('/api/pie-chart', async (req, res) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: 'Month parameter is required' });
  }

  try {
    // Fetch data from the provided S3 URL
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Filter transactions by the selected month
    const filteredTransactions = filterByMonth(transactions, month);

    // Calculate category counts
    const categoryCounts = calculateCategoryCounts(filteredTransactions);

    // Format the response for the pie chart
    const pieChartData = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category],
    }));

    // Send the pie chart data as a JSON response
    res.json(pieChartData);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ message: 'Error fetching pie chart data' });
  }
});


// get combined data

app.get('/api/combined-data', async (req, res) => {
  const { month }=req.query;

  try {
    // Fetch data from the individual APIs
    const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get('http://localhost:5000/api/statistics', { params: { month } }),
      axios.get('http://localhost:5000/api/bar-chart', { params: { month } }),
      axios.get('http://localhost:5000/api/pie-chart', { params: { month } }),
    ]);

    // Combine the data
    const combinedData = {
      statistics: statisticsResponse.data,
      barChartData: barChartResponse.data,
      pieChartData: {
        categories: pieChartResponse.data.map((item) => ({
          name: item.category,
          count: item.count,
        })),
      },
    };

    // Send the combined response
    res.json(combinedData);
  } catch (err) {
    console.error('Error fetching combined data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});




