import React, { useState } from 'react';
import './TransactionForm.css';
import axios from 'axios';
import { PAYMENT_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { useTranslation } from 'react-i18next';

const TransactionForm = ({ onTransactionAdded, editingTransaction, onCancelEdit }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(editingTransaction ? {
        date: editingTransaction.date,
        amount: editingTransaction.amount,
        currency: editingTransaction.currency || 'EUR',
        category: editingTransaction.category,
        shop: editingTransaction.shop || '',
        description: editingTransaction.description || '',
        type: editingTransaction.type
    } : {
        date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: 'EUR',
        category: '',
        shop: '',
        description: '',
        type: 'expense'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setFormData({ ...formData, [name]: value, category: '' }); // Reset category on type change
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await axios.put(`http://localhost:5000/api/transactions/${editingTransaction.id}`, formData, { withCredentials: true });
            } else {
                await axios.post('http://localhost:5000/api/transactions', formData, { withCredentials: true });
            }

            // Reset form if adding, or clear edit mode
            if (!editingTransaction) {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    amount: '',
                    category: '',
                    shop: '',
                    description: '',
                    type: 'expense'
                });
            }
            onTransactionAdded(); // Callback to refresh list
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert(t('transactions.errorSave'));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-card">
            <h3 className="form-title">{editingTransaction ? t('transactions.editTransaction') : t('transactions.newTransaction')}</h3>

            <div className="form-grid">
                <div>
                    <label className="form-label">{t('transactions.date')}</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="form-input" />
                </div>
                <div>
                    <label className="form-label">{t('transactions.amount')} (€)</label>
                    <div className="input-row">
                        <input type="number" name="amount" step="0.01" value={formData.amount} onChange={handleChange} required className="form-input" />

                        <select name="currency" value={formData.currency} onChange={handleChange} className={`form-input currency-select`}>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-grid">
                <div>
                    <label className="form-label">{t('transactions.category')}</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="form-input">
                        <option value="" disabled>{t('transactions.selectCategory')}</option>
                        {(formData.type === 'expense' ? PAYMENT_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase().replace(/ /g, '_')}`)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label">{t('transactions.shop')}</label>
                    <input type="text" name="shop" value={formData.shop} onChange={handleChange} placeholder={t('transactions.shopPlaceholder')} className="form-input" />
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label className="form-label">{t('transactions.description')}</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder={t('transactions.descriptionPlaceholder')} className="form-input" />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="form-label">{t('transactions.type')}</label>
                <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                    <option value="expense">{t('transactions.typeExpense')}</option>
                    <option value="income">{t('transactions.typeIncome')}</option>
                </select>
            </div>

            <div className="btn-row">
                <button type="submit" className="btn-submit">{editingTransaction ? t('transactions.saveChanges') : t('dashboard.addTransaction')}</button>

                {editingTransaction && (
                    <button type="button" onClick={onCancelEdit} className="btn-cancel">{t('common.cancel')}</button>
                )}
            </div>
        </form>
    );
};

export default TransactionForm;
