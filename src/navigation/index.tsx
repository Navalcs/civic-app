import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { useAuth, AuthProvider } from '../hooks/useAuth';
import { AuthStackParamList, MainTabParamList, RootStackParamList } from './types';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import ReportIssueScreen from '../screens/main/ReportIssueScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ComplaintDetailScreen from '../screens/main/ComplaintDetailScreen';
import { ActivityIndicator, View } from 'react-native';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Signup" component={SignupScreen} />
        </AuthStack.Navigator>
    );
}

function MainNavigator() {
    return (
        <MainTab.Navigator
            screenOptions={({ route }: { route: import('@react-navigation/native').RouteProp<MainTabParamList> }): BottomTabNavigationOptions => ({
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Report') iconName = focused ? 'add-circle' : 'add-circle-outline';
                    else if (route.name === 'MyReports') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} color={color} size={size} />;
                },
                tabBarActiveTintColor: '#F97316',
                tabBarInactiveTintColor: '#9CA3AF',
                headerShown: true,
                headerStyle: { backgroundColor: '#F97316' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            })}
        >
            <MainTab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ headerShown: false }} // Details header handled by component
            />
            <MainTab.Screen
                name="Report"
                component={ReportIssueScreen}
                options={{ title: 'New Report' }}
            />
            <MainTab.Screen
                name="MyReports"
                component={MyReportsScreen}
                options={{ title: 'My Reports' }}
            />
            <MainTab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </MainTab.Navigator>
    );
}

function RootNavigator() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#F97316" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {session ? (
                    <>
                        <RootStack.Screen name="Main" component={MainNavigator} />
                        <RootStack.Screen name="ReportDetail" component={ComplaintDetailScreen} />
                    </>
                ) : (
                    <RootStack.Screen name="Auth" component={AuthNavigator} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}

export default function Navigation() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
