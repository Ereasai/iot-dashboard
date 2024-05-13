import React, {useEffect, useState, useRef} from 'react';


const TextChart = ({data}) => {
    const ref = useRef(null);
    const [text, setText] = useState('');
    const [fontSize, setFontSize] = useState('16px');

    useEffect(() => {
        console.log(data)
        function handleResize() {
            if (ref.current) {
                const { height } = ref.current.getBoundingClientRect();
                const newFontSize = height / 2;
                setFontSize(`${newFontSize}px`);
            }
        }
      
        window.addEventListener('resize', handleResize);

        // data
        const last = data[data.length-1];
        if (last)
            setText(last.value_string);
        else
            setText('No Data')

        return () => window.removeEventListener('resize', handleResize);
    }, [data]);

    return  <div ref={ref} style={{width: '100%', height: '100%', 
                        display: 'flex', justifyContent: 'center', 
                        alignItems: 'center', fontSize}}>
                
                {text}
                
            </div>
}

export default TextChart;