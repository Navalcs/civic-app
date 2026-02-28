import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function MyReportsScreen({ navigation }: any) {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReports = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchReports();
        });
        return unsubscribe;
    }, [navigation, user]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchReports();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#F97316';
            case 'In Progress': return '#C2410C';
            case 'Resolved': return '#059669';
            default: return '#6B7280';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
        >
            {item.local_image_uri ? (
                <Image source={{ uri: item.local_image_uri }} style={styles.cardImage} />
            ) : (
                <View style={styles.imagePlaceholder} />
            )}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.category}>{item.category}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '30' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.footerText}>
                            {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </Text>
                    </View>
                    <View style={styles.footerItem}>
                        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.footerText}>Location saved</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You haven't submitted any reports yet.</Text>
                    </View>
                }
            />
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
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    cardImage: {
        width: 100,
        height: '100%',
        backgroundColor: '#E5E7EB',
    },
    imagePlaceholder: {
        width: 100,
        height: '100%',
        backgroundColor: '#F5F7FA',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    category: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#6B7280',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },
});
