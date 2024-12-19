import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  SafeAreaView,
  Modal,
  Dimensions,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface FoodItem {
  id: number;
  name: string;
  image: any;
  nutrition: {
    protein: number;
    karbohidrat: number;
    lemak: number;
    serat?: number;
  };
}

const foodItems: FoodItem[] = [
  {
    id: 1,
    name: 'Nasi Putih',
    image: require('../assets/images/nasi.png'),
    nutrition: {
      protein: 3,
      karbohidrat: 39.8,
      lemak: 0.3,
    }
  },
  {
    id: 2,
    name: 'Daging Ayam',
    image: require('../assets/images/ayam.png'),
    nutrition: {
      protein: 27,
      karbohidrat: 0,
      lemak: 3.6,
    }
  },
  {
    id: 3,
    name: 'Ikan Salmon',
    image: require('../assets/images/salmon.png'),
    nutrition: {
      protein: 20,
      karbohidrat: 0,
      lemak: 13,
    }
  },
  {
    id: 4,
    name: 'Telur Rebus',
    image: require('../assets/images/telur_rebus.png'),
    nutrition: {
      protein: 6.3,
      karbohidrat: 0.6,
      lemak: 5.3,
    }
  },
  {
    id: 5,
    name: 'Bayam Rebus',
    image: require('../assets/images/bayam.png'),
    nutrition: {
      protein: 2.9,
      karbohidrat: 3.6,
      lemak: 0.4,
      serat: 2.2,
    }
  },
  {
    id: 6,
    name: 'Wortel Rebus',
    image: require('../assets/images/wortel.png'),
    nutrition: {
      protein: 0.9,
      karbohidrat: 9.6,
      lemak: 0.2,
      serat: 2.8,
    }
  },
  {
    id: 7,
    name: 'Kentang Rebus',
    image: require('../assets/images/kentang.png'),
    nutrition: {
      protein: 2,
      karbohidrat: 17,
      lemak: 0.1,
      serat: 2.2,
    }
  },
  {
    id: 8,
    name: 'Tempe',
    image: require('../assets/images/tempe.png'),
    nutrition: {
      protein: 19,
      karbohidrat: 9,
      lemak: 8.8,
      serat: 1.4,
    }
  },
  {
    id: 9,
    name: 'Pisang',
    image: require('../assets/images/pisang.png'),
    nutrition: {
      protein: 1.1,
      karbohidrat: 22.8,
      lemak: 0.3,
      serat: 2.6,
    }
  },
];

const InformasiGizi = () => {
  const navigation = useNavigation();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/gizi.png')}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Informasi Gizi</Text>
        </View>
      </View>

      {/* Scrollable Grid of food items */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {foodItems.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.gridItem}
            onPress={() => setSelectedFood(item)}
          >
            <View style={styles.itemContainer}>
              <Image source={item.image} style={styles.foodImage} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Nutrition Modal */}
      <Modal
        visible={selectedFood !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedFood(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedFood(null)}
        >
          <View style={styles.modalContent}>
            <Image 
              source={selectedFood?.image} 
              style={styles.modalImage}
            />
            <Text style={styles.foodName}>
              {selectedFood?.name}
              <Text style={styles.perGram}> per 100gr</Text>
            </Text>
            <View style={styles.nutritionInfo}>
              <Text style={styles.nutritionText}>
                Protein      {selectedFood?.nutrition.protein} gram
              </Text>
              <Text style={styles.nutritionText}>
                Karbohidrat  {selectedFood?.nutrition.karbohidrat} gram
              </Text>
              <Text style={styles.nutritionText}>
                Lemak       {selectedFood?.nutrition.lemak} gram
              </Text>
              {selectedFood?.nutrition.serat !== undefined && (
                <Text style={styles.nutritionText}>
                  Serat       {selectedFood?.nutrition.serat} gram
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '25%',
    padding: 8,
  },
  itemContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  modalImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  perGram: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  },
  nutritionInfo: {
    alignSelf: 'stretch',
  },
  nutritionText: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default InformasiGizi;