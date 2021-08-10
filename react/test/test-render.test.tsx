import { render, screen } from '@testing-library/react';
import App from '@app/App';

describe('렌더링 테스트', () => {
  it('App.tsx 가 렌더링 된다.', async () => {
    render(<App />);
    expect(screen.getByText('hello')).toBeTruthy();
  });
});
