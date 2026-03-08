import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/practice/:path*', '/diagnosis/:path*', '/review/:path*', '/dashboard/:path*'],
};
