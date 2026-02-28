import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

type Report = {
    id: string;
    category: string;
    description: string | null;
    status: string;
    created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
    'Pending': '#F97316',
    'In Progress': '#C2410C',
    'Resolved': '#059669',
};

export default function ProfileScreen({ navigation }: any) {
    const { user } = useAuth();
    const [profileName, setProfileName] = useState('');
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    /** Fetch profile name + all user reports from Supabase */
    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            // Parallel fetch: profile name + report history
            const [profileRes, reportsRes] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single(),
                supabase
                    .from('reports')
                    .select('id, category, description, status, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }),
            ]);

            const profile = profileRes.data as { name: string | null } | null;
            if (profile?.name) setProfileName(profile.name);

            const fetchedReports = (reportsRes.data ?? []) as Report[];
            setReports(fetchedReports);
        } catch (e) {
            console.error('Profile fetch error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    // Fetch on mount
    useEffect(() => { fetchData(); }, [fetchData]);

    // Refresh when screen is focused (e.g. after submitting a report)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setRefreshing(true);
            fetchData();
        });
        return unsubscribe;
    }, [navigation, fetchData]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert('Error', 'Failed to log out');
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status: string) => STATUS_COLORS[status] ?? '#6B7280';

    const renderReport = ({ item }: { item: Report }) => (
        <TouchableOpacity
            style={styles.reportCard}
            onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.reportHeader}>
                <Text style={styles.reportCategory}>{item.category}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
                    <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            {item.description ? (
                <Text style={styles.reportDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.reportFooter}>
                <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                <Text style={styles.reportDate}>
                    {format(new Date(item.created_at), 'MMM d, yyyy · h:mm a')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const Header = (
        <View>
            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(profileName || user?.email || '?').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{profileName || 'Citizen'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.divider} />
                <Button
                    title="Sign Out"
                    variant="outline"
                    onPress={handleLogout}
                    style={styles.signOutBtn}
                />
            </View>

            {/* Reports Header */}
            <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Reports ({reports.length})</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={renderReport}
            ListHeaderComponent={Header}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} />}
            ListEmptyComponent={
                <View style={styles.emptyBox}>
                    <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No reports submitted yet.</Text>
                    <Text style={styles.emptySubText}>Submit a report to see it here.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 32 },

    // Profile Card
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 4,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#FEF3EB',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#C2410C' },
    name: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
    email: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    divider: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginBottom: 20 },
    signOutBtn: { width: '100%' },

    // Section Header
    sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

    // Report Cards
    reportCard: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    reportCategory: { fontSize: 15, fontWeight: '700', color: '#111827' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    reportDesc: { fontSize: 13, color: '#4B5563', marginBottom: 10, lineHeight: 18 },
    reportFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    reportDate: { fontSize: 12, color: '#9CA3AF' },

    // Empty State
    emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 16 },
    emptySubText: { fontSize: 13, color: '#9CA3AF', marginTop: 6 },
});
