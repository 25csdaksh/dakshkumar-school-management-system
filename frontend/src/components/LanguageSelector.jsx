import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', label: 'EN' },
    { code: 'hi', name: 'हिन्दी', label: 'HI' },
    { code: 'gu', name: 'ગુજરાતી', label: 'GU' }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language.split('-')[0]) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lngCode) => {
    i18n.changeLanguage(lngCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          width: 'auto',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer'
        }}
        title="Change Language"
      >
        <Globe size={18} />
        <span>{currentLanguage.label}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '140px',
            zIndex: 1000,
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn var(--transition-fast) forwards'
          }}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  background: isSelected ? 'var(--primary-glow)' : 'transparent',
                  border: 'none',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? '600' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background var(--transition-fast), color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--sidebar-hover-bg, rgba(0,0,0,0.04))';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                {lang.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
