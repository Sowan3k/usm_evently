import type { GetServerSideProps } from "next";
import { getAuthSession } from "@/lib/page-auth";

// Index is purely a router: send signed-in users to the app, everyone else
// to the login page. Done server-side to avoid a flash of the wrong page.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getAuthSession(ctx);
  return {
    redirect: {
      destination: session ? "/home" : "/register",
      permanent: false,
    },
  };
};

export default function Index() {
  return null;
}
