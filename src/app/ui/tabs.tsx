'use client';

import * as React from 'react';
import { cn } from '@/app/lib/utils'; // Assuming you have a utils file with clsx/tailwind-merge helper

type TabsProps = {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
};

type TabsListProps = {
    children: React.ReactNode;
    className?: string;
};

type TabsTriggerProps = {
    value: string;
    children: React.ReactNode;
    className?: string;
    activeTab?: string;
    setActiveTab?: (value: string) => void;
};

type TabsContentProps = {
    value: string;
    children: React.ReactNode;
    className?: string;
    activeTab?: string;
};

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
}>({
    activeTab: '',
    setActiveTab: () => { },
});

export function Tabs({ defaultValue, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
        <button
            type="button"
            onClick={() => setActiveTab(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-white text-gray-950 shadow-sm"
                    : "hover:bg-gray-200 hover:text-gray-900",
                className
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = React.useContext(TabsContext);

    if (activeTab !== value) return null;

    return (
        <div
            className={cn(
                "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 animate-in fade-in-0 zoom-in-95",
                className
            )}
        >
            {children}
        </div>
    );
}
