import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-utsob-crimson font-sans">৪০৪</h1>
      <h2 className="mt-4 text-2xl font-semibold text-foreground">
        পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-utsob-crimson px-4 py-2 text-sm font-medium text-white hover:bg-utsob-crimson/90 transition-colors"
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}

