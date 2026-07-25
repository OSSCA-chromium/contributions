import Redirect from '@/components/Redirect';

export const metadata = { robots: { index: false } };

export default function Page() {
  return <Redirect to="/contributions/patches/" />;
}
