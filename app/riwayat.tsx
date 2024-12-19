import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ref, get, update, remove } from 'firebase/database';
import { auth, db, handleAuthStateChange, signInAnonymousUser } from '../firebase';
import { useRouter } from 'expo-router';
// Types
type RootStackParamList = {
  Riwayat: undefined;
  Home: undefined;
};

interface BayiData {
  id: string;
  nama: string;
  weight_kg: string;
  ibu: string;
  jk: string;
  head_circumference: string;
  body_temperature: string;
  height: string;
  umur: string;
  timestamp: string;
}

const PRIMARY_COLOR = '#1E90FF';
const { width } = Dimensions.get('window');

export default function Riwayat() {
  const router = useRouter();

  // State Management
  const [riwayat, setRiwayat] = useState<BayiData[]>([]);
  const [filteredRiwayat, setFilteredRiwayat] = useState<BayiData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBayi, setSelectedBayi] = useState<BayiData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBayi, setEditedBayi] = useState<BayiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Riwayat Data
  const fetchRiwayatData = useCallback(async () => {
    try {
      setIsLoading(true);
      const riwayatRef = ref(db, 'Riwayat');
      const snapshot = await get(riwayatRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const riwayatArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setRiwayat(riwayatArray);
        setFilteredRiwayat(riwayatArray);
      } else {
        setRiwayat([]);
        setFilteredRiwayat([]);
      }
    } catch (error) {
      console.error('Firebase data fetch error:', error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Authentication Effect
  useEffect(() => {
    let isMounted = true;

    const setupAuth = async (): Promise<(() => void) | undefined> => {
      try {
        const unsubscribe = handleAuthStateChange(async (currentUser: any) => {
          if (!currentUser) {
            try {
              await signInAnonymousUser();
            } catch (error) {
              if (isMounted) {
                Alert.alert('Login Error', 'Failed to sign in anonymously');
              }
            }
          }
          if (isMounted) {
            fetchRiwayatData();
          }
        });

        return unsubscribe;
      } catch (error) {
        if (isMounted) {
          console.error('Auth setup error:', error);
        }
        return undefined;
      }
    };

    let unsubscribe: (() => void) | undefined;
    
    setupAuth().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchRiwayatData]);


  // Refresh Control
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRiwayatData();
  }, [fetchRiwayatData]);

  // Search Functionality
  useEffect(() => {
    if (searchQuery) {
      const filtered = riwayat.filter(
        item => 
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ibu.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRiwayat(filtered);
    } else {
      setFilteredRiwayat(riwayat);
    }
  }, [searchQuery, riwayat]);

  // Modal Handlers
  const handleBayiPress = (bayi: BayiData) => {
    setSelectedBayi(bayi);
    setModalVisible(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedBayi(selectedBayi ? {...selectedBayi} : null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedBayi(null);
  };

  const handleSave = () => {
    if (editedBayi && selectedBayi) {
      const riwayatRef = ref(db, `Riwayat/${selectedBayi.id}`);
      
      const updateData = {
        nama: editedBayi.nama,
        ibu: editedBayi.ibu,
        jk: editedBayi.jk,
        umur: editedBayi.umur,
        weight_kg: editedBayi.weight_kg,
        height: editedBayi.height,
        head_circumference: editedBayi.head_circumference,
        body_temperature: editedBayi.body_temperature,
        timestamp: new Date().toISOString()
      };

      update(riwayatRef, updateData)
        .then(() => {
          setIsEditing(false);
          setModalVisible(false);
          Alert.alert('Berhasil', 'Data berhasil diperbarui');
        })
        .catch((error) => {
          console.error('Error updating data: ', error);
          Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui data');
        });
    }
  };

  const handleDelete = () => {
    if (selectedBayi) {
      Alert.alert(
        'Konfirmasi Hapus',
        'Apakah Anda yakin ingin menghapus data ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              const riwayatRef = ref(db, `Riwayat/${selectedBayi.id}`);
              remove(riwayatRef)
                .then(() => {
                  setModalVisible(false);
                  Alert.alert('Berhasil', 'Data berhasil dihapus');
                })
                .catch((error) => {
                  console.error('Error deleting data: ', error);
                  Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data');
                });
            },
          },
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back(); // Use router.back() instead of navigation.goBack()
  };

  // Render Detail Item
  const renderDetailItem = (label: string, value: string, editKey: keyof BayiData) => (
    <View style={styles.detailContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.editInput}
          value={editedBayi?.[editKey] || value}  // Use original value if editedBayi is null
          onChangeText={(text) => {
            setEditedBayi(prev => prev ? {
              ...prev,
              [editKey]: text
            } : null);
          }}
        />
      ) : (
        <Text style={styles.detailValue}>{value}</Text>
      )}
    </View>
  );

  // List Item Render
  const renderListItem = ({ item }: { item: BayiData }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleBayiPress(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.nama}</Text>
        <Text style={styles.itemSubtitle}>Anak dari {item.ibu}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={PRIMARY_COLOR} />
    </TouchableOpacity>
  );

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Pengukuran</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#888" 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama bayi atau ibu..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List View */}
      <FlatList
        data={filteredRiwayat}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Tidak ada data yang tersedia</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY_COLOR]}
          />
        }
      />

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>
                {isEditing ? 'Edit Data' : 'Detail Bayi'}
              </Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => {
                  setModalVisible(false);
                  if (isEditing) {
                    handleCancelEdit();
                  }
                }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {selectedBayi && (
              <View style={styles.modalContent}>
                {renderDetailItem('Nama', selectedBayi.nama, 'nama')}
                {renderDetailItem('Nama Ibu', selectedBayi.ibu, 'ibu')}
                {renderDetailItem('Jenis Kelamin', selectedBayi.jk, 'jk')}
                {renderDetailItem('Umur', `${selectedBayi.umur} bulan`, 'umur')}
                {renderDetailItem('Berat Badan', `${selectedBayi.weight_kg} kg`, 'weight_kg')}
                {renderDetailItem('Tinggi Badan', `${selectedBayi.height} cm`, 'height')}
                {renderDetailItem('Lingkar Kepala', `${selectedBayi.head_circumference} cm`, 'head_circumference')}
                {renderDetailItem('Suhu Tubuh', `${selectedBayi.body_temperature}°C`, 'body_temperature')}

                <View style={styles.modalButtonGroup}>
                  {!isEditing ? (
                    <>
                      <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={handleEdit}
                      >
                        <Ionicons name="create-outline" size={20} color="white" />
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={handleDelete}
                      >
                        <Ionicons name="trash-outline" size={20} color="white" />
                        <Text style={styles.buttonText}>Hapus</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.saveButton} 
                      onPress={handleSave}
                    >
                      <Ionicons name="save-outline" size={20} color="white" />
                      <Text style={styles.buttonText}>Simpan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 15, // Reduced from 15 to 10
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  searchIcon: {
    marginRight: 10,
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    height: 45,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 15,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: PRIMARY_COLOR,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  modalHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeModalButton: {
    padding: 10,
  },
  modalContent: {
    padding: 15,
    paddingTop: 0, // Add padding-top: 0 to move the buttons to the top
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 5,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, // Add margin-bottom to create some space between the buttons and the details
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF4500',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});