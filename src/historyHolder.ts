import { createBrowserHistory, BrowserHistory } from 'history';

export const history = createBrowserHistory() as BrowserHistory<{
  sq?: string;
}>;
