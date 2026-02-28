import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    Signup: undefined;
};

export type MainTabParamList = {
    Dashboard: undefined;
    Report: undefined;
    MyReports: undefined;
    Profile: undefined;
};

export type RootStackParamList = {
    Auth: NavigatorScreenParams<AuthStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
    ReportDetail: { id: string };
};
