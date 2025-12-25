import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '@/constants/colors';

interface BannerPlaceholderProps {
  imageUrl?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function BannerPlaceholder({ imageUrl, onPress, disabled }: BannerPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Banner do evento</Text>

      <TouchableOpacity
        style={[styles.placeholder, disabled && styles.placeholderDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContent}>
            <Text style={styles.icon}>🖼️</Text>
            <Text style={styles.placeholderText}>
              {disabled ? 'Upload de banner em breve' : 'Toque para adicionar banner'}
            </Text>
            <Text style={styles.hint}>Recomendado: 1200 x 400 pixels</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  placeholder: {
    height: 150,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  placeholderDisabled: {
    opacity: 0.6,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
