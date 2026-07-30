import Container from '@mui/material/Container';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <Container
      maxWidth="lg"
      sx={(theme) => ({
        position: 'relative',
        py: 4,
        [theme.breakpoints.up('xl')]: {
          maxWidth: theme.breakpoints.values.md,
        },
      })}
    >
      {children}
    </Container>
  );
};
