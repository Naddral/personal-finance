import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

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
                    { name: t('dashboard.income'), value: income, rawCategory: 'income' },
                    { name: t('dashboard.expenses'), value: expense, rawCategory: 'expense' }
                ],
                total: income + expense,
                net: income - expense
            };
        }

        const filtered = transactions.filter(tx => tx.type === view);
        const grouped = filtered.reduce((acc, curr) => {
            const cat = curr.category || 'ALTRO';
            const translatedCat = t(`categories.${cat.toLowerCase().replace(/ /g, '_')}`, { defaultValue: cat });
            if (!acc[translatedCat]) acc[translatedCat] = { value: 0, rawCategory: cat };
            acc[translatedCat].value += parseFloat(curr.amount);
            return acc;
        }, {});

        const chartData = Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key].value,
            rawCategory: grouped[key].rawCategory
        }));

        const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

        return { data: chartData, total: totalValue, net: 0 };
    }, [transactions, view, t]);

    const getTitle = () => {
        if (view === 'expense') return t('charts.expenseAnalysis');
        if (view === 'income') return t('charts.incomeAnalysis');
        return t('charts.totalBalance');
    };

    // Prepare data for horizontal bar chart: sort descending and compute percentage
    const barData = React.useMemo(() => {
        const totalValue = data.reduce((s, it) => s + it.value, 0) || 1;
        return data
            .map((d) => ({ ...d, percent: totalValue ? (d.value / totalValue) : 0 }))
            .sort((a, b) => b.value - a.value)
            .map((d) => ({ ...d, percentLabel: `${Math.round(d.percent * 100)}%` }));
    }, [data]);

    const categoryColors = {
        // Expense categories
        'SPESE FISSE': '#4a5568',      // Gray-blue (fixed/regular)
        'NECESSITÀ': '#ef4444',        // Red (essential)
        'PRELIEVO': '#6b7280',         // Gray (cash withdrawal)
        'ALIMENTARI': '#f97316',       // Orange (food)
        'BENZINA': '#064e78',          // Dark blue (fuel)
        'FUMETTI': '#a855f7',          // Purple (entertainment/comics)
        'VIDEOGIOCHI': '#06b6d4',      // Cyan (tech/gaming)
        'ACQUISTI': '#ec4899',         // Pink (shopping)
        'PELLET': '#92400e',           // Brown (heating material)
        'CRESCITA': '#16a34a',         // Green (personal growth)
        'ALTRO': '#9ca3af',            // Gray (other)
        // Income categories
        'STIPENDIO': '#22c55e',        // Bright green (salary/income)
        // Balance view
        'income': '#4ecd9d',           // Green
        'expense': '#ff6b6b'           // Red
    };

    const colors = React.useMemo(() => {
        if (view === 'balance') {
            return ['#ff6b6b', '#4ecd9d'];
        }
        
        return barData.map((item) => {
            const rawCat = item.rawCategory || 'ALTRO';
            return categoryColors[rawCat] || '#9ca3af';
        });
    }, [barData, view]);

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

                <div style={{ width: '100%', height: Math.max(200, barData.length * 48) }}>
                    {barData.length > 0 ? (
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={barData} margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
                                <XAxis type="number" tickFormatter={(v) => `€${v.toFixed(0)}`} />
                                <YAxis type="category" dataKey="name" width={160} />
                                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#333', borderColor: '#555' }} />
                                <Legend />
                                <Bar dataKey="value" isAnimationActive={false}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                    <LabelList dataKey="percentLabel" position="inside" style={{ fill: '#fff', fontWeight: 600 }} />
                                </Bar>
                            </BarChart>
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
