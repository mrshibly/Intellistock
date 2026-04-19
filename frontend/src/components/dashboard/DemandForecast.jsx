import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, TrendingUp, Info } from 'lucide-react';

const DemandForecast = ({ productId }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchForecast();
    }
  }, [productId]);

  const fetchForecast = async () => {
    try {
      const { data } = await axios.get(`/forecasts/${productId}`);
      setForecast(data);
    } catch (err) {
      console.error('Failed to fetch forecast', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for visualization until real history is aggregated
  const data = [
    { month: 'Jan', sales: 45 },
    { month: 'Feb', sales: 52 },
    { month: 'Mar', sales: 48 },
    { month: 'Apr', sales: 61 },
    { month: 'May', sales: 55 },
    { month: 'Jun', sales: forecast?.predictedDemand || 0, isForecast: true },
  ];

  if (loading) return <div className="p-4 bg-white rounded-2xl border animate-pulse">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="text-emerald-500" />
            Demand Forecasting
          </h3>
          <p className="text-sm text-gray-500">AI-predicted sales volume for next month</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-emerald-600">
            {forecast?.predictedDemand || 'N/A'}
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-400">
            Units Estimated
          </div>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              dot={(props) => {
                if (props.payload.isForecast) {
                  return <circle cx={props.cx} cy={props.cy} r={6} fill="#10b981" stroke="#fff" strokeWidth={3} />;
                }
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex gap-3 items-start">
          <Info size={16} className="text-blue-500 mt-0.5" />
          <div className="text-xs text-gray-600 italic">
            {forecast?.reasoning || "AI is analyzing current stock velocity and seasonal trends to refine this prediction."}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Period: {forecast?.period || 'Next Month'}
          </span>
          <span>Confidence: {((forecast?.confidence || 0.85) * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default DemandForecast;
