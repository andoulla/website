import Email from '@mui/icons-material/Email';
import GitHub from '@mui/icons-material/GitHub';
import LinkedIn from '@mui/icons-material/LinkedIn';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import { contact } from '@/data/contact';

export const ContactDetails = () => {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 0.5 }}>
      <Link href={`mailto:${contact.email}`} underline="hover" color="primary">
        <Email aria-hidden="true" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        {contact.email}
      </Link>
      <Link
        href={contact.linkedIn}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color="primary"
      >
        <LinkedIn aria-hidden="true" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        LinkedIn
      </Link>
      <Link
        href={contact.github}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color="primary"
      >
        <GitHub aria-hidden="true" fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        GitHub
      </Link>
    </Stack>
  );
};
