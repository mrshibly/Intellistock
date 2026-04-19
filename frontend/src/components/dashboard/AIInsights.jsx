import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Sparkles, AlertCircle, TrendingUp, Info, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data } = await axios.get('/insights');
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/insights/${id}/read`);
      setInsights(insights.map(i => i._id === id ? { ...i, isRead: true } : i));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'stock_alert': return <AlertCircle className="text-rose-500" />;
      case 'turnover': return <TrendingUp className="text-emerald-500" />;
      case 'anomaly': return <Sparkles className="text-violet-500" />;
      default: return <Info className="text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading insights...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-violet-500" />
          AI Intelligence
        </h2>
        <button 
          onClick={fetchInsights}
          className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {insights.filter(i => !i.isRead).length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed text-gray-400">
              No new insights at the moment.
            </div>
          ) : (
            insights.filter(i => !i.isRead).map((insight) => (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative p-5 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow group`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(insight.severity)}`}>
                        {insight.severity}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown>{insight.content}</ReactMarkdown>
                    </div>
                  </div>
                  <button 
                    onClick={() => markAsRead(insight._id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-violet-50 rounded-lg text-violet-600"
                    title="Dismiss"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIInsights;
