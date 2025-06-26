// src/app/success/page.tsx
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Thank you for your order!</h1>
      <p className="mt-4">
        <Link href="/">
          <span className="text-blue-500 underline">Return to home</span>
        </Link>
      </p>
    </div>
  );
}
