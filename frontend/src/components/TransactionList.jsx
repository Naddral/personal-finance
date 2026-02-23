import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TransactionList.css';

const TransactionList = ({ transactions, onEdit, onDelete, onSortChange }) => {
    const { t } = useTranslation();

    const formatAmount = (amount) => {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric)) {
            return '0,00';
        }

        return new Intl.NumberFormat('it-IT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numeric);
    };

    const [sortBy, setSortBy] = useState({ field: 'date', dir: 'desc' });

    const toggleSort = (field) => {
        const newSort = sortBy.field === field
            ? { field, dir: sortBy.dir === 'asc' ? 'desc' : 'asc' }
            : { field, dir: 'desc' };
        setSortBy(newSort);
        if (onSortChange) {
            onSortChange(newSort.field, newSort.dir);
        }
    };

    const headerIndicator = (field) => {
        if (sortBy.field !== field) return '';
        return sortBy.dir === 'asc' ? ' ▲' : ' ▼';
    };

    return (
        <div className="transactions-card">
            <h3 className="transactions-title">{t('dashboard.recentTransactions')}</h3>

            {transactions.length === 0 ? (
                <p className="empty-text">{t('transactions.noTransactions')}</p>
            ) : (
                <div className="table-wrapper">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th><button className="header-btn" onClick={() => toggleSort('date')}>{t('transactions.date')}{headerIndicator('date')}</button></th>
                                <th><button className="header-btn" onClick={() => toggleSort('shop')}>{t('transactions.shop')}{headerIndicator('shop')}</button></th>
                                <th><button className="header-btn" onClick={() => toggleSort('category')}>{t('transactions.category')}{headerIndicator('category')}</button></th>
                                <th><button className="header-btn" onClick={() => toggleSort('description')}>{t('transactions.description')}{headerIndicator('description')}</button></th>
                                <th><button className="header-btn" onClick={() => toggleSort('amount')}>{t('transactions.amount')}{headerIndicator('amount')}</button></th>
                                <th>{t('transactions.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, idx) => (
                                <tr key={tx.id} className={idx % 2 === 0 ? '' : 'zebra'}>
                                    <td className="cell nowrap">{tx.date}</td>
                                    <td className="cell" style={{ fontWeight: 700 }}>{tx.shop}</td>
                                    <td className="cell">
                                        <span className="badge">{t(`categories.${tx.category.toLowerCase().replace(/ /g, '_')}`, { defaultValue: tx.category })}</span>
                                    </td>
                                    <td className="cell" style={{ color: '#ccc', fontSize: '0.9rem' }}>{tx.description}</td>
                                    <td className={`amount ${tx.type === 'expense' ? 'expense' : 'income'}`}>{tx.currency || 'EUR'} {formatAmount(tx.amount)}</td>
                                    <td className="actions-cell">
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-edit" onClick={() => onEdit(tx)}>{t('common.edit')}</button>
                                            <button className="btn btn-delete" onClick={() => { if (window.confirm(t('transactions.confirmDelete'))) { onDelete(tx.id); } }}>{t('common.delete')}</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
