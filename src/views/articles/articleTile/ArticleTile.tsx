import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

import { TagList } from '@/components/tagList';
import type { Article } from '@/types';
import { formatDate } from '@/utils/formatDate';

interface ArticleTileProps {
  article: Article;
}

const lineClampSx = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
});

const getTagColour = () => 'secondary' as const;

export const ArticleTile = memo(({ article }: ArticleTileProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        minHeight: 320,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      }}
    >
      <CardActionArea
        component="a"
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
          <Typography variant="h6" component="h2" sx={lineClampSx(2)}>
            {article.title}
          </Typography>
          {article.imageUrl !== undefined && (
            <Box
              sx={{
                position: 'relative',
                mt: 1,
                mb: 1,
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: 'action.hover',
              }}
            >
              <CardMedia
                component="img"
                image={article.imageUrl}
                // decorative — the adjacent heading already names the article
                alt=""
                sx={{ height: 200, objectFit: 'cover', display: 'block' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#ffffff',
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {formatDate(article.publishedDate)}
                </Typography>
              </Box>
            </Box>
          )}
          {article.imageUrl === undefined && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {formatDate(article.publishedDate)}
            </Typography>
          )}
          <Typography variant="body2" sx={lineClampSx(3)}>
            {article.excerpt}
          </Typography>
          <Box sx={{ mt: 'auto', pt: 1.5 }}>
            <TagList items={article.tags} getColour={getTagColour} variant="outlined" />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
});

ArticleTile.displayName = 'ArticleTile';
