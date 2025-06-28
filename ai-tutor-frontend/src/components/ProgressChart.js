// src/components/ProgressChart.js
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

function ProgressChart() {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('quizProgress')) || [];
    setProgressData(stored);
  }, []);

  const capitalizedLabels = progressData.map((entry) =>
    entry.topic.charAt(0).toUpperCase() + entry.topic.slice(1)
  );

  const totalDates = progressData
    .flatMap((entry) => entry.dates)
    .reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const dateLabels = Object.keys(totalDates).sort();
  const quizCounts = dateLabels.map((d) => totalDates[d]);

  const barChartData = {
    labels: capitalizedLabels,
    datasets: [
      {
        label: 'Quizzes Taken',
        data: progressData.map((entry) => entry.count),
        backgroundColor: '#2e86de',
        borderRadius: 6,
      },
    ],
  };

  const lineChartData = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Quizzes Over Time',
        data: quizCounts,
        fill: false,
        borderColor: '#00b894',
        tension: 0.3,
      },
    ],
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all quiz progress?')) {
      localStorage.removeItem('quizProgress');
      window.location.reload();
    }
  };

  const handleDownload = () => {
    let csv = 'Topic,Count,Dates\n';
    progressData.forEach(entry => {
      csv += `${entry.topic},${entry.count},"${entry.dates.join('; ')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_progress.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (progressData.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '18px', color: '#777' }}>
        📉 No quiz progress yet. Try generating a quiz!
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      background: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📊 Learning Progress</h2>

      <Bar data={barChartData} />

      <div style={{ marginTop: '50px' }}>
        <h3 style={{ textAlign: 'center' }}>📅 Quizzes Over Time</h3>
        <Line data={lineChartData} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={handleDownload} style={buttonStyle}>
          📥 Download CSV
        </button>
        <button onClick={handleClear} style={{ ...buttonStyle, backgroundColor: '#e74c3c' }}>
          🧹 Clear Progress
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#2e86de',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
};

export default ProgressChart;
