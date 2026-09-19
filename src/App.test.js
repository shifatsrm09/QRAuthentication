import { render, screen } from '@testing-library/react';
import App from './App';
import { generateQR } from './services/qrService';
jest.mock('./services/qrService', () => ({generateQR: jest.fn(), checkQRStatus: jest.fn()}));
test('unauthenticated dashboard redirects to login', async () => {
 localStorage.clear();
 window.history.pushState({}, '', '/dashboard');
 generateQR.mockResolvedValue({sessionId:'test',qrURL:'https://example.com/qr-auth.html?sessionId=test'});
 // Mobile login does not render a canvas or start desktop polling.
 Object.defineProperty(window, 'innerWidth', {writable:true, value:375});
 render(<App />);
 expect(await screen.findByText('Welcome Back')).toBeInTheDocument();
 expect(screen.getByRole('button', {name:'Sign In'})).toBeDisabled();
});
