import React from 'react';
import { Card } from '@mui/material';
import { gradients } from '../../theme/v2Theme';

export const GradientCard = ({ children, gradient = gradients.primary, hoverable = true, sx = {}, ...props }) => {
  return (
    <Card
      sx={{
        background: gradient,
        borderRadius: '20px',
        color: '#fff',
        transition: 'all 0.3s ease',
        ...(hoverable && {
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};
