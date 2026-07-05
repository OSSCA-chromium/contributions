import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="font-display brand-gradient-text text-6xl font-bold tracking-tight mb-4">
        404
      </h1>
      <h2 className="text-2xl mb-6 text-on-surface">페이지를 찾을 수 없습니다</h2>
      <p className="mb-8 text-on-surface-variant">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-3 font-medium text-on-primary transition-opacity hover:opacity-90"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
