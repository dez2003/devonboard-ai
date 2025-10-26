import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      organizationId?: string;
      role?: 'admin' | 'developer' | 'viewer';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    organizationId?: string;
    role?: 'admin' | 'developer' | 'viewer';
  }
}
