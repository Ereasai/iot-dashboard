import {useDashboard} from '../contexts/DashboardContext'

export const SaveButton = () => {

    const { layouts, widgets } = useDashboard();

    const saveLayoutData = () => {
        const dataToSave = {
            layouts: layouts,
            widgets: widgets,
        };
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

    const { init } = useDashboard();

    const loadLayoutData = () => {
        const dataRaw = localStorage.getItem('dashboardLayout');
        const data = JSON.parse(dataRaw);
        init(data);
    };

    return (
        <button onClick={loadLayoutData}>Load</button>
    );
}