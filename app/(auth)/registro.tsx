import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function RegistroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Corridas Online</Text>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Escolha o tipo de conta</Text>
        </View>

        <View style={styles.options}>
          <Link href="/(auth)/registro-organizador" asChild>
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.optionIcon}>
                <Text style={styles.iconText}>O</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Organizador</Text>
                <Text style={styles.optionDescription}>
                  Crie e gerencie eventos de corrida, controle inscrições e resultados
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/registro-atleta" asChild>
            <TouchableOpacity style={styles.optionCard}>
              <View style={[styles.optionIcon, styles.optionIconSecondary]}>
                <Text style={styles.iconText}>A</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Atleta</Text>
                <Text style={styles.optionDescription}>
                  Inscreva-se em corridas, acompanhe seus resultados e histórico
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Entrar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  options: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconSecondary: {
    backgroundColor: Colors.secondary,
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    gap: 8,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
