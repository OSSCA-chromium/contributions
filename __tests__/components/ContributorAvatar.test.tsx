import { render, screen } from '@testing-library/react';
import ContributorAvatar from '@/components/ContributorAvatar';

test('shows a profile image with identity in its tooltip and accessible name only', () => {
  render(<ContributorAvatar username="alice" size={40} linkToProfile />);
  expect(screen.getByRole('img', { name: 'alice 프로필 이미지' })).toHaveAttribute('width', '40');
  expect(screen.getByRole('link', { name: 'alice 프로필 이미지' })).toHaveAttribute('href', '/contributors/alice');
  expect(screen.getByTitle('alice')).toBeInTheDocument();
  expect(screen.queryByText('alice')).not.toBeInTheDocument();
});

test('uses an accessible silhouette without a fabricated profile link for invalid handles', () => {
  render(<ContributorAvatar username="홍길동" linkToProfile />);
  expect(screen.getByRole('img', { name: '홍길동 프로필 이미지' })).toBeInTheDocument();
  expect(screen.getByTitle('홍길동')).toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByText('홍')).not.toBeInTheDocument();
});
