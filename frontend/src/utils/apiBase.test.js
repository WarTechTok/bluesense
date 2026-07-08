import { getApiBase } from './apiBase';

describe('getApiBase', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    delete process.env.REACT_APP_API_URL;
  });

  afterEach(() => {
    window.history.replaceState({}, '', 'http://localhost:3000');
  });

  it('falls back to the deployed backend when the app is running locally and the env points to localhost', () => {
    window.history.replaceState({}, '', 'http://localhost:3000');
    process.env.REACT_APP_API_URL = 'http://localhost:8080';

    expect(getApiBase()).toBe('https://bluesense.onrender.com');
  });
});
