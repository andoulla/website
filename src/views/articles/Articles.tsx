import ArticleIcon from '@mui/icons-material/Article';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';

import { PageContainer } from '@/components/pageContainer';
import type { Article } from '@/types';
import { loadArticles } from '@/utils/loadArticles';

import { ArticleTile } from './articleTile';

interface ArticlesState {
  articles: Article[];
  loading: boolean;
  error: Error | null;
}

const INITIAL_STATE: ArticlesState = { articles: [], loading: true, error: null };

const StatusMessage = ({ icon, message }: { icon: ReactNode; message: string }) => (
  <Fade in>
    <Stack sx={{ py: 8, alignItems: 'center', gap: 1.5 }}>
      {icon}
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  </Fade>
);

const renderContent = (state: ArticlesState) => {
  if (state.loading) {
    return (
      <Stack sx={{ py: 8, alignItems: 'center' }}>
        <CircularProgress aria-label="Loading articles" />
      </Stack>
    );
  }

  if (state.error !== null) {
    return (
      <StatusMessage
        icon={<ErrorIcon color="error" fontSize="large" />}
        message="Couldn't load articles right now. Please try again later."
      />
    );
  }

  if (state.articles.length === 0) {
    return (
      <StatusMessage
        icon={<ArticleIcon color="disabled" fontSize="large" />}
        message="No articles published yet."
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 2,
      }}
    >
      {state.articles.map((article) => (
        <ArticleTile key={article.id} article={article} />
      ))}
    </Box>
  );
};

export const Articles = () => {
  const [state, setState] = useState<ArticlesState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    loadArticles()
      .then((articles) => {
        if (!cancelled) setState({ articles, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            articles: [],
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to load articles'),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <Typography variant="h3" component="h1" sx={{ mb: 1.5 }}>
        Articles
      </Typography>
      <Typography color="text.disabled" sx={{ mb: { xs: 1.5, sm: 3 } }}>
        This is a collection of articles I&apos;ve written to share experiences and lessons learned
        from my day-to-day work as a software engineer. I write them mostly for future-me, but hope
        they&apos;re useful to you too.
      </Typography>
      {renderContent(state)}
    </PageContainer>
  );
};
