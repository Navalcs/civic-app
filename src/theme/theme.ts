// ─────────────────────────────────────────────────────────────────────────────
// Civic App – Centralized Theme
// Only change color values here; never hard-code colors in screen files.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
    // ── Brand ──────────────────────────────────────────────────────────────────
    primary: '#F97316',          // Orange accent – buttons, FAB, active icons
    primaryDark: '#C2410C',      // Darker orange – avatar text, active labels
    primaryLight: '#FEF3EB',     // Very light orange – hover / highlight bg

    // ── Backgrounds ─────────────────────────────────────────────────────────────
    background: '#F5F7FA',       // App-wide background
    surface: '#FFFFFF',          // Card / modal background
    surfaceAlt: '#F9FAFB',       // Secondary surfaces (placeholders, etc.)

    // ── Text ────────────────────────────────────────────────────────────────────
    textPrimary: '#1F2937',      // Headings, primary body
    textSecondary: '#6B7280',    // Sub-headings, labels
    textMuted: '#9CA3AF',        // Timestamps, captions

    // ── Borders & Dividers ──────────────────────────────────────────────────────
    border: '#E5E7EB',

    // ── Category Card Pastels ───────────────────────────────────────────────────
    peach: '#F6E4DB',
    mint: '#E4F3EC',
    lightYellow: '#F7F1DB',
    lightBlue: '#E4EDF7',

    // ── Status Badges ───────────────────────────────────────────────────────────
    statusPendingBg: '#FEF3EB',
    statusPendingText: '#F97316',

    statusInProgressBg: '#F6E4DB',
    statusInProgressText: '#C2410C',

    statusResolvedBg: '#E4F3EC',
    statusResolvedText: '#059669',

    // ── Timeline / State Dots ───────────────────────────────────────────────────
    timelineDotDone: '#10B981',  // Green for completed steps
    timelineDotPending: '#E5E7EB',
    timelineLine: '#E5E7EB',

    // ── Error / Warning ─────────────────────────────────────────────────────────
    error: '#EF4444',
    errorBg: '#FEE2E2',

    // ── Avatar ──────────────────────────────────────────────────────────────────
    avatarBg: '#FEF3EB',
    avatarText: '#C2410C',
};

/**
 * Returns the correct status color set for a given status string.
 * Use statusColor(status).bg for the badge background and
 *     statusColor(status).text for the text color.
 */
export function statusColor(status: string): { bg: string; text: string } {
    switch (status) {
        case 'Pending':
            return { bg: colors.statusPendingBg, text: colors.statusPendingText };
        case 'In Progress':
            return { bg: colors.statusInProgressBg, text: colors.statusInProgressText };
        case 'Resolved':
            return { bg: colors.statusResolvedBg, text: colors.statusResolvedText };
        default:
            return { bg: '#F3F4F6', text: colors.textSecondary };
    }
}
