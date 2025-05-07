import React from 'react';
import ReadingList from "../components/ReadingList";
import BookCarousel from "../components/BookCarousel";
import Calendar from "../components/Calendar";
import Login from "../components/Login";

export default function Main() {
    return (
        <div>
            {/*<Login />*/}
            <ReadingList />
            <BookCarousel />
            <Calendar />
        </div>
    );
}