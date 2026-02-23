import React, { useState } from 'react';
import axios from 'axios';

const CsvImport = ({ onImported }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleImport = async () => {
        if (!file) {
            setMessage('Seleziona un file CSV prima di importare.');
            return;
        }

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
            setFile(null);
            if (onImported) {
                onImported();
            }
        } catch (error) {
            const apiError = error.response?.data?.error;
            setMessage(apiError || 'Import fallito.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: '#2a2a40',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Import CSV</h3>
            <p style={{ marginTop: 0, color: '#a0a0b0', fontSize: '0.9rem' }}>
                Formato richiesto: Data;Importo;Categoria;Negozio;Descrizione
            </p>

            <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ marginBottom: '12px', color: '#fff' }}
            />

            <div>
                <button
                    type="button"
                    onClick={handleImport}
                    disabled={isLoading}
                    style={{
                        padding: '10px 16px',
                        background: 'linear-gradient(90deg, #16c79a 0%, #0f9baf 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Import in corso...' : 'Importa CSV'}
                </button>
            </div>

            {message && (
                <p style={{ marginTop: '12px', color: '#d7d7e0' }}>{message}</p>
            )}
        </div>
    );
};

export default CsvImport;
