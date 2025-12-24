import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Evento {
  id: number;
  nome: string;
  descricao?: string;
  data: string;
  horario?: string;
  local: string;
  cidade: string;
  estado: string;
  inscricoesAbertas: boolean;
}

interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  distanciaKm: number;
  valor: number;
  limiteVagas?: number;
}

export default function InscricaoEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [inscrevendo, setInscrevendo] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventoRes, categoriasRes] = await Promise.all([
        api.get(`${ENDPOINTS.EVENTOS.PUBLICOS}/${id}`),
        api.get(ENDPOINTS.CATEGORIAS_PUBLICAS(Number(id))),
      ]);
      setEvento(eventoRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o evento');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function handleSelectCategoria(categoria: Categoria) {
    setSelectedCategoria(categoria);
    setModalVisible(true);
  }

  async function handleConfirmarInscricao() {
    if (!selectedCategoria) return;

    setInscrevendo(true);
    try {
      await api.post(ENDPOINTS.INSCRICOES.INSCREVER(Number(id)), {
        categoriaId: selectedCategoria.id,
      });
      setModalVisible(false);
      Alert.alert(
        'Sucesso!',
        'Sua inscrição foi realizada com sucesso. Acompanhe o status na aba "Inscrições".',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/inscricoes') }]
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar inscrição';
      Alert.alert('Erro', message);
    } finally {
      setInscrevendo(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!evento) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eventoNome}>{evento.nome}</Text>

          {!evento.inscricoesAbertas && (
            <View style={styles.alertBanner}>
              <Text style={styles.alertText}>Inscrições encerradas</Text>
            </View>
          )}

          {evento.descricao && (
            <Text style={styles.descricao}>{evento.descricao}</Text>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View>
                <Text style={styles.infoLabel}>Data</Text>
                <Text style={styles.infoValue}>{formatDate(evento.data)}</Text>
              </View>
            </View>

            {evento.horario && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🕐</Text>
                <View>
                  <Text style={styles.infoLabel}>Horário</Text>
                  <Text style={styles.infoValue}>{evento.horario}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View>
                <Text style={styles.infoLabel}>Local</Text>
                <Text style={styles.infoValue}>{evento.local}</Text>
                <Text style={styles.infoSubvalue}>{evento.cidade}/{evento.estado}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Escolha sua categoria</Text>

        {categorias.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma categoria disponível</Text>
          </View>
        ) : (
          categorias.map((categoria) => (
            <TouchableOpacity
              key={categoria.id}
              style={[
                styles.categoriaCard,
                !evento.inscricoesAbertas && styles.categoriaDisabled,
              ]}
              onPress={() => evento.inscricoesAbertas && handleSelectCategoria(categoria)}
              disabled={!evento.inscricoesAbertas}
            >
              <View style={styles.categoriaHeader}>
                <View>
                  <Text style={styles.categoriaNome}>{categoria.nome}</Text>
                  <Text style={styles.categoriaDistancia}>{categoria.distanciaKm} km</Text>
                </View>
                <View style={styles.categoriaValorContainer}>
                  <Text style={styles.categoriaValor}>{formatCurrency(categoria.valor)}</Text>
                  {evento.inscricoesAbertas && (
                    <Text style={styles.categoriaAction}>Inscrever →</Text>
                  )}
                </View>
              </View>
              {categoria.descricao && (
                <Text style={styles.categoriaDescricao}>{categoria.descricao}</Text>
              )}
              {categoria.limiteVagas && (
                <Text style={styles.categoriaVagas}>{categoria.limiteVagas} vagas disponíveis</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Inscrição</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedCategoria && (
              <View style={styles.modalBody}>
                <Text style={styles.modalEventoNome}>{evento.nome}</Text>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Categoria</Text>
                  <Text style={styles.modalInfoValue}>{selectedCategoria.nome}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Distância</Text>
                  <Text style={styles.modalInfoValue}>{selectedCategoria.distanciaKm} km</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Valor</Text>
                  <Text style={styles.modalValor}>{formatCurrency(selectedCategoria.valor)}</Text>
                </View>

                <View style={styles.modalWarning}>
                  <Text style={styles.modalWarningText}>
                    Ao confirmar, sua inscrição ficará com status "Pendente" até a confirmação do pagamento.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.confirmButton, inscrevendo && styles.buttonDisabled]}
                  onPress={handleConfirmarInscricao}
                  disabled={inscrevendo}
                >
                  {inscrevendo ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmar Inscrição</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventoNome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  alertBanner: {
    backgroundColor: Colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    color: Colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  descricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  infoSubvalue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
  },
  categoriaCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriaDisabled: {
    opacity: 0.6,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoriaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  categoriaDistancia: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  categoriaValorContainer: {
    alignItems: 'flex-end',
  },
  categoriaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoriaAction: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  categoriaDescricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  categoriaVagas: {
    fontSize: 12,
    color: Colors.warning,
    marginTop: 8,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalEventoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalInfoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  modalValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalWarning: {
    backgroundColor: Colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 20,
  },
  modalWarningText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
