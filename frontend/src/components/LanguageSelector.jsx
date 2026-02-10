import React from 'react';
import { useTranslation } from 'react-i18next';

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
            >
                IT
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : ''}
            >
                EN
            </button>

            <style jsx>{`
        .language-selector {
          display: flex;
          gap: 10px;
          margin: 10px;
        }
        button {
          padding: 5px 10px;
          border: 1px solid #ccc;
          background: #f0f0f0;
          cursor: pointer;
          border-radius: 4px;
        }
        button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }
      `}</style>
        </div>
    );
};

export default LanguageSelector;
