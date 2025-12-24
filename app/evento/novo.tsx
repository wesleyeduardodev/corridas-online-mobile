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
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { eventosService, CriarEventoRequest } from '@/services/eventos';
import LocalidadeSelector from '@/components/LocalidadeSelector';

export default function NovoEventoScreen() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [localidade, setLocalidade] = useState<{
    cidade: string;
    cidadeIbge: number;
    estado: string;
    estadoIbge: number;
  } | null>(null);
  const [inscricoesAbertas, setInscricoesAbertas] = useState(true);
  const [limiteInscricoes, setLimiteInscricoes] = useState('');
  const [loading, setLoading] = useState(false);

  function formatData(value: string) {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }

  function formatHorario(value: string) {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d)/, '$1:$2');
  }

  function parseDataToISO(dataStr: string): string {
    const parts = dataStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dataStr;
  }

  async function handleCriar() {
    if (!nome.trim() || !data || !local.trim() || !localidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const eventoData: CriarEventoRequest = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      data: parseDataToISO(data),
      horario: horario || undefined,
      local: local.trim(),
      cidade: localidade.cidade,
      cidadeIbge: localidade.cidadeIbge,
      estado: localidade.estado,
      estadoIbge: localidade.estadoIbge,
      inscricoesAbertas,
      limiteInscricoes: limiteInscricoes ? parseInt(limiteInscricoes) : undefined,
    };

    setLoading(true);
    try {
      const evento = await eventosService.criar(eventoData);
      Alert.alert('Sucesso', 'Evento criado com sucesso!', [
        { text: 'OK', onPress: () => router.replace(`/evento/${evento.id}`) }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar evento';
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo Evento</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Corrida de Verão 2025"
              placeholderTextColor={Colors.textLight}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição do evento..."
              placeholderTextColor={Colors.textLight}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>Data *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.textLight}
                value={data}
                onChangeText={(text) => setData(formatData(text))}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Horário</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor={Colors.textLight}
                value={horario}
                onChangeText={(text) => setHorario(formatHorario(text))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Local *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Parque da Cidade"
              placeholderTextColor={Colors.textLight}
              value={local}
              onChangeText={setLocal}
            />
          </View>

          <LocalidadeSelector
            label="Cidade *"
            value={localidade || undefined}
            onChange={setLocalidade}
            required
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Limite de inscrições</Text>
            <TextInput
              style={styles.input}
              placeholder="Deixe vazio para ilimitado"
              placeholderTextColor={Colors.textLight}
              value={limiteInscricoes}
              onChangeText={setLimiteInscricoes}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.label}>Inscrições abertas</Text>
              <Text style={styles.switchDescription}>
                Permitir que atletas se inscrevam
              </Text>
            </View>
            <Switch
              value={inscricoesAbertas}
              onValueChange={setInscricoesAbertas}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCriar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Criar Evento</Text>
            )}
          </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
