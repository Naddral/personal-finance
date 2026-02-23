import React, { useRef, useState } from 'react';
import axios from 'axios';
import './CsvImport.css';

const CsvImport = ({ onImported, compact = false }) => {
    const fileRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const triggerFile = () => {
        setMessage('');
        fileRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        setMessage('');
        try {
            const csvContent = await file.text();
            const response = await axios.post(
                'http://localhost:5000/api/transactions/import-csv',
                { csvContent },
                { withCredentials: true }
            );
            const { imported, skipped } = response.data;
            setMessage(`Import completato: ${imported} righe inserite, ${skipped} righe saltate.`);
            if (onImported) onImported();
        } catch (err) {
            const apiError = err.response?.data?.error;
            setMessage(apiError || 'Import fallito.');
        } finally {
            setIsLoading(false);
            e.target.value = null;
        }
    };

    return (
        <div className={`csv-import ${compact ? 'inline' : ''}`}>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} style={{ display: 'none' }} />
            <button type="button" className="csv-btn" onClick={triggerFile} disabled={isLoading}>
                {isLoading ? 'Import in corso...' : 'Importa CSV'}
            </button>
            {!compact && message && <div className="csv-message">{message}</div>}
        </div>
    );
};

export default CsvImport;
