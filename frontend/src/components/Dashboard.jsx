import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import ExpensesChart from './ExpensesChart';
import TransactionFilters from './TransactionFilters';
import LanguageSelector from './LanguageSelector';

const Dashboard = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const getCurrentMonthRange = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            startDate: formatDate(firstDay),
            endDate: formatDate(lastDay)
        };
    };

    const initialRange = getCurrentMonthRange();

    const [filters, setFilters] = useState({
        type: '', // Added type filter
        category: '',
        startDate: initialRange.startDate,
        endDate: initialRange.endDate
    });

    const fetchTransactions = async (currentFilters = filters) => {
        try {
            console.log('Fetching transactions with filters:', currentFilters);
            const res = await axios.get('http://localhost:5000/api/transactions', {
                params: {
                    type: currentFilters.type || undefined,
                    category: currentFilters.category || undefined,
                    startDate: currentFilters.startDate || undefined,
                    endDate: currentFilters.endDate || undefined
                },
                withCredentials: true
            });
            console.log('Received transactions:', res.data.length);
            setTransactions(res.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchTransactions(updatedFilters);
    };

    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/current_user', { withCredentials: true });
                if (response.data) {
                    setUser(response.data);
                    fetchTransactions(); // Fetch transactions after user is confirmed
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching user', error);
                navigate('/');
            }
        };
        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handleLogout = () => {
        window.open('http://localhost:5000/api/logout', '_self');
    };

    const handleTransactionAdded = () => {
        fetchTransactions();
        setEditingTransaction(null);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        // Optional: Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingTransaction(null);
    };

    const handleDelete = async (id) => {
        try {
            console.log('Frontend attempting to delete transaction ID:', id);
            await axios.delete(`http://localhost:5000/api/transactions/${id}`, { withCredentials: true });
            console.log('Deletion successful for ID:', id);
            fetchTransactions(); // Refresh list
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert(t('common.errorDelete'));
        }
    };

    if (!user) return <div>{t('common.loading')}...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>{t('dashboard.title')}</h1>
                    <p style={{ margin: '5px 0 0', color: '#a0a0b0' }}>{t('dashboard.welcome')}, {user.name}!</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <LanguageSelector />
                    <button onClick={() => setShowChart(true)} style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#555',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        📊 {t('dashboard.chart')}
                    </button>
                    <button onClick={handleLogout} style={{
                        padding: '8px 16px',
                        background: '#333',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer'
                    }}>{t('common.logout')}</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                <div>
                    <TransactionForm
                        key={editingTransaction ? editingTransaction.id : 'new'}
                        onTransactionAdded={handleTransactionAdded}
                        editingTransaction={editingTransaction}
                        onCancelEdit={handleCancelEdit}
                    />
                </div>
                <div>
                    <TransactionFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <TransactionList
                        transactions={transactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {showChart && (
                <ExpensesChart
                    transactions={transactions}
                    onClose={() => setShowChart(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
