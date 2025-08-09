import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './MouseActivityDashboard.css';

const MouseActivityDashboard = ({ isDark }) => {
  const [distance, setDistance] = useState(0);
  const [hoverTime, setHoverTime] = useState(0);
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('mouseData')) || []);

  const prevPos = useRef({ x: 0, y: 0 });
  const hoverStart = useRef(null);
  const hoverTotal = useRef(0);

  useEffect(() => {
    const moveHandler = (e) => {
      const dx = e.clientX - prevPos.current.x;
      const dy = e.clientY - prevPos.current.y;
      setDistance(d => d + Math.sqrt(dx * dx + dy * dy));
      prevPos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', moveHandler);
    return () => document.removeEventListener('mousemove', moveHandler);
  }, []);

  const handleEnter = () => { hoverStart.current = Date.now(); };
  const handleLeave = () => {
    if (hoverStart.current) {
      hoverTotal.current += Date.now() - hoverStart.current;
      setHoverTime(hoverTotal.current / 1000);
      hoverStart.current = null;
    }
  };

  const saveSnapshot = () => {
    const newEntry = {
      time: new Date().toLocaleTimeString(),
      distance: Math.round(distance),
      hover: +hoverTime.toFixed(2),
    };
    const updated = [...data, newEntry];
    localStorage.setItem('mouseData', JSON.stringify(updated));
    setData(updated);
  };

  const resetData = () => {
    localStorage.removeItem('mouseData');
    setData([]);
    setDistance(0);
    setHoverTime(0);
    hoverTotal.current = 0;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Mouse Activity Snapshot', 14, 16);
    const rows = data.map(item => [item.time, item.distance, item.hover]);
    doc.autoTable({
      head: [['Time', 'Distance', 'Hover (s)']],
      body: rows
    });
    doc.save('mouse_activity.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'MouseData');
    const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'mouse_activity.xlsx');
  };

  const chartBg = isDark ? '#333' : '#fff';

  return (
    <div className={`mouse-dashboard ${isDark ? 'dark' : 'light'}`}>
      <div className="stats">
        <h2>🖱 Mouse Activity Tracker</h2>
        <p><strong>Total Distance:</strong> {Math.round(distance)}</p>
        <p><strong>Avg Hover Time:</strong> {hoverTime.toFixed(2)}s</p>
      </div>

      <div className="buttons">
        <button onClick={saveSnapshot} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>📌 Save Snapshot</button>
        <button onClick={resetData} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>♻ Reset</button>
        <button onClick={downloadPDF} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>📄 Download PDF</button>
        <button onClick={exportToExcel} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>📊 Export to Excel</button>
      </div>

      <div className="charts">
        <h3>📊 Distance (Bar)</h3>
        <ResponsiveContainer height={250}>
          <BarChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="distance" fill="#8884d8" animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>

        <h3>📈 Hover Time (Line)</h3>
        <ResponsiveContainer height={250}>
          <LineChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line dataKey="hover" stroke="#00c49f" strokeWidth={2} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>

        <h3>📉 Hover Area</h3>
        <ResponsiveContainer height={250}>
          <AreaChart data={data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="hover" stroke="#82ca9d" fill="#82ca9d" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>

        <h3>🥧 Snapshot Ratio (Pie)</h3>
        <ResponsiveContainer height={250}>
          <PieChart>
            <Pie
              data={data.map(d => ({ name: d.time, value: d.distance }))}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#8884d8"
              animationDuration={1000}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 60%)`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MouseActivityDashboard;














