import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

function RunnerLogo() {
  return (
    <View style={logoStyles.container}>
      {/* Círculo de fundo com gradiente simulado */}
      <View style={logoStyles.outerCircle}>
        <View style={logoStyles.innerCircle}>
          {/* Corredor estilizado */}
          <View style={logoStyles.runner}>
            {/* Cabeça */}
            <View style={logoStyles.head} />
            {/* Corpo */}
            <View style={logoStyles.body} />
            {/* Braço de trás */}
            <View style={[logoStyles.arm, logoStyles.armBack]} />
            {/* Braço da frente */}
            <View style={[logoStyles.arm, logoStyles.armFront]} />
            {/* Perna de trás */}
            <View style={[logoStyles.leg, logoStyles.legBack]} />
            {/* Perna da frente */}
            <View style={[logoStyles.leg, logoStyles.legFront]} />
          </View>
          {/* Linhas de movimento */}
          <View style={logoStyles.motionLines}>
            <View style={[logoStyles.motionLine, { width: 12, top: 20 }]} />
            <View style={[logoStyles.motionLine, { width: 16, top: 28 }]} />
            <View style={[logoStyles.motionLine, { width: 10, top: 36 }]} />
          </View>
        </View>
      </View>
      {/* Linha de chegada decorativa */}
      <View style={logoStyles.finishLine}>
        <View style={logoStyles.finishSquare} />
        <View style={[logoStyles.finishSquare, logoStyles.finishSquareAlt]} />
        <View style={logoStyles.finishSquare} />
        <View style={[logoStyles.finishSquare, logoStyles.finishSquareAlt]} />
        <View style={logoStyles.finishSquare} />
      </View>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  innerCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  runner: {
    position: 'relative',
    width: 40,
    height: 50,
    marginLeft: 8,
  },
  head: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    top: 0,
    left: 16,
  },
  body: {
    position: 'absolute',
    width: 6,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    top: 12,
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  arm: {
    position: 'absolute',
    width: 4,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  armBack: {
    top: 14,
    left: 12,
    transform: [{ rotate: '45deg' }],
  },
  armFront: {
    top: 14,
    left: 28,
    transform: [{ rotate: '-60deg' }],
  },
  leg: {
    position: 'absolute',
    width: 5,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 2.5,
  },
  legBack: {
    top: 28,
    left: 10,
    transform: [{ rotate: '30deg' }],
  },
  legFront: {
    top: 28,
    left: 26,
    transform: [{ rotate: '-45deg' }],
  },
  motionLines: {
    position: 'absolute',
    left: 8,
    top: 15,
  },
  motionLine: {
    height: 3,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
    marginBottom: 2,
    opacity: 0.7,
  },
  finishLine: {
    flexDirection: 'row',
    marginTop: 12,
  },
  finishSquare: {
    width: 8,
    height: 8,
    backgroundColor: Colors.text,
  },
  finishSquareAlt: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.text,
  },
});

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), senha });
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <RunnerLogo />
          <Text style={styles.logo}>Corridas Online</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua senha"
                placeholderTextColor={Colors.textLight}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Text style={styles.eyeIcon}>{mostrarSenha ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Link href="/(auth)/registro" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Criar conta</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  eyeButton: {
    padding: 12,
    paddingRight: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
