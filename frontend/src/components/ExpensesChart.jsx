import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a832a8', '#32a8a8', '#a83232'];

const ExpensesChart = ({ transactions, onClose }) => {
    const { t } = useTranslation();
    const [view, setView] = useState('expense'); // 'expense', 'income', or 'balance'

    const { data, total, net } = useMemo(() => {
        if (view === 'balance') {
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const expense = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            return {
                data: [
                    { name: t('dashboard.income'), value: income },
                    { name: t('dashboard.expenses'), value: expense }
                ],
                total: income + expense,
                net: income - expense
            };
        }

        const filtered = transactions.filter(tx => tx.type === view);
        const grouped = filtered.reduce((acc, curr) => {
            const cat = curr.category || 'Altro';
            const translatedCat = t(`categories.${cat.toLowerCase().replace(/ /g, '_')}`, { defaultValue: cat });
            if (!acc[translatedCat]) acc[translatedCat] = 0;
            acc[translatedCat] += parseFloat(curr.amount);
            return acc;
        }, {});

        const chartData = Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        }));

        const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

        return { data: chartData, total: totalValue, net: 0 };
    }, [transactions, view]);

    const getTitle = () => {
        if (view === 'expense') return t('charts.expenseAnalysis');
        if (view === 'income') return t('charts.incomeAnalysis');
        return t('charts.totalBalance');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2a2a40',
                padding: '30px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '5px', color: '#fff' }}>
                    {getTitle()}
                </h2>
                {view === 'balance' ? (
                    <p style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: net >= 0 ? '#4ecd9d' : '#ff6b6b' }}>
                        {t('dashboard.netSavings')}: €{net.toFixed(2)}
                    </p>
                ) : (
                    <p style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: view === 'expense' ? '#ff6b6b' : '#4ecd9d' }}>
                        {t('dashboard.total')}: €{total.toFixed(2)}
                    </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setView('expense')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'expense' ? '#ff6b6b' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: view === 'expense' ? 'bold' : 'normal'
                        }}
                    >
                        {t('dashboard.expenses')}
                    </button>
                    <button
                        onClick={() => setView('income')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'income' ? '#4ecd9d' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: view === 'income' ? 'bold' : 'normal'
                        }}
                    >
                        {t('dashboard.income')}
                    </button>
                    <button
                        onClick={() => setView('balance')}
                        style={{
                            padding: '8px 16px',
                            background: view === 'balance' ? '#3a7bd5' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: view === 'balance' ? 'bold' : 'normal'
                        }}
                    >
                        {t('dashboard.totalBalance')}
                    </button>
                </div>

                <div style={{ width: '100%', height: '300px' }}>
                    {data.length > 0 ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#a0a0b0', marginTop: '100px' }}>
                            {t('charts.noData')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpensesChart;
