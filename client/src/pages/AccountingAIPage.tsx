import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, BarChart3, Zap, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const anomalyData = [
  { date: '2026-05-01', amount: 5200, type: 'Normal', description: 'Monthly supplies purchase' },
  { date: '2026-05-05', amount: 15800, type: 'Anomaly', description: 'Unusually large payment to unknown vendor' },
  { date: '2026-05-10', amount: 3200, type: 'Normal', description: 'Utility bills' },
  { date: '2026-05-15', amount: 28000, type: 'Anomaly', description: 'Duplicate payment detected' },
];

const forecastData = [
  { month: 'Jul', actual: 0, predicted: 72000 }, { month: 'Aug', actual: 0, predicted: 68000 },
  { month: 'Sep', actual: 0, predicted: 85000 }, { month: 'Oct', actual: 0, predicted: 78000 },
  { month: 'Nov', actual: 0, predicted: 90000 }, { month: 'Dec', actual: 0, predicted: 95000 },
];

const bankFeedData = [
  { date: '2026-05-18', description: 'WIRE TFR - FEE COLLECTION', amount: 12500, matched: true, category: 'Fee Income' },
  { date: '2026-05-17', description: 'POS - SCHOOL SUPPLIES LTD', amount: -3200, matched: true, category: 'Supplies' },
  { date: '2026-05-16', description: 'ACH - PAYROLL', amount: -45000, matched: true, category: 'Payroll' },
  { date: '2026-05-15', description: 'CARD - UNKNOWN MERCHANT', amount: -890, matched: false, category: 'Unmatched' },
];

export default function AccountingAIPage() {
  const [activeTab, setActiveTab] = useState<'anomaly' | 'bankfeeds' | 'forecast' | 'insights'>('anomaly');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl"><Brain size={24} className="text-violet-600" /></div>
          <div><h1 className="text-2xl font-bold">Accounting AI</h1><p className="text-sm text-gray-500">AI-powered financial intelligence</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('anomaly')} className={`card text-left hover:shadow-md transition-shadow ${activeTab === 'anomaly' ? 'ring-2 ring-violet-500' : ''}`}>
          <AlertTriangle size={20} className="text-red-500 mb-2" /><p className="font-semibold">Anomaly Detection</p><p className="text-xs text-gray-500">2 anomalies found</p>
        </button>
        <button onClick={() => setActiveTab('bankfeeds')} className={`card text-left hover:shadow-md transition-shadow ${activeTab === 'bankfeeds' ? 'ring-2 ring-violet-500' : ''}`}>
          <RefreshCw size={20} className="text-blue-500 mb-2" /><p className="font-semibold">AI Bank Feeds</p><p className="text-xs text-gray-500">Auto-categorized transactions</p>
        </button>
        <button onClick={() => setActiveTab('forecast')} className={`card text-left hover:shadow-md transition-shadow ${activeTab === 'forecast' ? 'ring-2 ring-violet-500' : ''}`}>
          <TrendingUp size={20} className="text-green-500 mb-2" /><p className="font-semibold">Financial Forecast</p><p className="text-xs text-gray-500">6-month projection</p>
        </button>
        <button onClick={() => setActiveTab('insights')} className={`card text-left hover:shadow-md transition-shadow ${activeTab === 'insights' ? 'ring-2 ring-violet-500' : ''}`}>
          <Zap size={20} className="text-amber-500 mb-2" /><p className="font-semibold">Smart Insights</p><p className="text-xs text-gray-500">AI recommendations</p>
        </button>
      </div>

      {activeTab === 'anomaly' && (
        <div className="card">
          <h3 className="font-semibold mb-4">AI-Powered Anomaly Detection</h3>
          <div className="space-y-3">
            {anomalyData.map((item, i) => (
              <div key={i} className={`p-4 rounded-lg border ${item.type === 'Anomaly' ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={item.type === 'Anomaly' ? 'badge-danger' : 'badge-success'}>{item.type}</span>
                    <div><p className="font-medium">{item.description}</p><p className="text-xs text-gray-500">{item.date}</p></div>
                  </div>
                  <p className="font-bold">${item.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bankfeeds' && (
        <div className="card">
          <h3 className="font-semibold mb-4">AI-Powered Bank Feeds</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-left">AI Category</th><th className="px-4 py-3 text-center">Status</th>
              </tr></thead>
              <tbody>
                {bankFeedData.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-3">{item.date}</td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Math.abs(item.amount).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="badge-primary">{item.category}</span></td>
                    <td className="px-4 py-3 text-center">{item.matched ? <span className="badge-success">Matched</span> : <span className="badge-warning">Review</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Financial Forecast (Next 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend />
              <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="card">
          <h3 className="font-semibold mb-4">AI Financial Insights</h3>
          <div className="space-y-4">
            {[
              { icon: <TrendingUp className="text-green-500" />, title: 'Revenue Growth', desc: 'Fee collection has improved by 12% compared to last term. Consider maintaining current collection strategies.' },
              { icon: <AlertTriangle className="text-amber-500" />, title: 'Budget Alert', desc: 'Supplies spending is 18% over budget. Review recent purchase orders for optimization opportunities.' },
              { icon: <Zap className="text-blue-500" />, title: 'Cash Flow Optimization', desc: 'Based on payment patterns, shifting payroll date by 3 days could improve cash flow by $8,000/month.' },
              { icon: <BarChart3 className="text-purple-500" />, title: 'Cost Reduction', desc: 'AI analysis suggests consolidating 3 vendor contracts could save approximately $4,500 per quarter.' },
            ].map((insight, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <div className="flex-shrink-0 mt-1">{insight.icon}</div>
                <div><p className="font-medium">{insight.title}</p><p className="text-sm text-gray-500 mt-1">{insight.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
