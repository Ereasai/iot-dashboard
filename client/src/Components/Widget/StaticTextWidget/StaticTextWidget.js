import React from 'react'
import Widget from '../WidgetV3'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'

const StaticTextWidget = ({ id, text }) => {
  return (
    <Widget title={text} id={id}>
      <Box
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <Typography variant='h4' noWrap>
          {text}
        </Typography>

      </Box>
    </Widget>
  )
}

export default StaticTextWidget
