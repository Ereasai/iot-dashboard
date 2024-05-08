import React from 'react';
import styles from '../styles.js'
import {AddButton, WidgetStatusButton, RemoveWidgetButton} from './NavbarButtons.js';
import {useDashboard} from '../DashboardContext.js'

const LeftNavBar = () => {

    const db = useDashboard();

    return (
        <div style={styles.leftNavBar}>
            <AddButton />
            <WidgetStatusButton />
            {db.widgets.map(w => {
                return (<RemoveWidgetButton removeID={w.uid}/>)
            })}
        </div>
    )
}


export default LeftNavBar;