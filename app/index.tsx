// app/index.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  route: string;
}

export default function Home() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: '1',
      title: 'Pengukuran',
      icon: require('../assets/images/pengukuran.png'),
      route: 'pengukuran' // Removed leading slash
    },
    {
      id: '2',
      title: 'Riwayat',
      icon: require('../assets/images/riwayat.png'),
      route: 'riwayat' // Removed leading slash
    },
    {
      id: '3',
      title: 'Informasi Gizi',
      icon: require('../assets/images/gizi.png'),
      route: 'informasiGizi' // Removed leading slash
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Selamat datang</Text>
        <Text style={styles.titleText}>Antropometri Digital</Text>
        
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              try {
                router.push(item.route as never);
              } catch (error) {
                console.error('Navigation error:', error);
              }
            }}
          >
            <Image source={item.icon} style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>KKN-Tematik ITERA 2024</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 40,
    paddingBottom: 80,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  titleText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#1a237e',
    borderRadius: 60,
    position: 'absolute',
    bottom: -60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  logo: {
    width: 80,
    height: 80,
  },
  menuContainer: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '500',
  },
  copyrightContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  copyrightText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});