import React, { useState } from 'react';
import axios from 'axios';
import { PAYMENT_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

const TransactionForm = ({ onTransactionAdded, editingTransaction, onCancelEdit }) => {
    const [formData, setFormData] = useState(editingTransaction ? {
        date: editingTransaction.date,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        shop: editingTransaction.shop || '',
        description: editingTransaction.description || '',
        type: editingTransaction.type
    } : {
        date: new Date().toISOString().split('T')[0],
        amount: '',
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
            alert('Errore nel salvataggio della transazione');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            backgroundColor: '#2a2a40',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>
                {editingTransaction ? 'Modifica Transazione' : 'Nuova Transazione'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Data</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Importo (€)</label>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Categoria</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                    >
                        <option value="" disabled>Seleziona categoria</option>
                        {(formData.type === 'expense' ? PAYMENT_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Negozio / Shop</label>
                    <input
                        type="text"
                        name="shop"
                        value={formData.shop}
                        onChange={handleChange}
                        placeholder="Es. Coop, Amazon..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Descrizione</label>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Dettagli aggiuntivi..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#a0a0b0' }}>Tipo</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                >
                    <option value="expense">Uscita (Spesa)</option>
                    <option value="income">Entrata (Stipendio, Regali...)</option>
                </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    {editingTransaction ? 'Salva Modifiche' : 'Aggiungi Transazione'}
                </button>

                {editingTransaction && (
                    <button type="button" onClick={onCancelEdit} style={{
                        padding: '12px 20px',
                        background: 'transparent',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: '#a0a0b0',
                        cursor: 'pointer'
                    }}>
                        Annulla
                    </button>
                )}
            </div>
        </form>
    );
};

export default TransactionForm;
