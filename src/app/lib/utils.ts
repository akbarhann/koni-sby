/**
 * Utility functions for the KONI application
 */

/**
 * Generates a readable token with a given prefix.
 * Excludes confusing characters: O, 0, I, 1
 * @param prefix - The prefix for the token (e.g., "KONI", "PSSI")
 * @returns A formatted token string in the format "PREFIX-XXXX"
 */
export function generateToken(prefix: string): string {
    // Characters excluding confusing ones: O, 0, I, 1
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomPart += characters[randomIndex];
    }

    return `${prefix.toUpperCase()}-${randomPart}`;
}

/**
 * Formats a date to Indonesian locale string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/**
 * Calculates expiry date from now
 * @param hours - Number of hours until expiry
 * @returns Date object set to the expiry time
 */
export function getExpiryDate(hours: number): Date {
    const now = new Date();
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
