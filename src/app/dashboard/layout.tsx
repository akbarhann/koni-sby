
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect("/login");
    }

    // Double safety: Middleware handles redirects, but this layout ensures no unauthenticated render.
    return <section>{children}</section>;
}
