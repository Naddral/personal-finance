import React from 'react';
import { PAYMENT_CATEGORIES } from '../constants/categories';
import { useTranslation } from 'react-i18next';
import './TransactionFilters.css';

const TransactionFilters = ({ filters, onFilterChange }) => {
    const { t } = useTranslation();
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
        <div className="filters-card">
            <div className="filter-group">
                <label className="filter-label">{t('filters.searchCategory')}</label>
                <select name="category" value={localFilters.category} onChange={handleChange} className="filter-select">
                    <option value="">{t('filters.allCategories')}</option>
                    {PAYMENT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{t(`categories.${cat.toLowerCase().replace(/ /g, '_')}`)}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.startDate')}</label>
                <input type="date" name="startDate" value={localFilters.startDate} onChange={handleChange} className="filter-input" />
            </div>

            <div className="filter-group">
                <label className="filter-label">{t('filters.endDate')}</label>
                <input type="date" name="endDate" value={localFilters.endDate} onChange={handleChange} className="filter-input" />
            </div>

            <div className="filters-actions">
                <button onClick={handleSearch} className="btn-search">{t('common.search')}</button>
                <button onClick={handleReset} className="btn-reset">{t('common.reset')}</button>
            </div>
        </div>
    );
};

export default TransactionFilters;
