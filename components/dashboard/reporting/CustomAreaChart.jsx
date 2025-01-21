"use client";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale, // x axis
  LinearScale, // y axis
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler
);

export default function CustomAreaChart({ salesData }) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data = {
    labels: salesData.map((data) => monthNames[data.month - 1]),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((data) => data.totalSales),
        borderColor: "#25CD25",
        borderWidth: 2,
        pointBorderColor: "#78E078",
        pointBorderWidth: 3,
        tension: 0.5,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "#25CD25");
          gradient.addColorStop(1, "white");
          return gradient;
        },
      },
    ],
  };

  const options = {
    plugins: {
      legend: true,
    },
    responsive: true,
    scales: {
      y: {
        ticks: {
          font: {
            size: 17,
            weight: "bold",
          },
        },
        title: {
          display: false,
          text: "Sales",
          padding: {
            bottom: 10,
          },
          font: {
            size: 30,
            style: "italic",
            family: "Arial",
          },
        },
        min: 50,
      },
      x: {
        ticks: {
          font: {
            size: 17,
            weight: "bold",
          },
        },
        title: {
          display: false,
          text: "Month",
          padding: {
            top: 10,
          },
          font: {
            size: 30,
            style: "italic",
            family: "Arial",
          },
        },
      },
    },
  };

  return (
    <div>
      <div
      // style={{
      //   width: "900px",
      //   height: "400px",
      //   padding: "20px",
      //   cursor: "pointer",
      // }}
      >
        <Line data={data} options={options}></Line>
      </div>
    </div>
  );
}
