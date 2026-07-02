import { TextDecoder, TextEncoder } from 'node:util';

import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom does not implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();
