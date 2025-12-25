import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export function Drawer() {
  const { isOpen, closeDrawer } = useDrawer();
  const { user, logout } = useAuth();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleLogout = () => {
    closeDrawer();
    Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const navigateTo = (route: string) => {
    closeDrawer();
    setTimeout(() => {
      router.push(route as any);
    }, 280);
  };

  const menuItems: MenuItem[] = [
    {
      icon: '📅',
      label: 'Eventos',
      onPress: () => {
        closeDrawer();
      },
    },
  ];

  const configItems: MenuItem[] = [
    {
      icon: '⚙️',
      label: 'Configuracoes',
      onPress: () => navigateTo('/perfil/editar'),
    },
    {
      icon: '🔐',
      label: 'Alterar Senha',
      onPress: () => navigateTo('/perfil/alterar-senha'),
    },
    {
      icon: 'ℹ️',
      label: 'Sobre o App',
      onPress: () => {},
    },
  ];

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, item.danger && styles.menuItemDanger]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>{item.icon}</Text>
      <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Pressable style={styles.overlayPressable} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials(user?.nome)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.nome}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Organizador</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            {menuItems.map(renderMenuItem)}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            {configItems.map(renderMenuItem)}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Versao 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemDanger: {
    backgroundColor: Colors.errorLight,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  menuLabelDanger: {
    color: Colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 4,
  },
  logoutLabel: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  version: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
