import { Box } from '@mui/system';
import React from 'react'

const logoUrl = process.env.PUBLIC_URL + '/logo.png';

export const Logo = () => {
  return (
    <Box
      component="img"
      src={logoUrl}
      alt="MySMax Logo"
      draggable="false"
      onDragStart={e => { e.preventDefault() }}
      sx={{
        WebkitUserDrag: 'none',
        KhtmlUserDrag: 'none',
        MozUserDrag: 'none',
        OUserDrag: 'none',
        userDrag: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  )
}
