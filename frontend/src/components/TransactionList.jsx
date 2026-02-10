import React from 'react';
import { useTranslation } from 'react-i18next';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    const { t } = useTranslation();
    return (
        <div style={{
            backgroundColor: '#2a2a40',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflowX: 'auto'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>{t('dashboard.recentTransactions')}</h3>

            {transactions.length === 0 ? (
                <p style={{ color: '#a0a0b0', fontStyle: 'italic' }}>{t('transactions.noTransactions')}</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444' }}>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.date')}</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.shop')}</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.category')}</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.description')}</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.amount')}</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>{t('transactions.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{tx.date}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{tx.shop}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: '#333',
                                        fontSize: '0.85rem'
                                    }}>
                                        {t(`categories.${tx.category.toLowerCase().replace(/ /g, '_')}`, { defaultValue: tx.category })}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', color: '#ccc', fontSize: '0.9rem' }}>{tx.description}</td>
                                <td style={{
                                    padding: '10px',
                                    fontWeight: 'bold',
                                    color: tx.type === 'expense' ? '#ff6b6b' : '#4ecd9d'
                                }}>
                                    {tx.type === 'expense' ? '-' : '+'} €{tx.amount}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onEdit(tx)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #555',
                                                borderRadius: '4px',
                                                color: '#fff',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {t('common.edit')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(t('transactions.confirmDelete'))) {
                                                    onDelete(tx.id);
                                                }
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ff4d4d',
                                                borderRadius: '4px',
                                                color: '#ff4d4d',
                                                padding: '4px 8px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionList;
