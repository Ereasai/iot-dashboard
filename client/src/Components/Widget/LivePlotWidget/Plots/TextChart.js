import { Typography } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';


const TextChart = ({ data }) => {
  const ref = useRef(null);
  const [text, setText] = useState('');

  useEffect(() => {
    // data
    const last = data[data.length - 1];
    if (last)
      setText(last.value_string);
    else
      setText('No Data')
  }, [data]);

  // return <div ref={ref} style={{
  //   width: '100%', height: '100%',
  //   display: 'flex', justifyContent: 'center',
  //   alignItems: 'center'
  // }}>
  //   {text}
  // </div>
  return <Typography variant='h6' noWrap>{text}</Typography>
}

export default TextChart;