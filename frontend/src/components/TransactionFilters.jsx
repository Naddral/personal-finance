import React from 'react';
import { PAYMENT_CATEGORIES } from '../constants/categories';

const TransactionFilters = ({ filters, onFilterChange }) => {
    const [localFilters, setLocalFilters] = React.useState(filters);

    // Synchronize local state with props (useful for resets)
    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (e) => {
        setLocalFilters({ ...localFilters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        onFilterChange(localFilters);
    };

    const handleReset = () => {
        const resetValue = {
            category: '',
            startDate: '',
            endDate: ''
        };
        setLocalFilters(resetValue);
        onFilterChange(resetValue);
    };

    return (
        <div style={{
            backgroundColor: '#2a2a40',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            alignItems: 'flex-end'
        }}>
            <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>Cerca Categoria</label>
                <select
                    name="category"
                    value={localFilters.category}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                >
                    <option value="">Tutte le categorie</option>
                    {PAYMENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>Da Data</label>
                <input
                    type="date"
                    name="startDate"
                    value={localFilters.startDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                />
            </div>

            <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>A Data</label>
                <input
                    type="date"
                    name="endDate"
                    value={localFilters.endDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #444', background: '#1e1e2f', color: 'white' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '8px 20px',
                        background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        height: '38px'
                    }}
                >
                    Cerca
                </button>
                <button
                    onClick={handleReset}
                    style={{
                        padding: '8px 16px',
                        background: '#444',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        height: '38px'
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default TransactionFilters;
