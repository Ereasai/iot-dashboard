import React, {useState, useEffect} from 'react';
import {useDashboard} from '../DashboardContext'

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

export const NewWidgetPopup = ({onClose}) => {
    // need to make api call to get metadata.
    // depending on the metadata, form needs to have different options.

    const [formData, setFormData] = useState({
        thingID: undefined,
        valueID: undefined,
        plotType: 0,

        isRealTime: false,
        intervalLength: 0,
        
        startDate: '',
        endDate: '',
    });

    const [metadata, setMetadata] = useState({things: [], values: []});

    useEffect(() => {

        
        const fetchMetadata = async () => {
            try {
                // get things metadata
                const thingResponse = await fetch(`http://${BACKEND_URL}/get-things`);
                const thingData = await thingResponse.json(); // expects a list
                const things = thingData.map(e => ({
                        thing_id: e.thing_id, 
                        thing_name: e.thing_name,
                        thing_description: e.thing_description
                }));
                
                // get values metadata
                const valueResponse = await fetch(`http://${BACKEND_URL}/get-value-metadata`);
                const values = await valueResponse.json();

                setMetadata(prev => ({
                    ...prev, things, values
                }))
            } catch (error) {
                console.error('Failed to fetch thing metadata.', error);
            }
        };
    
        fetchMetadata();
      }, []); // Empty dependency array to run only once when the popup opens
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log({name, value})
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // const handleChangeThing = (e) => {
    //     handleChange(e); // update form data
    //     const { name, value } = e.target;
    //     // update value options
    // }
    
    const db = useDashboard();
    const handleSubmit = (e) => {
        e.preventDefault(); 
        console.log('Form Data Submitted:', formData);
        db.addWidget(formData); // update global state of widgets.
        onClose(); 
    };

    return (
        <div style={{
            position: 'absolute', top: '10px', left: '10px',
            width: '300px', padding: '30px', backgroundColor: 'white', boxShadow: '0px 0px 100px rgba(0,0,0,0.3)',
            borderRadius: '10px',
            zIndex: 1000
        }}>
            <h2>Add</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

                <label>
                    thing:
                    <select name="thingID" value={formData.thingID} onChange={handleChange}>
                        {/* Display all optinos for things */}
                            <option value={undefined}>n/a</option>
                        {metadata.things && metadata.things.map(t => (
                            <option value={t.thing_id}>{t.thing_name} ({t.thing_id})</option>
                        ))}
                    </select>

                </label>

                <label>
                    value:
                    {/* <input type="number" name="valueID" value={formData.valueID} onChange={handleChange} required/> */}
                    <select name="valueID" value={formData.valueID} onChange={handleChange}>
                        <option value={undefined}>n/a</option>
                        {metadata.values && metadata.values.filter(v => (v.thing_id == formData.thingID))
                                                           .map(v => (
                            <option value={v.value_id}>{v.value_name}</option>
                        ))}

                    </select>
                </label>

                <label>
                    plotType:
                    <select name="plotType" value={formData.plotType} onChange={handleChange}>
                        <option value="">Select a chart type</option>
                        <option value="line">Line</option>
                        <option value="bar">Bar</option>
                        <option value="text">Text</option>
                    </select>
                </label>

                <label>
                    isRealTime:
                    <input type='checkbox' name='isRealTime' checked={formData.isRealTime} onChange={(e) => {
                        setFormData(prev => ({
                            ...prev, isRealTime: e.target.checked
                        }))
                    }}/>
                </label>

                {(!formData.isRealTime) &&
                    <div>
                        <label>
                            startDate:
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </label>
                        <br/>
                        <label>
                            endDate:
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </label>
                    </div>
                }

                <br />
                <button type="submit">Submit</button>
                <button type="button" onClick={onClose} style={{background: 'pink'}}>Close</button>
            </form>
        </div>
    );
}

export const AddButton = () => {
    
    const [isPopupOpen, setPopupOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setPopupOpen(true)} style={{width: '100%'}}>Add v2</button>
            {isPopupOpen && <NewWidgetPopup onClose={() => setPopupOpen(false)} />}
        </div>  
        
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