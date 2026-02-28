import { Linking, Alert } from 'react-native';

// BMC contact email for report notifications
const BMC_EMAIL = 'mohanrajnavalcs232452@gmail.com';

interface EmailParams {
    category: string;
    description: string;
    latitude?: number;
    longitude?: number;
}

/**
 * Builds a professional municipal complaint subject line.
 */
function buildSubject({ category, latitude, longitude }: EmailParams): string {
    const base = `Civic Issue Report — ${category}`;
    // If location is available we could add area name, but since we only have
    // coordinates we return the base subject to keep it clean.
    return base;
}

/**
 * Builds a formal municipal complaint email body using the user-entered
 * description and GPS coordinates.
 */
function buildBody({ description, latitude, longitude }: EmailParams): string {
    const locationBlock =
        latitude != null && longitude != null
            ? `Location Details:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\nGoogle Maps Link:\nhttps://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
            : `Location Details:\n[Location unavailable — please add manually.]`;

    return `Respected Sir/Madam,

I would like to bring to your attention a civic issue that requires immediate action.

Issue Details:
${description.trim()}

${locationBlock}

Additional Information:
The issue has been observed at the mentioned location and may cause inconvenience to residents and commuters if not addressed promptly.

I kindly request the concerned department to take necessary action at the earliest.

Thank you for your time and assistance.

Regards,
Citizen
Sent via Civic Reporting App`;
}

/**
 * Opens the device email app with a professional municipal complaint
 * pre-filled in the subject and body using the mailto: scheme.
 */
export async function openCivicEmail(params: EmailParams): Promise<void> {
    const subject = buildSubject(params);
    const body = buildBody(params);

    const url = `mailto:${BMC_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
        await Linking.openURL(url);
    } catch {
        Alert.alert('No Email App', 'No email application was found on this device.');
    }
}
