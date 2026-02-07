import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
    return (
        <div style={{
            backgroundColor: '#2a2a40',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflowX: 'auto'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Ultime Transazioni</h3>

            {transactions.length === 0 ? (
                <p style={{ color: '#a0a0b0', fontStyle: 'italic' }}>Nessuna transazione registrata.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444' }}>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Data</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Negozio</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Categoria</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Descrizione</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Importo</th>
                            <th style={{ padding: '10px', color: '#a0a0b0' }}>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '10px' }}>{t.date}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.shop}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: '#333',
                                        fontSize: '0.85rem'
                                    }}>
                                        {t.category}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', color: '#ccc', fontSize: '0.9rem' }}>{t.description}</td>
                                <td style={{
                                    padding: '10px',
                                    fontWeight: 'bold',
                                    color: t.type === 'expense' ? '#ff6b6b' : '#4ecd9d'
                                }}>
                                    {t.type === 'expense' ? '-' : '+'} €{t.amount}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onEdit(t)}
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
                                            Modifica
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
                                                    onDelete(t.id);
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
                                            Cancella
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
