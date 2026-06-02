import { auth } from "@/auth";

export default auth((req: any) => {
  // NextAuth middleware will automatically refresh the token and 
  // correctly set the Set-Cookie header in the response.
});

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
