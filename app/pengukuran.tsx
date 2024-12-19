import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface DataBayi {
  nama: string;
  umur: string;
  jk: string;
  ibu: string;
  berat?: number;
  tinggi?: number;
  suhu?: number;
  lingkar?: number;
}

export default function Pengukuran() {
  const router = useRouter();
  const [dataDiri, setDataDiri] = useState<DataBayi>({
    nama: "",
    umur: "",
    jk: "",
    ibu: "",
  });
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Validasi form input
  const isFormValid =
    dataDiri.nama.trim() &&
    dataDiri.umur.trim() &&
    dataDiri.jk.trim() &&
    dataDiri.ibu.trim();

  const handleNext = () => {
    // Navigate to next page with the data locally
    router.push({
      pathname: "/hasil",
      params: { 
        dataDiri: JSON.stringify(dataDiri)
      }
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const genderOptions = ["Laki-laki", "Perempuan"];

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
            <Text style={styles.headerText}>Input Data Diri</Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#666"
                value={dataDiri.nama}
                onChangeText={(text) => setDataDiri({ ...dataDiri, nama: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Umur (Bulan)</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan umur dalam bulan"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={dataDiri.umur}
                onChangeText={(text) => setDataDiri({ ...dataDiri, umur: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jenis Kelamin</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowGenderModal(true)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !dataDiri.jk && styles.placeholderText
                ]}>
                  {dataDiri.jk || "Pilih jenis kelamin"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Ibu</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama ibu"
                placeholderTextColor="#666"
                value={dataDiri.ibu}
                onChangeText={(text) => setDataDiri({ ...dataDiri, ibu: text })}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button, 
                !isFormValid && styles.buttonDisabled
              ]}
              disabled={!isFormValid}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Lanjutkan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGenderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Jenis Kelamin</Text>
              {genderOptions.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.modalOption,
                    dataDiri.jk === gender && styles.selectedOption
                  ]}
                  onPress={() => {
                    setDataDiri({ ...dataDiri, jk: gender });
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    dataDiri.jk === gender && styles.selectedOptionText
                  ]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowGenderModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingRight: 55, // To balance out the back button width
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    color: "#333",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#f8f8f8",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#666",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  selectedOption: {
    backgroundColor: "#1E90FF",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalCancelButton: {
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#f8f8f8",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    fontWeight: "600",
  },
});