import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { inscricoesService, InscricaoAtleta } from '@/services/inscricoes';
import { formatDateDisplay, parseLocalDate, getToday } from '@/utils/dateHelpers';
import { getStatusColor, getStatusLabel } from '@/utils/statusHelpers';
import { formatCurrency } from '@/utils/formatters';

export default function InscricoesAtletaScreen() {
  const [inscricoes, setInscricoes] = useState<InscricaoAtleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInscricao, setSelectedInscricao] = useState<InscricaoAtleta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const loadInscricoes = useCallback(async () => {
    try {
      const data = await inscricoesService.minhasInscricoes();
      setInscricoes(data);
    } catch (error: any) {
      console.log('Erro ao carregar inscricoes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInscricoes();
    }, [loadInscricoes])
  );

  function openModal(inscricao: InscricaoAtleta) {
    setSelectedInscricao(inscricao);
    setModalVisible(true);
  }

  async function handleCancelar() {
    if (!selectedInscricao) return;

    Alert.alert(
      'Cancelar Inscricao',
      'Tem certeza que deseja cancelar esta inscricao? Esta acao nao pode ser desfeita.',
      [
        { text: 'Nao', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(true);
            try {
              await inscricoesService.cancelar(selectedInscricao.id);
              Alert.alert('Sucesso', 'Inscricao cancelada com sucesso');
              setModalVisible(false);
              loadInscricoes();
            } catch (error: any) {
              const message = error.response?.data?.message || 'Erro ao cancelar inscricao';
              Alert.alert('Erro', message);
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  }

  function renderInscricao({ item }: { item: InscricaoAtleta }) {
    const isPast = parseLocalDate(item.eventoData) < getToday();

    return (
      <TouchableOpacity
        style={[styles.inscricaoCard, item.status === 'CANCELADO' && styles.inscricaoCancelada]}
        onPress={() => openModal(item)}
      >
        <View style={styles.inscricaoHeader}>
          <View style={styles.inscricaoTitleContainer}>
            <Text style={styles.eventoNome}>{item.eventoNome}</Text>
            {isPast && item.status !== 'CANCELADO' && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>Encerrado</Text>
              </View>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.inscricaoBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{formatDateDisplay(item.eventoData)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Local</Text>
            <Text style={styles.infoValue}>{item.eventoCidade}/{item.eventoEstado}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoria</Text>
            <Text style={styles.infoValue}>
              {item.categoriaNome} ({item.categoriaDistanciaKm} km)
            </Text>
          </View>
        </View>

        {item.numeroInscricao && item.status === 'PAGO' && (
          <View style={styles.numeroContainer}>
            <Text style={styles.numeroLabel}>Numero de Peito</Text>
            <Text style={styles.numero}>#{item.numeroInscricao}</Text>
          </View>
        )}

        <View style={styles.inscricaoFooter}>
          <Text style={styles.inscricaoData}>
            Inscrito em {formatDateDisplay(item.dataInscricao)}
          </Text>
          <Text style={styles.valor}>{formatCurrency(item.valor)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const inscricoesAtivas = inscricoes.filter(i => i.status !== 'CANCELADO');
  const inscricoesCanceladas = inscricoes.filter(i => i.status === 'CANCELADO');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Inscricoes</Text>
        <Text style={styles.subtitle}>{inscricoesAtivas.length} inscricoes ativas</Text>
      </View>

      <FlatList
        data={[...inscricoesAtivas, ...inscricoesCanceladas]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderInscricao}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadInscricoes();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏃</Text>
            <Text style={styles.emptyTitle}>Nenhuma inscricao</Text>
            <Text style={styles.emptyText}>
              Voce ainda nao esta inscrito em nenhum evento
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(atleta)/eventos')}
            >
              <Text style={styles.emptyButtonText}>Explorar Eventos</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Inscricao</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>X</Text>
              </TouchableOpacity>
            </View>

            {selectedInscricao && (
              <View style={styles.modalBody}>
                <Text style={styles.modalEventoNome}>{selectedInscricao.eventoNome}</Text>

                <View style={[
                  styles.modalStatusBadge,
                  { backgroundColor: getStatusColor(selectedInscricao.status) + '20' }
                ]}>
                  <Text style={[
                    styles.modalStatusText,
                    { color: getStatusColor(selectedInscricao.status) }
                  ]}>
                    {getStatusLabel(selectedInscricao.status)}
                  </Text>
                </View>

                <View style={styles.modalInfoSection}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Data do Evento</Text>
                    <Text style={styles.modalInfoValue}>{formatDateDisplay(selectedInscricao.eventoData)}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Local</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedInscricao.eventoLocal}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Cidade</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedInscricao.eventoCidade}/{selectedInscricao.eventoEstado}
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Categoria</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedInscricao.categoriaNome} ({selectedInscricao.categoriaDistanciaKm} km)
                    </Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Valor</Text>
                    <Text style={styles.modalInfoValue}>{formatCurrency(selectedInscricao.valor)}</Text>
                  </View>

                  {selectedInscricao.numeroInscricao && (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalInfoLabel}>Numero de Peito</Text>
                      <Text style={styles.modalNumero}>#{selectedInscricao.numeroInscricao}</Text>
                    </View>
                  )}

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Data da Inscricao</Text>
                    <Text style={styles.modalInfoValue}>{formatDateDisplay(selectedInscricao.dataInscricao)}</Text>
                  </View>
                </View>

                {selectedInscricao.status === 'PENDENTE' && (
                  <View style={styles.modalWarning}>
                    <Text style={styles.modalWarningText}>
                      Sua inscricao esta aguardando confirmacao de pagamento pelo organizador.
                    </Text>
                  </View>
                )}

                {selectedInscricao.status !== 'CANCELADO' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelar}
                    disabled={cancelando}
                  >
                    {cancelando ? (
                      <ActivityIndicator color={Colors.error} size="small" />
                    ) : (
                      <Text style={styles.cancelButtonText}>Cancelar Inscricao</Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
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
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  inscricaoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inscricaoCancelada: {
    opacity: 0.6,
  },
  inscricaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inscricaoTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  eventoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  pastBadge: {
    backgroundColor: Colors.textLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  pastBadgeText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inscricaoBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  numeroContainer: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  numeroLabel: {
    fontSize: 14,
    color: Colors.primary,
  },
  numero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  inscricaoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  inscricaoData: {
    fontSize: 12,
    color: Colors.textLight,
  },
  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
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
    maxHeight: '85%',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalInfoSection: {
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalInfoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  modalNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalWarning: {
    backgroundColor: Colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalWarningText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginBottom: 20,
  },
  closeButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
