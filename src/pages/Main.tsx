import React from 'react';
import ReadingList from "../components/ReadingList";
import BookCarousel from "../components/BookCarousel";
import Calendar from "../components/Calendar";

export default function Main() {
    return (
        <div>
            <ReadingList />
            <BookCarousel />
            <Calendar />
        </div>
    );
}