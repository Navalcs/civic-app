import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

type Props = {
    navigation: DashboardScreenNavigationProp;
};

export default function DashboardScreen({ navigation }: Props) {
    const { user } = useAuth();
    const [profileName, setProfileName] = useState('');
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (!user) return;

        try {
            // Fetch profile
            const { data: profileRaw } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            const profile = profileRaw as { name: string | null } | null;
            if (profile) setProfileName(profile.name || 'Citizen');

            // Fetch report counts in parallel from backend
            const [totalRes, pendingRes, inProgressRes, resolvedRes] = await Promise.all([
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Pending'),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'In Progress'),
                supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Resolved'),
            ]);

            setStats({
                total: totalRes.count ?? 0,
                pending: pendingRes.count ?? 0,
                inProgress: inProgressRes.count ?? 0,
                resolved: resolvedRes.count ?? 0,
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.greeting}>Hello, {profileName}</Text>
                <Text style={styles.subtitle}>Welcome back to Civic Connect</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCardFull}>
                    <Text style={styles.statTitleFull}>Total Reports Submitted</Text>
                    <Text style={styles.statNumberFull}>{stats.total}</Text>
                </View>

                <View style={styles.row}>
                    <View style={[styles.statCard, { borderTopColor: '#F97316' }]}>
                        <Ionicons name="time-outline" size={24} color="#F97316" />
                        <Text style={styles.statNumber}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>

                    <View style={[styles.statCard, { borderTopColor: '#F97316' }]}>
                        <Ionicons name="alert-circle" size={24} color="#F97316" />
                        <Text style={styles.statNumber}>{stats.inProgress}</Text>
                        <Text style={styles.statLabel}>In Progress</Text>
                    </View>

                    <View style={[styles.statCard, { borderTopColor: '#10B981' }]}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={styles.statNumber}>{stats.resolved}</Text>
                        <Text style={styles.statLabel}>Resolved</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoSection}>
                <Ionicons name="location-outline" size={32} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.infoTitle}>Help Keep Our City Clean</Text>
                <Text style={styles.infoText}>
                    Report potholes, garbage dumps, or broken streetlights quickly and easily.
                    Your reports go directly to concerned authorities to take action.
                </Text>
            </View>
        </ScrollView>
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
        padding: 24,
        backgroundColor: '#F97316',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 60,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
    },
    statsContainer: {
        padding: 16,
        marginTop: -20,
    },
    statCardFull: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    statTitleFull: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 8,
    },
    statNumberFull: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderTopWidth: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    infoSection: {
        margin: 16,
        padding: 20,
        backgroundColor: '#FEF3EB',
        borderRadius: 16,
        alignItems: 'center',
    },
    infoIcon: {
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#C2410C',
        marginBottom: 8,
    },
    infoText: {
        textAlign: 'center',
        color: '#9A3412',
        lineHeight: 20,
    }
});
