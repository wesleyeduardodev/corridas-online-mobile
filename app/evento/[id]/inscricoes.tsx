import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { eventosService, Inscricao } from '@/services/eventos';

export default function InscricoesEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadInscricoes = useCallback(async () => {
    try {
      const data = await eventosService.listarInscricoes(Number(id));
      setInscricoes(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as inscrições');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadInscricoes();
  }, [loadInscricoes]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAGO':
        return Colors.success;
      case 'PENDENTE':
        return Colors.warning;
      case 'CANCELADO':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PAGO':
        return 'Pago';
      case 'PENDENTE':
        return 'Pendente';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  function openModal(inscricao: Inscricao) {
    setSelectedInscricao(inscricao);
    setModalVisible(true);
  }

  async function handleUpdateStatus(novoStatus: string) {
    if (!selectedInscricao) return;

    setUpdating(true);
    try {
      await eventosService.atualizarStatusInscricao(
        Number(id),
        selectedInscricao.id,
        novoStatus
      );
      Alert.alert('Sucesso', 'Status atualizado!');
      setModalVisible(false);
      loadInscricoes();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar status';
      Alert.alert('Erro', message);
    } finally {
      setUpdating(false);
    }
  }

  function renderInscricao({ item }: { item: Inscricao }) {
    return (
      <TouchableOpacity style={styles.inscricaoCard} onPress={() => openModal(item)}>
        <View style={styles.inscricaoHeader}>
          <View>
            <Text style={styles.atletaNome}>{item.atletaNome}</Text>
            <Text style={styles.atletaEmail}>{item.atletaEmail}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.inscricaoInfo}>
          <Text style={styles.infoText}>Categoria: {item.categoriaNome}</Text>
          <Text style={styles.infoText}>CPF: {item.atletaCpf}</Text>
          <Text style={styles.infoText}>Data: {formatDate(item.dataInscricao)}</Text>
          {item.numeroInscricao && (
            <Text style={styles.numeroInscricao}>#{item.numeroInscricao}</Text>
          )}
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

  const inscricoesPendentes = inscricoes.filter(i => i.status === 'PENDENTE').length;
  const inscricoesPagas = inscricoes.filter(i => i.status === 'PAGO').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inscrições</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{inscricoes.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: Colors.success }]}>{inscricoesPagas}</Text>
          <Text style={styles.summaryLabel}>Pagas</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: Colors.warning }]}>{inscricoesPendentes}</Text>
          <Text style={styles.summaryLabel}>Pendentes</Text>
        </View>
      </View>

      <FlatList
        data={inscricoes}
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
            <Text style={styles.emptyText}>Nenhuma inscrição neste evento</Text>
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
              <Text style={styles.modalTitle}>Gerenciar Inscrição</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedInscricao && (
              <View style={styles.modalBody}>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Atleta</Text>
                  <Text style={styles.modalInfoValue}>{selectedInscricao.atletaNome}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>E-mail</Text>
                  <Text style={styles.modalInfoValue}>{selectedInscricao.atletaEmail}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>CPF</Text>
                  <Text style={styles.modalInfoValue}>{selectedInscricao.atletaCpf}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Categoria</Text>
                  <Text style={styles.modalInfoValue}>{selectedInscricao.categoriaNome}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Status atual</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedInscricao.status) + '20' }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedInscricao.status) }]}>
                      {getStatusLabel(selectedInscricao.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalActionsTitle}>Alterar status para:</Text>

                <View style={styles.modalActions}>
                  {selectedInscricao.status !== 'PAGO' && (
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: Colors.success }]}
                      onPress={() => handleUpdateStatus('PAGO')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.statusButtonText}>Confirmar Pagamento</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {selectedInscricao.status !== 'PENDENTE' && (
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: Colors.warning }]}
                      onPress={() => handleUpdateStatus('PENDENTE')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.statusButtonText}>Marcar como Pendente</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {selectedInscricao.status !== 'CANCELADO' && (
                    <TouchableOpacity
                      style={[styles.statusButton, { backgroundColor: Colors.error }]}
                      onPress={() => handleUpdateStatus('CANCELADO')}
                      disabled={updating}
                    >
                      {updating ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.statusButtonText}>Cancelar Inscrição</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  inscricaoCard: {
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
  inscricaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  atletaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  atletaEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inscricaoInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  numeroInscricao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  modalActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  modalActions: {
    gap: 8,
    marginBottom: 20,
  },
  statusButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
