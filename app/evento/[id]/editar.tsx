import { useState, useEffect } from 'react';
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
  Modal,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { eventosService, CriarEventoRequest } from '@/services/eventos';
import LocalidadeSelector from '@/components/LocalidadeSelector';
import BannerPlaceholder from '@/components/BannerPlaceholder';
import { parseLocalDate } from '@/utils/dateHelpers';

export default function EditarEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const [trajetoUrl, setTrajetoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTrajetoHelp, setShowTrajetoHelp] = useState(false);

  useEffect(() => {
    loadEvento();
  }, []);

  async function loadEvento() {
    try {
      const evento = await eventosService.buscarPorId(Number(id));
      setNome(evento.nome);
      setDescricao(evento.descricao || '');
      setData(formatDateFromISO(evento.data));
      setHorario(evento.horario ? evento.horario.slice(0, 5) : '');
      setLocal(evento.local);

      if (evento.cidadeIbge && evento.estadoIbge) {
        setLocalidade({
          cidade: evento.cidade,
          cidadeIbge: evento.cidadeIbge,
          estado: evento.estado,
          estadoIbge: evento.estadoIbge,
        });
      }

      setInscricoesAbertas(evento.inscricoesAbertas);
      setLimiteInscricoes(evento.limiteInscricoes?.toString() || '');
      setTrajetoUrl(evento.trajetoUrl || '');
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel carregar o evento');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function formatDateFromISO(isoDate: string): string {
    const date = parseLocalDate(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatData(value: string) {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }

  function formatHorario(value: string) {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    return numbers.replace(/(\d{2})(\d)/, '$1:$2');
  }

  function parseDataToISO(dataStr: string): string {
    const parts = dataStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dataStr;
  }

  function validarData(dataStr: string): boolean {
    if (!dataStr || dataStr.length !== 10) return false;

    const parts = dataStr.split('/');
    if (parts.length !== 3) return false;

    const dia = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10);
    const ano = parseInt(parts[2], 10);

    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    if (ano < 2024 || ano > 2100) return false;
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;

    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getDate() === dia &&
           dataObj.getMonth() === mes - 1 &&
           dataObj.getFullYear() === ano;
  }

  function validarHorario(horarioStr: string): boolean {
    if (!horarioStr) return true;
    if (horarioStr.length !== 5) return false;

    const parts = horarioStr.split(':');
    if (parts.length !== 2) return false;

    const hora = parseInt(parts[0], 10);
    const minuto = parseInt(parts[1], 10);

    if (isNaN(hora) || isNaN(minuto)) return false;
    if (hora < 0 || hora > 23) return false;
    if (minuto < 0 || minuto > 59) return false;

    return true;
  }

  async function handleSalvar() {
    if (!nome.trim() || !data || !local.trim() || !localidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatorios');
      return;
    }

    if (!validarData(data)) {
      Alert.alert('Erro', 'Data invalida. Use o formato DD/MM/AAAA com uma data valida');
      return;
    }

    if (!validarHorario(horario)) {
      Alert.alert('Erro', 'Horario invalido. Use o formato HH:MM (ex: 08:30)');
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
      trajetoUrl: trajetoUrl.trim() || undefined,
    };

    setSaving(true);
    try {
      await eventosService.atualizar(Number(id), eventoData);
      Alert.alert('Sucesso', 'Evento atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar evento';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Editar Evento</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <BannerPlaceholder disabled />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Corrida de Verao 2025"
              placeholderTextColor={Colors.textLight}
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descricao</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descricao do evento..."
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
              <Text style={styles.label}>Horario</Text>
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
            label="Cidade"
            value={localidade}
            onChange={setLocalidade}
            required
          />

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { marginBottom: 0 }]}>Link do trajeto (Google Maps)</Text>
              <TouchableOpacity
                style={styles.helpIcon}
                onPress={() => setShowTrajetoHelp(true)}
              >
                <Text style={styles.helpIconText}>?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cole o link do trajeto aqui"
              placeholderTextColor={Colors.textLight}
              value={trajetoUrl}
              onChangeText={setTrajetoUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={styles.hint}>
              Crie o trajeto em maps.google.com/d e cole o link de compartilhamento
            </Text>
          </View>

          <Modal
            visible={showTrajetoHelp}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTrajetoHelp(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Como criar o link do trajeto</Text>

                <View style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>1</Text>
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepText}>
                      Acesse o Google My Maps em
                    </Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL('https://www.google.com/maps/d/')}
                    >
                      <Text style={[styles.stepText, styles.stepLink]}>
                        google.com/maps/d
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>2</Text>
                  <Text style={[styles.stepText, styles.stepTextFlex]}>
                    Clique em "Criar um novo mapa"
                  </Text>
                </View>

                <View style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>3</Text>
                  <Text style={[styles.stepText, styles.stepTextFlex]}>
                    Na barra de ferramentas, clique em "Adicionar trajeto de carro/bike/a pe"
                  </Text>
                </View>

                <View style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>4</Text>
                  <Text style={[styles.stepText, styles.stepTextFlex]}>
                    Desenhe o trajeto clicando nos pontos do percurso no mapa
                  </Text>
                </View>

                <View style={styles.stepContainer}>
                  <Text style={styles.stepNumber}>5</Text>
                  <Text style={[styles.stepText, styles.stepTextFlex]}>
                    Clique em "Compartilhar" e copie o link gerado
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowTrajetoHelp(false)}
                >
                  <Text style={styles.modalButtonText}>Entendi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Limite de inscricoes</Text>
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
              <Text style={styles.label}>Inscricoes abertas</Text>
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
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSalvar}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Salvar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  helpIconText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  stepTextFlex: {
    flex: 1,
  },
  stepLink: {
    color: Colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  modalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
