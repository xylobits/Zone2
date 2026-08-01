import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Next.js 16 renamed the `middleware` file convention to `proxy` — this file is the
// direct equivalent of what would have been middleware.ts in earlier versions.
// This is a UX convenience layer only (fast redirects before a page even renders).
// Postgres RLS (see supabase/migrations/0002_rls.sql) is the real authorization boundary
// and holds even if a request reaches Supabase without going through this proxy at all.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/sub-admin');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/sub-admin'))) {
    const { data: profile } = await supabase.from('profiles').select('role, club_id').eq('id', user.id).single();

    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/sub-admin')) {
      if (profile?.role !== 'sub_admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      if (!profile.club_id && pathname !== '/sub-admin/pending') {
        return NextResponse.redirect(new URL('/sub-admin/pending', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/sub-admin/:path*'],
};
