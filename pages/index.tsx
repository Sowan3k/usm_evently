import type { GetServerSideProps } from "next";

// Index is purely a router: the home page is public, so send everyone there.
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/home",
      permanent: false,
    },
  };
};

export default function Index() {
  return null;
}
