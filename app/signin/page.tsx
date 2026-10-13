import type { Metadata } from "next";
import Image from "next/image";
import { SignInForm } from "@/components/auth/signin-form";
import storePhoto from "@/public/images/store.png";

export const metadata: Metadata = {
  title: "Sign in",
};

// Deliberately outside the (app) route group: no sidebar, no close provider.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only same-site paths, so `?next=` cannot be used as an open redirect.
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="grid min-h-svh bg-background md:grid-cols-[1fr_45%] lg:grid-cols-[1fr_50%]">
      {/* Left — wordmark top, form centred, footnote bottom */}
      <div className="flex flex-col justify-between gap-12 px-8 py-10 sm:px-14 sm:py-12">
        <p className="text-sm font-semibold tracking-[-0.02em]">
          <span className="text-red-600">Citadel</span> Insight
        </p>

        {/* min-h-0 so the centred block can shrink rather than overflow */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex w-full max-w-[320px] flex-col gap-3.5">
            <h1 className="text-[34px] font-bold leading-none tracking-[-0.045em]">
              Welcome back.
            </h1>
            <SignInForm next={target} />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Family Thrift Center · 22 stores
        </p>
      </div>

      {/* Right — full-bleed store photo. Hidden on phones, where a fixed
          column would squeeze the form. */}
      <div className="relative hidden md:block">
        <Image
          src={storePhoto}
          alt="Interior of a Family Thrift Center store"
          placeholder="blur"
          sizes="(min-width: 1024px) 50vw, 45vw"
          className="object-cover"
          fill
          priority
        />
      </div>
    </main>
  );
}
