// src/app/cancel/page.tsx
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Your order was cancelled</h1>
      <p className="mt-4">
        <Link href="/">
          <span className="text-blue-500 underline">Return to home</span>
        </Link>
      </p>
    </div>
  );
}
