'use client';

import { ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import MuiCard from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  footer?: ReactNode;
  elevation?: number;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  elevation = 1,
  hoverable = true,
  onClick,
  className,
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      transition={{ duration: 0.3 }}
    >
      <MuiCard
        elevation={elevation}
        onClick={onClick}
        className={className}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title || subtitle || action ? (
          <Box sx={{ px: 3, pt: 3, pb: 1 }}>
            {title && (
              <Typography variant="h5" component="div" gutterBottom>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {subtitle}
              </Typography>
            )}
            {action && <Box sx={{ mt: 1 }}>{action}</Box>}
          </Box>
        ) : null}
        <CardContent sx={{ flexGrow: 1 }}>{children}</CardContent>
        {footer ? (
          <CardActions sx={{ px: 3, pb: 3 }}>{footer}</CardActions>
        ) : null}
      </MuiCard>
    </motion.div>
  );
}

Card.displayName = 'Card';

export default memo(Card);
