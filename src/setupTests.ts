import { TextDecoder, TextEncoder } from 'node:util';

import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
