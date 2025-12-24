import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { localidadesService, Estado, Cidade } from '@/services/localidades';

interface LocalidadeData {
  cidade: string;
  cidadeIbge: number;
  estado: string;
  estadoIbge: number;
}

interface LocalidadeSelectorProps {
  value?: LocalidadeData;
  onChange: (data: LocalidadeData) => void;
  label?: string;
  required?: boolean;
}

export default function LocalidadeSelector({
  value,
  onChange,
  label = 'Localização',
  required = false,
}: LocalidadeSelectorProps) {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const [modalCidadeVisible, setModalCidadeVisible] = useState(false);

  const [selectedEstado, setSelectedEstado] = useState<Estado | null>(null);
  const [selectedCidade, setSelectedCidade] = useState<Cidade | null>(null);

  const [searchEstado, setSearchEstado] = useState('');
  const [searchCidade, setSearchCidade] = useState('');

  useEffect(() => {
    loadEstados();
  }, []);

  useEffect(() => {
    if (value && estados.length > 0 && !selectedEstado) {
      const estado = estados.find(e => e.id === value.estadoIbge);
      if (estado) {
        setSelectedEstado(estado);
      }
    }
  }, [value, estados]);

  useEffect(() => {
    if (selectedEstado) {
      loadCidades(selectedEstado.sigla);
    }
  }, [selectedEstado]);

  useEffect(() => {
    if (value && cidades.length > 0 && !selectedCidade) {
      const cidade = cidades.find(c => c.id === value.cidadeIbge);
      if (cidade) {
        setSelectedCidade(cidade);
      }
    }
  }, [value, cidades]);

  async function loadEstados() {
    setLoadingEstados(true);
    try {
      const data = await localidadesService.listarEstados();
      setEstados(data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    } finally {
      setLoadingEstados(false);
    }
  }

  async function loadCidades(uf: string) {
    setLoadingCidades(true);
    setCidades([]);
    try {
      const data = await localidadesService.listarCidades(uf);
      setCidades(data);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    } finally {
      setLoadingCidades(false);
    }
  }

  function handleSelectEstado(estado: Estado) {
    setSelectedEstado(estado);
    setSelectedCidade(null);
    setModalEstadoVisible(false);
    setSearchEstado('');
  }

  function handleSelectCidade(cidade: Cidade) {
    setSelectedCidade(cidade);
    setModalCidadeVisible(false);
    setSearchCidade('');

    if (selectedEstado) {
      onChange({
        cidade: cidade.nome,
        cidadeIbge: cidade.id,
        estado: selectedEstado.sigla,
        estadoIbge: selectedEstado.id,
      });
    }
  }

  const filteredEstados = estados.filter(e =>
    e.nome.toLowerCase().includes(searchEstado.toLowerCase()) ||
    e.sigla.toLowerCase().includes(searchEstado.toLowerCase())
  );

  const filteredCidades = cidades.filter(c =>
    c.nome.toLowerCase().includes(searchCidade.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && '*'}
        </Text>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.selector, styles.estadoSelector]}
          onPress={() => setModalEstadoVisible(true)}
        >
          <Text style={selectedEstado ? styles.selectorText : styles.selectorPlaceholder}>
            {selectedEstado ? selectedEstado.sigla : 'UF'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.selector, styles.cidadeSelector, !selectedEstado && styles.selectorDisabled]}
          onPress={() => selectedEstado && setModalCidadeVisible(true)}
          disabled={!selectedEstado}
        >
          {loadingCidades ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Text style={selectedCidade ? styles.selectorText : styles.selectorPlaceholder}>
                {selectedCidade ? selectedCidade.nome : 'Selecione a cidade'}
              </Text>
              <Text style={styles.arrow}>▼</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Estados */}
      <Modal
        visible={modalEstadoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEstadoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Estado</Text>
              <TouchableOpacity onPress={() => setModalEstadoVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar estado..."
              placeholderTextColor={Colors.textLight}
              value={searchEstado}
              onChangeText={setSearchEstado}
            />

            {loadingEstados ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={filteredEstados}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleSelectEstado(item)}
                  >
                    <Text style={styles.listItemSigla}>{item.sigla}</Text>
                    <Text style={styles.listItemNome}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Cidades */}
      <Modal
        visible={modalCidadeVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCidadeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Selecione a Cidade ({selectedEstado?.sigla})
              </Text>
              <TouchableOpacity onPress={() => setModalCidadeVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cidade..."
              placeholderTextColor={Colors.textLight}
              value={searchCidade}
              onChangeText={setSearchCidade}
            />

            {loadingCidades ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={filteredCidades}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.listItem}
                    onPress={() => handleSelectCidade(item)}
                  >
                    <Text style={styles.listItemNome}>{item.nome}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  selector: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estadoSelector: {
    width: 80,
  },
  cidadeSelector: {
    flex: 1,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  arrow: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginLeft: 8,
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
    maxHeight: '80%',
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
  searchInput: {
    backgroundColor: Colors.background,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loader: {
    padding: 40,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  listItemSigla: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    width: 40,
  },
  listItemNome: {
    fontSize: 16,
    color: Colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
});
