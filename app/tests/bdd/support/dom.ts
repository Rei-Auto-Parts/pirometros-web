import 'global-jsdom/register';
import { After } from '@cucumber/cucumber';
import { cleanup } from '@testing-library/react';

After(() => {
  cleanup();
});
