export default function ClubHeader({
    clubName,
    userName,
}: {
    clubName: string;
    userName: string;
}) {
    return (
        <header className="bg-white shadow">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Panel Admin Club
                    </h1>
                    <div className="flex items-center">
                        <div className="text-right mr-4">
                            <p className="text-sm font-medium text-gray-900">{clubName}</p>
                            <p className="text-xs text-gray-500">{userName}</p>
                        </div>
                        {/* Placeholder for Profile Dropdown or Avatar if needed */}
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
