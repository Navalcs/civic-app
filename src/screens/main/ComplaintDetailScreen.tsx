import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Clipboard,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;
type Props = {
    route: ReportDetailRouteProp;
    navigation: NavigationProp<RootStackParamList>;
};

export default function ComplaintDetailScreen({ route, navigation }: Props) {
    const { id } = route.params;
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setReport(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#F97316';
            case 'In Progress': return '#C2410C';
            case 'Resolved': return '#059669';
            default: return '#6B7280';
        }
    };

    const handleCopyLocation = async (lat: number, lng: number) => {
        const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        Clipboard.setString(text);
        Toast.show({
            type: 'success',
            text1: 'Copied',
            text2: 'Coordinates copied to clipboard',
            position: 'top',
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Report not found</Text>
            </View>
        );
    }

    const statusColor = getStatusColor(report.status);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Issue Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContent} bounces={false}>
                {report.local_image_uri ? (
                    <Image source={{ uri: report.local_image_uri }} style={styles.heroImage} />
                ) : (
                    <View style={[styles.heroImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: '#9CA3AF' }}>Image Unavailable</Text>
                    </View>
                )}

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.categoryTitle}>{report.category}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{report.status}</Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                            <Text style={styles.metaText}>{format(new Date(report.created_at), 'MMMM d, yyyy')}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#6B7280" />
                            <Text style={styles.metaText}>{format(new Date(report.created_at), 'h:mm a')}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Description</Text>
                    <Text style={styles.descriptionText}>{report.description}</Text>

                    <Text style={styles.sectionHeader}>Location</Text>
                    {report.latitude && report.longitude ? (
                        <View style={styles.locationCard}>
                            <View style={styles.coordBox}>
                                <Ionicons name="location" size={20} color="#10B981" />
                                <View style={styles.coordTextContainer}>
                                    <Text style={styles.coordLabel}>Coordinates</Text>
                                    <Text style={styles.coordValue}>
                                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.locationActions}>
                                <TouchableOpacity
                                    style={styles.locationBtn}
                                    onPress={() => handleCopyLocation(report.latitude, report.longitude)}
                                >
                                    <Ionicons name="copy-outline" size={16} color="#4B5563" />
                                    <Text style={styles.locationBtnText}>Copy</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.locationBtn, styles.locationBtnPrimary]}
                                    onPress={() => Linking.openURL(`https://www.google.com/maps?q=${report.latitude},${report.longitude}`)}
                                >
                                    <Ionicons name="map-outline" size={16} color="#F97316" />
                                    <Text style={[styles.locationBtnText, { color: '#F97316' }]}>Open Maps</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.metaText}>Location coordinates not provided.</Text>
                    )}

                    <Text style={styles.sectionHeader}>Status Timeline</Text>
                    <View style={styles.timeline}>
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
                            <View style={styles.timelineLine} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Report Submitted</Text>
                                <Text style={styles.timelineDate}>{format(new Date(report.created_at), 'MMMM d, yyyy')}</Text>
                            </View>
                        </View>

                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: report.status === 'Pending' ? '#E5E7EB' : '#10B981' }]} />
                            <View style={styles.timelineLine} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, report.status === 'Pending' && { color: '#9CA3AF' }]}>In Progress</Text>
                                <Text style={styles.timelineDate}>{report.status !== 'Pending' ? 'Update received' : 'Pending action'}</Text>
                            </View>
                        </View>

                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, { backgroundColor: report.status === 'Resolved' ? '#10B981' : '#E5E7EB' }]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, report.status !== 'Resolved' && { color: '#9CA3AF' }]}>Resolved</Text>
                                <Text style={styles.timelineDate}>{report.status === 'Resolved' ? 'Issue fixed' : 'Pending resolution'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
    },
    scrollContent: {
        flex: 1,
    },
    heroImage: {
        width: '100%',
        height: 250,
    },
    content: {
        padding: 24,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#6B7280',
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 8,
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
        marginBottom: 24,
    },
    locationCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        marginBottom: 24,
    },
    coordBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    coordTextContainer: {
        flex: 1,
    },
    coordLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    coordValue: {
        fontSize: 14,
        color: '#111827',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: '600',
    },
    locationActions: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    locationBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    locationBtnPrimary: {
        backgroundColor: '#FEF3EB',
        borderWidth: 1,
        borderColor: '#FDBA74',
    },
    locationBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    timeline: {
        marginTop: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginTop: 4,
        marginRight: 16,
        zIndex: 2,
    },
    timelineLine: {
        position: 'absolute',
        left: 7,
        top: 20,
        bottom: -24,
        width: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    timelineDate: {
        fontSize: 14,
        color: '#6B7280',
    },
});
