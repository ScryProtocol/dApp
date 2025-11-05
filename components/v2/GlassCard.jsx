import React from 'react';
import { Card } from '@mui/material';

export const GlassCard = ({ children, blur = 20, sx = {}, ...props }) => {
  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: `blur(${blur}px)`,
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 12px 48px rgba(99, 102, 241, 0.2)',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};
