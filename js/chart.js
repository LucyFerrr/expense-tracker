"use strict";

/*************** Variable Declarations ***************/

let myChart = null;

/*=============================================================================
// Function Name: aggregateDataByYear
// Description: Aggregates financial data (entries) by year, calculating the 
//              total amount for each year.
// Arguments:
//   - [I] entries (array): An array of objects containing date and amount properties.
// Return Value:
//   - [I] labels (array): Array of year strings representing aggregated data points.
//   - [II] data (array): Array of numbers representing the total amount per year.
//---------------------------------------------------------------------------*/
function aggregateDataByYear(entries) {
  const aggregatedData = {};
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const year = date.getFullYear().toString();
    if (!aggregatedData[year]) {
      aggregatedData[year] = { year: date.getFullYear(), total: 0 };
    }
    aggregatedData[year].total += entry.amount;
  });
  const labels = Object.keys(aggregatedData).sort();
  const data = labels.map((key) => aggregatedData[key].total);
  return { labels, data };
}

/*=============================================================================
// Function Name: aggregateDataByMonth
// Description: Aggregates financial data (entries) by month, calculating the 
//              total amount for each month.
// Arguments:
//   - [I] entries (array): An array of objects containing date and amount properties.
// Return Value:
//   - [I] labels (array): Array of month/year strings (MM/YYYY format) representing aggregated data points.
//   - [II] data (array): Array of numbers representing the total amount per month.
//---------------------------------------------------------------------------*/
function aggregateDataByMonth(entries) {
  const aggregatedData = {};
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!aggregatedData[monthYear]) {
      aggregatedData[monthYear] = {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        total: 0,
      };
    }
    aggregatedData[monthYear].total += entry.amount;
  });
  const labels = Object.keys(aggregatedData).sort();
  const data = labels.map((key) => aggregatedData[key].total);
  return { labels, data };
}

/*=============================================================================
// Function Name: aggregateDataByDay
// Description: Aggregates financial data (entries) by day, calculating the 
//              total amount for each day.
// Arguments:
//   - [I] entries (array): An array of objects containing date and amount properties.
// Return Value:
//   - [I] labels (array): Array of day strings (YYYY-MM-DD format) representing aggregated data points.
//   - [II] data (array): Array of numbers representing the total amount per day.
//---------------------------------------------------------------------------*/
function aggregateDataByDay(entries) {
  const aggregatedData = {};
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const day = date.toISOString().split("T")[0];
    if (!aggregatedData[day]) {
      aggregatedData[day] = { day: date.getDate(), total: 0 };
    }
    aggregatedData[day].total += entry.amount;
  });
  const labels = Object.keys(aggregatedData).sort();
  const data = labels.map((key) => aggregatedData[key].total);
  return { labels, data };
}

/*=============================================================================
// Function Name: renderChart
// Description: Renders a chart based on the selected interval ("yearly", 
//              "monthly", or "daily"). Aggregates income and expense data 
//              according to the interval and displays the chart.
// Arguments:
//   - [I] interval (string): The selected interval for data aggregation ("yearly", "monthly", or "daily").
// Return Value: None
//---------------------------------------------------------------------------*/
function renderChart(interval) {
  let aggregatedExpenses;
  let aggregatedIncomes;
  switch (interval) {
    case "yearly":
      aggregatedExpenses = aggregateDataByYear(expenses);
      aggregatedIncomes = aggregateDataByYear(incomes);
      break;
    case "monthly":
      aggregatedExpenses = aggregateDataByMonth(expenses);
      aggregatedIncomes = aggregateDataByMonth(incomes);
      break;
    case "daily":
      aggregatedExpenses = aggregateDataByDay(expenses);
      aggregatedIncomes = aggregateDataByDay(incomes);
      break;
    default:
      return;
  }

  const data = {
    labels: aggregatedExpenses.labels,
    datasets: [
      {
        label: "Expenses",
        data: aggregatedExpenses.data,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        fill: false,
      },
      {
        label: "Incomes",
        data: aggregatedIncomes.data,
        backgroundColor: "rgba(155, 225, 93, 0.2)",
        borderColor: "rgba(155, 225, 93, 1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "Expense vs Income",
        color: darkModeState ? "#fff" : "#333",
      },
      legend: {
        labels: {
          color: darkModeState ? "#fff" : "#333",
          generateLabels: function (chart) {
            const originalLabels =
              Chart.defaults.plugins.legend.labels.generateLabels(chart);
            originalLabels.forEach((label) => {
              const dataset = chart.data.datasets[label.datasetIndex];
              // label.fillStyle = dataset.legendColor; // Use custom legend color
            });
            return originalLabels;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: interval.charAt(0).toUpperCase() + interval.slice(1),
          color: darkModeState ? "#fff" : "#333",
        },
        grid: {
          color: darkModeState ? "#fff" : "#ddd",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (₱)",
          color: darkModeState ? "#fff" : "#333",
        },
        grid: {
          color: darkModeState ? "#fff" : "#ddd",
        },
      },
    },
    tooltips: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: function (tooltipItem) {
          return tooltipItem.dataset.label + ": ₱" + tooltipItem.raw.toFixed(2);
        },
      },
    },
  };

  const ctx = document
    .getElementById("expense-vs-income-chart")
    .getContext("2d");

  // Destroy previous chart instance if it exists
  if (myChart) {
    myChart.destroy();
  }

  // Create new chart instance
  myChart = new Chart(ctx, {
    type: "line",
    data: data,
    options: options,
  });
}

document.getElementById("interval").addEventListener("change", function () {
  const selectedInterval = this.value;
  renderChart(selectedInterval);
});
