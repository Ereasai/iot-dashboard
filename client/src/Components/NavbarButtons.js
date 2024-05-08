import React, {useState} from 'react';
import {useDashboard} from '../DashboardContext'

export const AddButton = () => {

    const db = useDashboard();

    const handleClick = () => {
        db.addWidget({content: `Contents of item`});
    }

    return (
        <button onClick={handleClick}>
            Add v2
        </button>
    );
}

export const WidgetStatusButton = () => {

    const db = useDashboard();

    const handleClick = () => {
        db.printWidget();
    }

    return (
        <button onClick={handleClick}>
            print widget
        </button>
    );
}

export const RemoveWidgetButton = ({removeID}) => {
    const db = useDashboard();
    const handleClick = () => {
        db.removeWidget(removeID);
    }
    return (
        <button onClick={handleClick}>
            Remove {removeID}
        </button>
    )
}