import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({
    title,
    loading = false,
    variant = 'primary',
    style,
    disabled,
    ...props
}: ButtonProps) {
    const getContainerStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryContainer;
            case 'outline':
                return styles.outlineContainer;
            default:
                return styles.primaryContainer;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                getContainerStyle(),
                disabled || loading ? styles.disabled : null,
                style,
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#F97316' : '#FFFFFF'} />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    primaryContainer: {
        backgroundColor: '#F97316',
    },
    secondaryContainer: {
        backgroundColor: '#E5E7EB',
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#F97316',
    },
    disabled: {
        opacity: 0.6,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: '#374151',
    },
    outlineText: {
        color: '#F97316',
    },
});
