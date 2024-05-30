import React, { useState } from 'react'
import Widget from '../WidgetV3'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import StaticTextWidgetEdit from './StaticTextWidgetEdit'

const StaticTextWidget = ({ id, text }) => {

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Widget 
        title={text} 
        id={id} 
        openSettings={() => setSettingsOpen(true)}
      >
        <Box
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'none',
          }}
        >

          <Typography variant='h4' noWrap>
            {text}
          </Typography>

        </Box>
      </Widget>
      <StaticTextWidgetEdit
        id={id}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}

export default StaticTextWidget
