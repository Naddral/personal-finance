import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TransactionForm from './TransactionForm';
import Modal from './Modal';
import './Dashboard.css';
import TransactionList from './TransactionList';
import ExpensesChart from './ExpensesChart';
import TransactionFilters from './TransactionFilters';
import LanguageSelector from './LanguageSelector';
import CsvImport from './CsvImport';

const Dashboard = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);

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

    const [sorting, setSorting] = useState({ sortBy: 'date', sortDir: 'desc' });

    const fetchTransactions = useCallback(async (filtersToUse = filters, sortingToUse = sorting) => {
        try {
            console.log('Fetching transactions with filters:', filtersToUse, 'and sorting:', sortingToUse);
            const res = await axios.get('http://localhost:5000/api/transactions', {
                params: {
                    type: filtersToUse.type || undefined,
                    category: filtersToUse.category || undefined,
                    startDate: filtersToUse.startDate || undefined,
                    endDate: filtersToUse.endDate || undefined,
                    sortBy: sortingToUse.sortBy,
                    sortDir: sortingToUse.sortDir
                },
                withCredentials: true
            });
            console.log('Received transactions:', res.data.length, 'sorted by:', sortingToUse.sortBy, sortingToUse.sortDir);
            setTransactions(res.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }, [filters, sorting]);

    const handleFilterChange = (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        fetchTransactions(updatedFilters, sorting);
    };

    const handleSortChange = (sortBy, sortDir) => {
        const newSorting = { sortBy, sortDir };
        setSorting(newSorting);
        fetchTransactions(filters, newSorting);
    };

    const [showChart, setShowChart] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/current_user', { withCredentials: true });
                if (response.data) {
                    setUser(response.data);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error fetching user', error);
                navigate('/');
            }
        };
        fetchUser();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleLogout = () => {
        window.open('http://localhost:5000/api/logout', '_self');
    };

    const handleTransactionAdded = () => {
        fetchTransactions();
        setEditingTransaction(null);
        setShowFormModal(false);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowFormModal(true);
    };

    const handleCancelEdit = () => {
        setEditingTransaction(null);
        setShowFormModal(false);
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
        <div className="dashboard">
            <div className="header">
                <div>
                    <h1 className="header-title">{t('dashboard.title')}</h1>
                    <p className="header-sub">{t('dashboard.welcome')}, {user.name}!</p>
                </div>
                <div className="header-actions">
                    <LanguageSelector />
                    <button className="btn-add" onClick={() => { setEditingTransaction(null); setShowFormModal(true); }}>{t('dashboard.addTransaction')}</button>
                    <CsvImport onImported={fetchTransactions} compact={true} />
                    <button className="btn-chart" onClick={() => setShowChart(true)}>📊 {t('dashboard.chart')}</button>
                    <button className="btn-logout" onClick={handleLogout}>{t('common.logout')}</button>
                </div>
            </div>

            <div className="layout-grid">
                <div>
                    <TransactionFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <TransactionList
                        transactions={transactions}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSortChange={handleSortChange}
                    />
                </div>
            </div>

            {showChart && (
                <ExpensesChart
                    transactions={transactions}
                    onClose={() => setShowChart(false)}
                />
            )}

            {showFormModal && (
                <Modal title={editingTransaction ? t('transactions.editTransaction') : t('transactions.newTransaction')} onClose={handleCancelEdit}>
                    <TransactionForm
                        key={editingTransaction ? editingTransaction.id : 'new'}
                        onTransactionAdded={handleTransactionAdded}
                        editingTransaction={editingTransaction}
                        onCancelEdit={handleCancelEdit}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
