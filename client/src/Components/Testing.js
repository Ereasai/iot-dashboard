import {useDashboard} from '../DashboardContext'

export const SaveButton = ({ getLayouts }) => {

    const db = useDashboard();

    const saveLayoutData = () => {
        const layouts = getLayouts();
        const dataToSave = layouts.lg.map(layoutItem => ({
            ...db.widgets.find(item => item.id === layoutItem.i),
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
        }));
        console.group("SaveButton.saveLayoutData()");
        console.log("dataToSave:", dataToSave);
        console.groupEnd();
        localStorage.setItem('dashboardLayout', JSON.stringify(dataToSave));
    };

    return (
        <button onClick={saveLayoutData}>Save</button>
    );
};

export const LoadButton = () => {

    const db = useDashboard();

    const loadLayoutData = () => {
        const dataRaw = localStorage.getItem('dashboardLayout');
        const data = JSON.parse(dataRaw);
        db.init(data);
    };

    return (
        <button onClick={loadLayoutData}>Load</button>
    );
}