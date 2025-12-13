import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  FlatList,
  View,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../AuthContext';
import LoaderSpinner from '../../LoaderSpinner';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getExpenseCosts, deleteExpense } from '../../services/apiService';
import { ThemeContext } from '../../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const parseCurrencyValue = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const sanitized = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getImageSource = (imageUri) => {
  if (!imageUri) return null;
  if (imageUri.startsWith('http') || imageUri.startsWith('https')) {
    return { uri: imageUri };
  } else if (imageUri.startsWith('data:')) {
    return { uri: imageUri };
  } else {
    // Assume base64
    return { uri: `data:image/jpeg;base64,${imageUri}` };
  }
};

const ItemReport = () => {
  const { id } = useAuth();
  const route = useRoute();
  const { category, Month, Year } = route.params;
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { theme } = useContext(ThemeContext);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const palette = theme === 'dark'
    ? {
        headerGradient: ['#181B4D', '#141736'],
        headerTitle: '#E8ECF7',
        headerSubtitle: '#A5B4FC',
        cardGradient: ['#1E224F', '#161933'],
        iconBackground: 'rgba(129, 140, 248, 0.22)',
        iconPrimary: '#A5B4FC',
        divider: 'rgba(99, 102, 241, 0.32)',
        chipBackground: 'rgba(99, 102, 241, 0.18)',
        chipLabel: '#C7D2FE',
        chipValue: '#E0E7FF',
        textPrimary: '#EEF2FF',
        textSecondary: '#CBD5F5',
        pillText: '#C7D2FE',
        totalLabel: '#E2E8F0',
        totalSubLabel: '#A5B4FC',
        totalAmount: '#C7D2FE',
        detailLabel: '#C7D2FE',
        descriptionText: '#E0E7FF',
        infoBackground: 'rgba(99, 102, 241, 0.14)',
        eyeBackground: 'rgba(79, 70, 229, 0.4)',
        shadow: 'rgba(8, 10, 30, 0.6)',
      }
    : {
        headerGradient: ['#FFFFFF', '#DFF4FF'],
        headerTitle: '#0F172A',
        headerSubtitle: '#2563EB',
        cardGradient: ['#FFFFFF', '#F5FBFF'],
        iconBackground: 'rgba(59, 130, 246, 0.12)',
        iconPrimary: '#3B82F6',
        divider: 'rgba(148, 163, 184, 0.18)',
        chipBackground: 'rgba(59, 130, 246, 0.08)',
        chipLabel: '#1D4ED8',
        chipValue: '#0F172A',
        textPrimary: '#0F172A',
        textSecondary: '#2563EB',
        pillText: '#2563EB',
        totalLabel: '#1F2937',
        totalSubLabel: '#64748B',
        totalAmount: '#2563EB',
        detailLabel: '#64748B',
        descriptionText: '#1F2937',
        infoBackground: 'rgba(148, 163, 184, 0.08)',
        eyeBackground: 'rgba(15, 23, 42, 0.12)',
        shadow: 'rgba(15, 23, 42, 0.25)',
      };

  const {
    headerGradient,
    headerTitle,
    headerSubtitle,
    cardGradient,
    iconBackground,
    iconPrimary,
    divider,
    chipBackground,
    chipLabel,
    chipValue,
    textPrimary,
    textSecondary,
    pillText,
    totalLabel,
    totalSubLabel,
    totalAmount,
    detailLabel,
    descriptionText,
    infoBackground,
    eyeBackground,
    shadow,
  } = palette;

  const getExpenseItems = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getExpenseCosts(id);
      setExpenseItems(data);
    } catch (error) {
      console.error('Error fetching expense items:', error);
      setExpenseItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenseItems();
  }, [id]);

  const filteredItems = expenseItems.filter((item) => {
    const itemMonth = new Date(item.p_date).getMonth() + 1;
    const itemYear = new Date(item.p_date).getFullYear();
    return (
      (category ? item.category === category : true) &&
      (Month ? itemMonth == Month : true) &&
      (Year ? itemYear == Year : true)
    );
  });

  const handleDeleteExpense = (item) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteExpense(item.id, id);
              // Refresh the expense data after deletion
              await getExpenseItems();
              Alert.alert("Success", "Expense deleted successfully");
            } catch (error) {
              console.error("Error deleting expense:", error);
              Alert.alert("Error", "Failed to delete expense");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const handleEditExpense = (item) => {
    console.log('Edit expense:', item);
  };

  const AnimatedItemCard = ({ item, index, onDelete, onEdit }) => {
    const entryAnim = useRef(new Animated.Value(0)).current;
    const deleteScaleAnim = useRef(new Animated.Value(1)).current;
    const editScaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(entryAnim, {
        toValue: 1,
        duration: 420,
        delay: index * 90,
        useNativeDriver: true,
      }).start();
    }, [entryAnim, index]);

    const translateY = entryAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 0],
    });

    const handleDeletePress = () => {
      Animated.sequence([
        Animated.timing(deleteScaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(deleteScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => onDelete?.(item));
    };

    const handleEditPress = () => {
      Animated.sequence([
        Animated.timing(editScaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(editScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => onEdit?.(item));
    };

    const isTaxApplicable = (item.is_tax_app || '').toLowerCase() === 'yes';
    const cost = parseCurrencyValue(item.cost);
    const providedTax = parseCurrencyValue(item.tax_amount);
    const taxAmountRaw = isTaxApplicable
      ? providedTax || Number((cost * 0.18).toFixed(2))
      : 0;
    const totalAmountValue = cost + taxAmountRaw;

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: entryAnim,
            transform: [{ translateY }],
            shadowColor: shadow,
          },
        ]}
      >
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Animated.View style={[{ transform: [{ scale: editScaleAnim }] }]}>
              <Icon name="edit" size={18} color={iconPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
            <Animated.View style={[{ transform: [{ scale: deleteScaleAnim }] }]}>
              <Icon name="delete" size={18} color="#dc2626" />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <LinearGradient
          colors={cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.productIcon, { backgroundColor: iconBackground }]}>
              <Icon name="shopping-bag" size={24} color={iconPrimary} />
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={[styles.productTitle, { color: textPrimary }]}>
                {item.product}
              </ThemedText>
              <View style={styles.dateRow}>
                <Icon name="event" size={16} color={iconPrimary} />
                <ThemedText style={[styles.dateText, { color: textSecondary }]}>
                  {item.p_date}
                </ThemedText>
              </View>
            </View>
            <View style={styles.rightSection}>
              <View style={[styles.amountPill, { backgroundColor: chipBackground }]}>
                <ThemedText style={[styles.amountValue, { color: pillText }]}>
                  ₹{cost.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View style={[styles.chip, { backgroundColor: chipBackground }]}>
              <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Category</ThemedText>
              <ThemedText style={[styles.chipValue, { color: chipValue }]}>{item.category}</ThemedText>
            </View>
            <View style={[styles.chip, { backgroundColor: chipBackground }]}>
              <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Tax Applicable</ThemedText>
              <ThemedText
                style={[
                  styles.chipValue,
                  { color: isTaxApplicable ? '#22C55E' : '#F97316' },
                ]}
              >
                {isTaxApplicable ? 'Yes' : 'No'}
              </ThemedText>
            </View>
            {isTaxApplicable && (
              <View style={[styles.chip, { backgroundColor: chipBackground }]}>
                <ThemedText style={[styles.chipLabel, { color: chipLabel }]}>Tax Amount</ThemedText>
                <ThemedText style={[styles.chipValue, { color: chipValue }]}>
                  ₹{taxAmountRaw.toLocaleString()}
                </ThemedText>
              </View>
            )}
          </View>


          {item.description && (
            <View style={[styles.descriptionContainer, { backgroundColor: infoBackground }]}>
              <ThemedText style={[styles.detailLabel, { color: detailLabel }]}>Notes</ThemedText>
              <ThemedText style={[styles.description, { color: descriptionText }]}>{item.description}</ThemedText>
            </View>
          )}

          {item.image && (
            <View style={[styles.imageContainer, { borderTopColor: divider }]}>
              <Image
                source={getImageSource(item.image)}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[styles.eyeIconButton, { backgroundColor: eyeBackground }]}
                onPress={() => setSelectedImage(item.image)}
              >
                <Icon name="remove-red-eye" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { shadowColor: shadow, backgroundColor: 'transparent' }]}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <ThemedText style={[styles.headerTitle, { color: headerTitle }]}>
            {category} Details
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: headerSubtitle }]}>
            {monthNames[parseInt(Month, 10) - 1]} {Year}
          </ThemedText>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <LoaderSpinner shouldLoad={loading} />
        <View style={styles.headerSection}>{renderHeader()}</View>
        
          <FlatList
            data={filteredItems}
            renderItem={({ item, index }) => (
              <AnimatedItemCard item={item} index={index} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
       
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Image
              source={getImageSource(selectedImage)}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    zIndex: 1,
    paddingHorizontal: 6,
    paddingTop: 0,
    paddingBottom: 16,
  },
  listSection: {
    flex: 1,
  },
  headerContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  headerContent: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  cardWrapper: {
    borderRadius: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 7,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  cardHeader: {
    marginTop:20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    marginLeft: 8,
  },
  amountPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 12,
  },
  chipLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.78,
  },
  chipValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.85,
  },
  totalSubLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.6,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    opacity: 0.65,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    paddingTop: 16,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  eyeIconButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
  },
  modalImage: {
    width: screenWidth,
    height: screenHeight,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});

export default ItemReport;
