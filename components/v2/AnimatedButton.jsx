import React from 'react';
import { Button } from '@mui/material';
import { gradients } from '../../theme/v2Theme';

export const AnimatedButton = ({ children, glow = true, variant = 'contained', sx = {}, ...props }) => {
  return (
    <Button
      variant={variant}
      sx={{
        borderRadius: '12px',
        fontWeight: 600,
        textTransform: 'none',
        px: 3,
        py: 1.5,
        transition: 'all 0.3s ease',
        ...(variant === 'contained' && {
          background: gradients.primary,
          '&:hover': {
            background: gradients.primary,
            transform: 'scale(1.05)',
            ...(glow && {
              boxShadow: '0px 8px 24px rgba(99, 102, 241, 0.4)',
            }),
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
