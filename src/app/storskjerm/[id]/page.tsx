import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Storskjerm } from "./Storskjerm";

export const metadata = { title: "KRUTTØNNA – storskjerm" };

export default async function StorskjermPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { id } = await params;
  return <Storskjerm id={id} />;
}
