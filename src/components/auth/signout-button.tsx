
import { signOutAction } from "@/app/lib/actions";
import { LogOut } from "lucide-react";

export function SignOut() {
    return (
        <form action={signOutAction}>
            <button
                className="flex items-center justify-center p-2 rounded-lg text-koni-red bg-red-50 hover:bg-koni-red hover:text-white transition-all duration-200 border border-red-100 shadow-sm"
                title="Sign Out"
                aria-label="Sign Out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </form>
    );
}
