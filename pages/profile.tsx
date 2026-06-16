import type { GetServerSideProps } from "next";
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAuthSession, loginRedirect } from "@/lib/page-auth";
import { formatEventDate } from "@/lib/events";

type ProfileProps = {
  user: {
    name: string;
    email: string;
    phone: string;
    myCSDPoints: number;
  };
  history: {
    id: string;
    eventId: string;
    title: string;
    date: string;
    status: string;
  }[];
};

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (
  ctx
) => {
  const session = await getAuthSession(ctx);
  if (!session) return loginRedirect;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      registrations: {
        include: { event: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return loginRedirect;

  return {
    props: {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        myCSDPoints: user.myCSDPoints,
      },
      history: user.registrations.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        title: r.event.title,
        date: r.event.date.toISOString(),
        status: r.status,
      })),
    },
  };
};

export default function Profile({ user, history }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    // Save
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userInfo.name, phone: userInfo.phone }),
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto p-8">
        <Card className="p-6 bg-white rounded-lg shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-6">
            <div className="h-24 w-24 bg-gray-300 rounded-full overflow-hidden shadow-md shrink-0">
              <img
                src="/profile-placeholder.jpg"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-usmPurple">
                {userInfo.name}
              </CardTitle>
              <p className="text-md text-gray-700 mt-2">
                MyCSD Points:{" "}
                <span className="font-bold text-gold">
                  ⭐ {user.myCSDPoints}
                </span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium">Name</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-600">{userInfo.name}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <p className="text-gray-600">{userInfo.email}</p>
            </div>
            <div>
              <label className="block text-gray-700 font-medium">Phone</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-600">{userInfo.phone || "—"}</p>
              )}
            </div>
          </CardContent>

          <Button
            onClick={handleToggle}
            disabled={saving}
            className="mt-4 w-full"
          >
            {isEditing ? (saving ? "Saving..." : "Save Changes") : "Edit Profile"}
          </Button>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-usmPurple mb-4">
              Event History
            </h3>
            {history.length === 0 ? (
              <p className="text-gray-500">
                You haven&apos;t registered for any events yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {history.map((item) => (
                  <Link key={item.id} href={`/events/${item.eventId}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">
                            {item.title}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {formatEventDate(item.date)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-usmPurple text-white">
                          {item.status}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
