import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-selector">
            <button
                onClick={() => changeLanguage('it')}
                className={i18n.language === 'it' ? 'active' : ''}
                title="Italiano"
            >
                🇮🇹
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : ''}
                title="English"
            >
                🇬🇧
            </button>
        </div>
    );
};

export default LanguageSelector;
