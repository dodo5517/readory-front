import React, { useState } from 'react';
import styles from '../styles/Calendar.module.css';

interface Record {
    date: string; // YYYY-MM-DD
    hasRecord: boolean;
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    const dummyRecords: Record[] = [
        { date: '2025-05-01', hasRecord: true },
        { date: '2025-05-03', hasRecord: true },
        { date: '2025-05-10', hasRecord: true }
    ];

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const formatDate = (year: number, month: number, day: number): string =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className={styles.day}></div>);
    }
    for (let day = 1; day <= totalDays; day++) {
        const fullDate = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
        const hasRecord = dummyRecords.some(r => r.date === fullDate);
        days.push(
            <div key={day} className={`${styles.day} ${hasRecord ? styles.active : ''}`}>
                {day}
            </div>
        );
    }

    return (
        <div>
            <hr className={styles.hr} />
        <section className={styles.calendar}>
            <div className={styles.header}>
                <button onClick={() => changeMonth(-1)}>‹</button>
                <span className={styles.main}>
                    <h2>{currentDate.getFullYear()}/ {currentDate.getMonth() + 1}</h2>
                    <p className={styles.subheading}>Reading Calendar</p>
                </span>
                <button onClick={() => changeMonth(1)}>›</button>
            </div>

            <div className={styles.weekdays}>
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={i} className={styles.weekday}>{day}</div>
                ))}
            </div>

            <div className={styles.grid}>
                {days}
            </div>
        </section>
        </div>
    );
}
