import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart, Line,
  BarChart, Bar,
  CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

type Point = {
  dateTime: string;
  soCompensation: number;
  dailyPnL: number;
  swap: number;
  commission: number;
  balance: number;
  prevBalance: number;
  withdraw: number;
  deposit: number;
  winningPositions: number;
  losingPositions: number;
  winningPositionsPercent: number;
  balancePercent: number;
};

const Statistics = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [accountId, setAccountId] = useState(searchParams.get("accountId") || "");
  const [timeRange, setTimeRange] = useState(searchParams.get("timeRange") || "30");

  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const parsePercent = (value: number) => {
    if (isNaN(value)) return 0;
    let valueStr = value.toFixed(2);
    return value > 1 ? `+${valueStr}` : valueStr;
  };

  const fetchData = () => {
    if (!accountId) return;
    setLoading(true);

    const url = `http://localhost:5010/Private/TradingAccountPOC/TradingAccounts/${accountId}/GetStatistics?timeRange=${timeRange}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        let points = json?.data?.points || [];
        for (let i = 0; i < points.length; i++) {
          points[i].winningPositionsPercent = (points[i].winningPositions / (points[i].winningPositions + points[i].losingPositions)) * 100;
          if (points[i].prevBalance !== 0) {
            points[i].balancePercent = ((points[i].balance - points[i].prevBalance) / points[i].prevBalance) * 100;
          }
          else {
            points[i].balancePercent = 0;
          }
        }
        setPoints(points);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const urlAccountId = searchParams.get("accountId");
    const urlTimeRange = searchParams.get("timeRange") || "30";
    if (urlAccountId) {
      setAccountId(urlAccountId);
      setTimeRange(urlTimeRange);
      fetchData();
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ accountId, timeRange });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Account Statistics</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Account ID:
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            style={{ margin: "0 10px" }}
          />
        </label>
        <label>
          Time Range (days):
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ margin: "0 10px" }}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">365 days</option>
          </select>
        </label>
        <button type="submit">Fetch Data</button>
      </form>

      <h4>
        Account ID: {accountId} | Time Range: {timeRange} days | Total Points: {points.length}
      </h4>

      {loading ? (
        <p>Loading data...</p>
      ) : points.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <>
          <h2>📈 Balance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={points}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="dateTime" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Balance" />
            </LineChart>
          </ResponsiveContainer>

          <h2>📊 Daily PnL + Swap + Commission</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={points}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="dateTime" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
              <Legend />
              <Bar dataKey="dailyPnL" stackId="a" fill="#82ca9d" name="PnL" />
              <Bar dataKey="swap" stackId="a" fill="#8884d8" name="Swap" />
              <Bar dataKey="commission" stackId="a" fill="#ffc658" name="Commission" />
            </BarChart>
          </ResponsiveContainer>

          <h2>💸 Withdraw vs Deposit</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={points}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="dateTime" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleString()} />
              <Legend />
              <Bar dataKey="withdraw" fill="#f87171" name="Withdraw" />
              <Bar dataKey="deposit" fill="#60a5fa" name="Deposit" />
            </BarChart>
          </ResponsiveContainer>

          <h2>📋 Raw Data Table</h2>
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Daily PnL</th>
                <th>Swap</th>
                <th>Commission</th>
                <th>PrevBalance</th>
                <th>Balance</th>
                <th>Withdraw/Deposit</th>
                <th>Win</th>
                <th>Lose</th>
                <th>Win %</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, index) => (
                <tr key={index}>
                  <td>{new Date(point.dateTime).toLocaleString()}</td>
                  <td>
                    {point.dailyPnL}
                    {point.soCompensation > 0 && ` + ${point.soCompensation}`}
                  </td>
                  <td>{point.swap}</td>
                  <td>{point.commission}</td>
                  <td>{point.prevBalance}</td>
                  <td>{point.balance} ({parsePercent(point.balancePercent)}%)</td>
                  <td>{point.withdraw}/{point.deposit}</td>
                  <td>{point.winningPositions}</td>
                  <td>{point.losingPositions}</td>
                  <td>{point.winningPositionsPercent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Statistics;
