import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/colors';

function RunnerLogo() {
  return (
    <View style={logoStyles.container}>
      <View style={logoStyles.outerCircle}>
        <View style={logoStyles.innerCircle}>
          <View style={logoStyles.runner}>
            <View style={logoStyles.head} />
            <View style={logoStyles.body} />
            <View style={[logoStyles.arm, logoStyles.armBack]} />
            <View style={[logoStyles.arm, logoStyles.armFront]} />
            <View style={[logoStyles.leg, logoStyles.legBack]} />
            <View style={[logoStyles.leg, logoStyles.legFront]} />
          </View>
          <View style={logoStyles.motionLines}>
            <View style={[logoStyles.motionLine, { width: 12, top: 20 }]} />
            <View style={[logoStyles.motionLine, { width: 16, top: 28 }]} />
            <View style={[logoStyles.motionLine, { width: 10, top: 36 }]} />
          </View>
        </View>
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
});

export default function RegistroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <RunnerLogo />
          <Text style={styles.logo}>Corridas Online</Text>
          <Text style={styles.subtitle}>Escolha o tipo de conta</Text>
        </View>

        <View style={styles.options}>
          <Link href="/(auth)/registro-organizador" asChild>
            <TouchableOpacity style={styles.optionCard}>
              <View style={styles.optionIcon}>
                {/* Icone de organizador - prancheta com checklist */}
                <View style={styles.clipboardIcon}>
                  <View style={styles.clipboardTop} />
                  <View style={styles.clipboardBody}>
                    <View style={styles.clipboardLine} />
                    <View style={[styles.clipboardLine, { width: 16 }]} />
                    <View style={[styles.clipboardLine, { width: 12 }]} />
                  </View>
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Organizador</Text>
                <Text style={styles.optionDescription}>
                  Crie e gerencie eventos de corrida, controle inscricoes e resultados
                </Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/registro-atleta" asChild>
            <TouchableOpacity style={styles.optionCard}>
              <View style={[styles.optionIcon, styles.optionIconSecondary]}>
                {/* Icone de atleta - corredor */}
                <View style={styles.runnerIcon}>
                  <View style={styles.runnerHead} />
                  <View style={styles.runnerBody} />
                  <View style={styles.runnerArmBack} />
                  <View style={styles.runnerArmFront} />
                  <View style={styles.runnerLegBack} />
                  <View style={styles.runnerLegFront} />
                </View>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Atleta</Text>
                <Text style={styles.optionDescription}>
                  Inscreva-se em corridas, acompanhe seus resultados e historico
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ja tem uma conta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Entrar</Text>
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
    marginBottom: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
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
  // Icone de prancheta (organizador)
  clipboardIcon: {
    alignItems: 'center',
  },
  clipboardTop: {
    width: 12,
    height: 4,
    backgroundColor: Colors.white,
    borderRadius: 2,
    marginBottom: -2,
    zIndex: 1,
  },
  clipboardBody: {
    width: 24,
    height: 28,
    backgroundColor: Colors.white,
    borderRadius: 3,
    padding: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
  },
  clipboardLine: {
    width: 14,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  // Icone de corredor (atleta)
  runnerIcon: {
    width: 28,
    height: 32,
    position: 'relative',
  },
  runnerHead: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    top: 0,
    left: 12,
  },
  runnerBody: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 2,
    top: 7,
    left: 14,
    transform: [{ rotate: '-15deg' }],
  },
  runnerArmBack: {
    position: 'absolute',
    width: 3,
    height: 10,
    backgroundColor: Colors.white,
    borderRadius: 1.5,
    top: 9,
    left: 8,
    transform: [{ rotate: '45deg' }],
  },
  runnerArmFront: {
    position: 'absolute',
    width: 3,
    height: 10,
    backgroundColor: Colors.white,
    borderRadius: 1.5,
    top: 9,
    left: 20,
    transform: [{ rotate: '-60deg' }],
  },
  runnerLegBack: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 1.5,
    top: 17,
    left: 6,
    transform: [{ rotate: '30deg' }],
  },
  runnerLegFront: {
    position: 'absolute',
    width: 3,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 1.5,
    top: 17,
    left: 18,
    transform: [{ rotate: '-45deg' }],
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
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
  },
  footerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
