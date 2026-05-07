import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

const API = 'http://localhost:4000/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function load() {
    const token = localStorage.getItem('accessToken');
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const res = await fetch(`${API}/dashboard/summary?${qs.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    setData(await res.json());
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="container">
      <h1>ExpensePulse Dashboard</h1>
      <div className="filters">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={load}>Apply</button>
      </div>
      {data && (
        <div className="grid">
          <div className="card"><Line data={data.monthlyTrendChart} /></div>
          <div className="card"><Pie data={data.categoryDistributionChart} /></div>
          <div className="card"><Line data={data.cashflowChart} /></div>
          <div className="card"><Bar data={data.budgetVsActualChart} /></div>
        </div>
      )}
      <a href={`${API}/export/dashboard.pdf?from=${from}&to=${to}`} target="_blank">Export PDF</a>
    </div>
  );
}
