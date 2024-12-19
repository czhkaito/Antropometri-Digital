import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import Firebase functions
import { 
  db, 
  ref, 
  set, 
  get, 
  auth,
  signInAnonymousUser,
  handleAuthStateChange
} from '../firebase';

// Extend the previous DataBayi interface
interface DataBayi {
  nama: string;
  umur: string;
  jk: string;
  ibu: string;
}

interface PengukuranData {
  height: string;
  weight_kg: string;
  head_circumference: string;
  body_temperature: string;
}

export default function HasilPengukuran() {
  const router = useRouter();
  const { dataDiri } = useLocalSearchParams();
  
  // Parse the initial data from the previous page
  const initialData: DataBayi = dataDiri 
    ? JSON.parse(dataDiri as string) 
    : {
      nama: "",
      umur: "",
      jk: "",
      ibu: "",
    };

  const [pengukuran, setPengukuran] = useState<PengukuranData>({
    height: "",
    weight_kg: "",
    head_circumference: "",
    body_temperature: "",
  });

  const [isManualEdit, setIsManualEdit] = useState(false);
  const [availableMeasurements, setAvailableMeasurements] = useState<string[]>([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Authentication effect
  useEffect(() => {
    const unsubscribe = handleAuthStateChange((user: any) => {
      if (user) {
        // User is signed in anonymously
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        // No user is signed in, attempt anonymous sign-in
        signInAnonymousUser()
          .then(() => {
            // Anonymous sign-in successful
            setIsAuthenticated(true);
          })
          .catch((error) => {
            console.error("Anonymous authentication error:", error);
            Alert.alert(
              "Kesalahan Autentikasi", 
              "Gagal masuk secara anonim. Silakan periksa koneksi internet."
            );
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Fetch available measurements from Firebase
  useEffect(() => {
    // Only fetch measurements if authenticated
    if (!isAuthenticated) return;

    const measurementsRef = ref(db, "measurements");
    get(measurementsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const measurementKeys = Object.keys(snapshot.val());
        setAvailableMeasurements(measurementKeys);
        
        // Automatically select the first measurement if available
        if (measurementKeys.length > 0) {
          setSelectedMeasurement(measurementKeys[0]);
        }
      }
    }).catch((error) => {
      console.error("Error fetching measurements:", error);
    });
  }, [isAuthenticated]);

  // Fetch selected measurement data
  useEffect(() => {
    // Only fetch measurement if authenticated and a measurement is selected
    if (!isAuthenticated || !selectedMeasurement) return;

    const measurementRef = ref(db, `measurements/${selectedMeasurement}`);
    get(measurementRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPengukuran({
          height: data.height ? data.height.toString() : "",
          weight_kg: data.weight_kg ? data.weight_kg.toString() : "",
          head_circumference: data.head_circumference ? data.head_circumference.toString() : "",
          body_temperature: data.body_temperature ? data.body_temperature.toString() : "",
        });
      }
    }).catch((error) => {
      console.error("Error fetching measurement data:", error);
    });
  }, [isAuthenticated, selectedMeasurement]);

  const handleGoBack = () => {
    router.back();
  };

  const retrieveData = () => {
    if (availableMeasurements.length === 0) {
      Alert.alert("Peringatan", "Tidak ada data pengukuran tersedia.");
      return;
    }

    // Show a selection dialog if multiple measurements exist
    if (availableMeasurements.length > 1) {
      Alert.alert(
        "Pilih Data Pengukuran",
        "Silakan pilih data pengukuran yang ingin diambil",
        availableMeasurements.map((key) => ({
          text: key,
          onPress: () => setSelectedMeasurement(key)
        }))
      );
    } else if (availableMeasurements.length === 1) {
      // Automatically select the only available measurement
      setSelectedMeasurement(availableMeasurements[0]);
    }
  };

  const saveToFirebase = async () => {
    // Check authentication and data completeness before saving
    if (!isAuthenticated) {
      Alert.alert("Autentikasi", "Silakan tunggu proses autentikasi selesai.");
      return;
    }

    if (
      pengukuran.height &&
      pengukuran.weight_kg &&
      pengukuran.head_circumference &&
      pengukuran.body_temperature
    ) {
      try {
        // Create a unique key for the measurement
        const newKey = `${Date.now()}`;
        const newRef = ref(db, `Riwayat/${newKey}`);

        // Prepare the full data object to save
        const fullMeasurementData = {
          ...initialData,
          height: parseFloat(pengukuran.height),
          weight_kg: parseFloat(pengukuran.weight_kg),
          head_circumference: parseFloat(pengukuran.head_circumference),
          body_temperature: parseFloat(pengukuran.body_temperature),
          timestamp: new Date().toISOString(),
        };

        // Save to Firebase Realtime Database
        await set(newRef, fullMeasurementData);

        // Show success alert and navigate to history
        Alert.alert(
          "Simpan Data", 
          "Data berhasil disimpan di Riwayat!", 
          [{ text: "OK", onPress: () => router.push("/riwayat") }]
        );
      } catch (error) {
        // Handle any errors during Firebase save
        console.error("Error saving data to Firebase:", error);
        Alert.alert(
          "Kesalahan", 
          "Gagal menyimpan data. Silakan coba lagi."
        );
      }
    } else {
      Alert.alert("Peringatan", "Silakan lengkapi semua data pengukuran");
    }
  };

  // Handle manual input changes
  const handleManualInputChange = (key: keyof PengukuranData, value: string) => {
    setPengukuran(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Toggle manual edit mode
  const toggleManualEdit = () => {
    setIsManualEdit(!isManualEdit);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1E90FF" barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.headerText}>Hasil Pengukuran</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Display basic info */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Nama: {initialData.nama}</Text>
              <Text style={styles.infoText}>Umur: {initialData.umur} Bulan</Text>
              <Text style={styles.infoText}>Jenis Kelamin: {initialData.jk}</Text>
              <Text style={styles.infoText}>Nama Ibu: {initialData.ibu}</Text>
            </View>

            {/* Data Retrieval Button */}
            <TouchableOpacity
              style={[
                styles.dataButton, 
                availableMeasurements.length === 0 && styles.dataButtonDisabled
              ]}
              onPress={retrieveData}
              disabled={availableMeasurements.length === 0}
            >
              <Ionicons 
                name="download" 
                size={24} 
                color="white" 
              />
              <Text style={styles.dataButtonText}>
                Ambil Data
              </Text>
            </TouchableOpacity>

            {/* Selected Measurement Display */}
            {selectedMeasurement && (
              <View style={styles.selectedMeasurementContainer}>
                <Text style={styles.selectedMeasurementText}>
                  Data Terpilih: {selectedMeasurement}
                </Text>
              </View>
            )}

            {/* Measurement Display or Input */}
            <View style={styles.measurementContainer}>
              <View style={styles.measurementTitleContainer}>
                <Text style={styles.measurementTitle}>Data Pengukuran</Text>
                <TouchableOpacity onPress={toggleManualEdit} style={styles.editButton}>
                  <Ionicons 
                    name={isManualEdit ? "close" : "pencil"} 
                    size={20} 
                    color="#1E90FF" 
                  />
                </TouchableOpacity>
              </View>

              {!isManualEdit ? (
                <>
                  <Text style={styles.dataText}>Tinggi Badan: {pengukuran.height} cm</Text>
                  <Text style={styles.dataText}>Berat Badan: {pengukuran.weight_kg} kg</Text>
                  <Text style={styles.dataText}>Lingkar Kepala: {pengukuran.head_circumference} cm</Text>
                  <Text style={styles.dataText}>Suhu Tubuh: {pengukuran.body_temperature} °C</Text>
                </>
              ) : (
                <>
                  <View style={styles.manualInputContainer}>
                    <Text style={styles.inputLabel}>Tinggi Badan (cm)</Text>
                    <TextInput
                      style={styles.manualInput}
                      value={pengukuran.height}
                      onChangeText={(value) => handleManualInputChange('height', value)}
                      keyboardType="numeric"
                      placeholder="Masukkan tinggi badan"
                    />
                  </View>
                  <View style={styles.manualInputContainer}>
                    <Text style={styles.inputLabel}>Berat Badan (kg)</Text>
                    <TextInput
                      style={styles.manualInput}
                      value={pengukuran.weight_kg}
                      onChangeText={(value) => handleManualInputChange('weight_kg', value)}
                      keyboardType="numeric"
                      placeholder="Masukkan berat badan"
                    />
                  </View>
                  <View style={styles.manualInputContainer}>
                    <Text style={styles.inputLabel}>Lingkar Kepala (cm)</Text>
                    <TextInput
                      style={styles.manualInput}
                      value={pengukuran.head_circumference}
                      onChangeText={(value) => handleManualInputChange('head_circumference', value)}
                      keyboardType="numeric"
                      placeholder="Masukkan lingkar kepala"
                    />
                  </View>
                  <View style={styles.manualInputContainer}>
                    <Text style={styles.inputLabel}>Suhu Tubuh (°C)</Text>
                    <TextInput
                      style={styles.manualInput}
                      value={pengukuran.body_temperature}
                      onChangeText={(value) => handleManualInputChange('body_temperature', value)}
                      keyboardType="numeric"
                      placeholder="Masukkan suhu tubuh"
                    />
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.button, 
                (!pengukuran.height || 
                 !pengukuran.weight_kg || 
                 !pengukuran.head_circumference || 
                 !pengukuran.body_temperature) && 
                styles.buttonDisabled
              ]}
              onPress={saveToFirebase}
              disabled={
                !pengukuran.height || 
                !pengukuran.weight_kg || 
                !pengukuran.head_circumference || 
                !pengukuran.body_temperature
              }
            >
              <Text style={styles.buttonText}>Simpan Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#1E90FF",
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    paddingBottom: 10,
  },
  backButton: {
    paddingLeft: 15,
    paddingVertical: 10,
  },
  header: {
    flex: 1,
    paddingRight: 55,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 30,
  },
  infoContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  esp32Button: {
    flexDirection: 'row',
    backgroundColor: "#1E90FF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  esp32ButtonConnected: {
    backgroundColor: "#4CAF50",
  },
  esp32ButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  measurementContainer: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  measurementTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  measurementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  editButton: {
    padding: 5,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  manualInputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  manualInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: "#B0C4DE",
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dataButton: {
    flexDirection: 'row',
    backgroundColor: "#1E90FF",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  dataButtonDisabled: {
    backgroundColor: "#B0C4DE",
  },
  dataButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  selectedMeasurementContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedMeasurementText: {
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});