import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button className={styles.toggleButton} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
