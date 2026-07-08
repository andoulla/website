import contactData from './contact.json';

interface Contact {
  email: string;
  linkedIn: string;
  github: string;
  medium: string;
}

export const contact: Contact = contactData;
