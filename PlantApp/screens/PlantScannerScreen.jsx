import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import colors from '../utils/colors';
import API_BASE_URL, { GEMINI_API_KEY } from '../apiConfig';


const { width } = Dimensions.get('window');

export default function PlantScannerScreen({ route, navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadingPhrases = [
    "Uploading plant image...",
    "Analyzing leaf structure...",
    "Identifying botanical species...",
    "Consulting botanical database...",
    "Extracting care instructions...",
    "Generating fun facts..."
  ];

  // Initialize and check for API Key (optional local key fallback)
  useEffect(() => {
    const initializeKey = async () => {
      if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
        setApiKey(GEMINI_API_KEY);
      } else {
        const storedKey = await AsyncStorage.getItem('user_gemini_api_key');
        if (storedKey) {
          setApiKey(storedKey);
        }
      }
    };
    initializeKey();
  }, []);

  // Configure navigation header options dynamically (API Key button)
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <TouchableOpacity 
  //         style={{
  //           paddingVertical: 6,
  //           paddingHorizontal: 12,
  //           borderRadius: 15,
  //           backgroundColor: '#e8f8f5',
  //           marginRight: 15,
  //         }}
  //         onPress={() => {
  //           setKeyInput(apiKey);
  //           setShowKeyModal(true);
  //         }}
  //       >
  //         <Text style={{
  //           fontSize: 12,
  //           fontFamily: 'Poppins-Medium',
  //           color: '#2ecc71',
  //         }}>API Key</Text>
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation, apiKey]);

  // Handle incoming camera parameters from navigation
  useEffect(() => {
    const { imageUri: routeUri, imageBase64: routeBase64 } = route.params || {};
    if (routeUri && routeBase64) {
      setImageUri(routeUri);
      setImageBase64(routeBase64);
      setPlantData(null);
      setErrorMsg(null);

      const runInitialScan = async () => {
        let activeKey = GEMINI_API_KEY;
        if (!activeKey || activeKey.trim() === '') {
          activeKey = await AsyncStorage.getItem('user_gemini_api_key');
        }
        if (activeKey) {
          setApiKey(activeKey);
        }
        identifyPlant(routeBase64, activeKey);
      };
      runInitialScan();
    }
  }, [route.params]);


  // Scanning laser animation
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [loading]);

  // Loading text rotating timer
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2500);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Fade-in results animation
  useEffect(() => {
    if (plantData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [plantData]);

  // Save key from modal
  const handleSaveKey = async () => {
    if (!keyInput.trim()) {
      Alert.alert('Error', 'Please enter a valid API Key.');
      return;
    }
    try {
      await AsyncStorage.setItem('user_gemini_api_key', keyInput.trim());
      setApiKey(keyInput.trim());
      setShowKeyModal(false);
      Alert.alert('Success', 'Gemini API Key saved successfully!');
      
      // If we already have an image loaded but waiting, identify it now
      if (imageBase64) {
        identifyPlant(imageBase64, keyInput.trim());
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save API key.');
    }
  };

  // Call Gemini Vision API (directly or via backend proxy)
  const identifyPlant = async (base64Content, activeKey) => {
    const keyToUse = activeKey || apiKey;
    
    setLoading(true);
    setErrorMsg(null);
    setPlantData(null);

    const isUsingDirectApi = !!keyToUse;
    const url = isUsingDirectApi
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`
      : `${API_BASE_URL}api/identify-plant`;

    const requestBody = isUsingDirectApi
      ? {
          contents: [
            {
              parts: [
                {
                  text: `Identify the plant or tree in this image. 
Respond ONLY with a valid raw JSON object, without any Markdown syntax, code block formatting (do NOT include \`\`\`json or \`\`\`), or additional commentary.
The JSON object MUST strictly conform to this structure:
{
  "isPlant": true,
  "commonName": "Common Name of the plant or tree",
  "scientificName": "Scientific name",
  "category": "Indoor" or "Outdoor",
  "family": "Botanical family",
  "description": "A beautiful, rich and informative description explaining the plant's history, appearance, and characteristics.",
  "toxicity": "Safe for pets and kids" or "Toxic if ingested (specify details)",
  "maintenance": "Low", "Medium", or "High",
  "airPurifying": true or false,
  "careTips": {
    "light": "Provide direct details about sunlight requirements",
    "water": "Provide detailed watering frequency and instructions",
    "soil": "Recommend the best type of soil/potting mix",
    "temperature": "Ideal temperature range for optimal growth"
  },
  "funFact": "An interesting, lesser-known botanical fact about this plant."
}
If the image does not show a plant, tree, flower, or shrub clearly, respond with:
{
  "isPlant": false
}`
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Content
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }
      : { image: base64Content };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API error (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson?.message) {
            errorMessage = errorJson.message;
          } else if (errorJson?.error?.message) {
            errorMessage = errorJson.error.message;
          }
        } catch (e) {
          if (errorText) {
            errorMessage = errorText.substring(0, 150);
          }
        }

        if (response.status === 400 || response.status === 403) {
          throw new Error(isUsingDirectApi ? `Invalid API Key or authorization error: ${errorMessage}` : errorMessage);
        }
        if (response.status === 429) {
          throw new Error("Rate limit or quota exceeded. You have made too many requests in a short time. Please wait a minute and try again.");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        const jsonText = data.candidates[0].content.parts[0].text;
        
        // Robust cleanup in case Gemini returns markdown tags
        let cleanText = jsonText.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(json)?/, '').trim();
          cleanText = cleanText.replace(/```$/, '').trim();
        }

        let parsed;
        try {
          parsed = JSON.parse(cleanText);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError, "Cleaned text:", cleanText);
          throw new Error("Received malformed botanical data from the server. Please try scanning again.");
        }
        
        if (parsed.isPlant === false) {
          setErrorMsg("We couldn't identify any plant or tree in this image. Please make sure the plant is clearly visible and in focus, then try again.");
        } else {
          setPlantData(parsed);
        }
      } else {
        // Check if there was safety block or other finish reason
        if (data.candidates && data.candidates[0] && data.candidates[0].finishReason) {
          const reason = data.candidates[0].finishReason;
          if (reason === 'SAFETY') {
            throw new Error("The image was flagged by Gemini safety filters. Please try another image.");
          } else {
            throw new Error(`Request stopped early due to: ${reason}`);
          }
        }
        throw new Error("Failed to receive a valid response structure from Gemini.");
      }
    } catch (error) {
      console.error(error);
      let userFriendlyMsg = error.message || "An unexpected error occurred while communicating with Gemini.";
      if (userFriendlyMsg.includes("Network request failed")) {
        userFriendlyMsg = "Network request failed. Please check your internet connection and try again.";
      }
      setErrorMsg(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };


  // Launch camera
  const handleOpenCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera error', response.errorMessage || 'Failed to open camera');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const capturedImage = response.assets[0];
        setImageUri(capturedImage.uri);
        setImageBase64(capturedImage.base64);
        setPlantData(null);
        setErrorMsg(null);
        identifyPlant(capturedImage.base64);
      }
    });
  };

  // Launch gallery/image library
  const handleOpenGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: true,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Gallery error', response.errorMessage || 'Failed to open gallery');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setImageUri(selectedImage.uri);
        setImageBase64(selectedImage.base64);
        setPlantData(null);
        setErrorMsg(null);
        identifyPlant(selectedImage.base64);
      }
    });
  };

  // Laser scanner translateY calculation
  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 275],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Custom navigation is now handled natively via react-navigation in App.tsx */}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Image Preview / Scan Container */}
        {imageUri ? (
          <View style={styles.imageCardContainer}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              
              {/* Laser Scan Animation Overlay */}
              {loading && (
                <View style={StyleSheet.absoluteFill}>
                  <View style={styles.scanOverlay} />
                  <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
                </View>
              )}

              {/* Indoor/Outdoor floating badge */}
              {plantData && (
                <View style={[styles.floatingBadge, { backgroundColor: plantData.category === 'Indoor' ? '#e8f8f5' : '#ebf5fb' }]}>
                  <Text style={[styles.floatingBadgeText, { color: plantData.category === 'Indoor' ? '#2ecc71' : '#2980b9' }]}>
                    {plantData.category === 'Indoor' ? '🌿 Indoor' : '🏡 Outdoor'}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions (Retake / Upload another) when not loading */}
            {!loading && (
              <View style={styles.quickActionsRow}>
                <TouchableOpacity style={styles.quickActionBtn} onPress={handleOpenCamera}>
                  <Text style={styles.quickActionText}>📸 Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickActionBtn} onPress={handleOpenGallery}>
                  <Text style={styles.quickActionText}>🖼️ Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Empty State - Choose Action */
          <View style={styles.emptyContainer}>
            <View style={styles.welcomeCircle}>
              <Image source={require('../assets/qrcode_icon.png')} style={styles.welcomeIcon} />
            </View>
            <Text style={styles.emptyTitle}>Identify Any Plant</Text>
            <Text style={styles.emptySubtitle}>
              Take a clear picture of a leaf, tree, or flower to instantly discover care instructions and botanical details.
            </Text>
            
            <View style={styles.emptyActionRow}>
              <TouchableOpacity style={styles.emptyActionBtn} onPress={handleOpenCamera}>
                <Text style={styles.emptyActionBtnText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.emptyActionBtn, styles.galleryBtn]} onPress={handleOpenGallery}>
                <Text style={[styles.emptyActionBtnText, styles.galleryBtnText]}>Upload Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading Spinner with Rotating Phrases */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primaryGreen} />
            <Text style={styles.loaderPhrase}>{loadingPhrases[loadingPhraseIndex]}</Text>
            <Text style={styles.loaderSubtext}>This will take a few seconds...</Text>
          </View>
        )}

        {/* Error Container */}
        {errorMsg && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Identification Failed</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => identifyPlant(imageBase64)}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plant Details & Botanical Report */}
        {plantData && !loading && (
          <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
            
            {/* Plant Header Card */}
            <View style={styles.plantHeaderCard}>
              <Text style={styles.commonName}>{plantData.commonName}</Text>
              <Text style={styles.scientificName}>{plantData.scientificName}</Text>
              <Text style={styles.familyName}>Family: {plantData.family}</Text>
            </View>

            {/* Spec Badges Grid */}
            <View style={styles.badgeRow}>
              
              {/* Maintenance badge */}
              <View style={styles.badgeCard}>
                <Image source={require('../assets/maintenance_icon.png')} style={styles.badgeIcon} />
                <Text style={styles.badgeLabel}>MAINTENANCE</Text>
                <Text style={[styles.badgeValue, { color: colors.primaryGreen }]}>
                  {plantData.maintenance || 'Medium'}
                </Text>
              </View>

              {/* Toxicity badge */}
              <View style={styles.badgeCard}>
                <Image source={require('../assets/toxicity.png')} style={styles.badgeIcon} />
                <Text style={styles.badgeLabel}>PET SAFETY</Text>
                <Text style={[styles.badgeValue, { color: (plantData.toxicity || '').toLowerCase().includes('toxic') && !(plantData.toxicity || '').toLowerCase().includes('safe') ? '#e74c3c' : '#2ecc71' }]}>
                  {(plantData.toxicity || '').toLowerCase().includes('toxic') && !(plantData.toxicity || '').toLowerCase().includes('safe') ? 'Toxic' : 'Safe'}
                </Text>
              </View>

              {/* Air Purifying badge */}
              <View style={styles.badgeCard}>
                <Image source={require('../assets/air_purify_icon.png')} style={styles.badgeIcon} />
                <Text style={styles.badgeLabel}>AIR PURIFIER</Text>
                <Text style={[styles.badgeValue, { color: colors.primaryGreen }]}>
                  {plantData.airPurifying ? 'Yes' : 'No'}
                </Text>
              </View>

            </View>

            {/* Description Section */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.descriptionText}>{plantData.description}</Text>
              {plantData.toxicity ? (
                <Text style={styles.toxicityNoteText}>⚠️ <Text style={{fontWeight: 'bold'}}>Safety note: </Text>{plantData.toxicity}</Text>
              ) : null}
            </View>

            {/* Care Tips Section */}
            <Text style={styles.mainTitle}>Care Guide</Text>
            
            <View style={styles.careTipsGrid}>
              
              {/* Light requirement */}
              <View style={styles.careItem}>
                <View style={styles.careHeader}>
                  <Image source={require('../assets/sunlight_icon.png')} style={styles.careIcon} />
                  <Text style={styles.careTitle}>Sunlight</Text>
                </View>
                <Text style={styles.careDescription}>{plantData.careTips?.light || 'N/A'}</Text>
              </View>

              {/* Water requirement */}
              <View style={styles.careItem}>
                <View style={styles.careHeader}>
                  <Image source={require('../assets/water_icon.png')} style={styles.careIcon} />
                  <Text style={styles.careTitle}>Watering</Text>
                </View>
                <Text style={styles.careDescription}>{plantData.careTips?.water || 'N/A'}</Text>
              </View>

              {/* Soil requirement */}
              <View style={styles.careItem}>
                <View style={styles.careHeader}>
                  <Image source={require('../assets/soil_icon.png')} style={styles.careIcon} />
                  <Text style={styles.careTitle}>Soil</Text>
                </View>
                <Text style={styles.careDescription}>{plantData.careTips?.soil || 'N/A'}</Text>
              </View>

              {/* Temperature requirement */}
              <View style={styles.careItem}>
                <View style={styles.careHeader}>
                  <Image source={require('../assets/temperature_icon.png')} style={styles.careIcon} />
                  <Text style={styles.careTitle}>Temperature</Text>
                </View>
                <Text style={styles.careDescription}>{plantData.careTips?.temperature || 'N/A'}</Text>
              </View>

            </View>

            {/* Fun Fact Section */}
            {plantData.funFact && (
              <View style={styles.funFactCard}>
                <Text style={styles.funFactTitle}>💡 Did You Know?</Text>
                <Text style={styles.funFactText}>{plantData.funFact}</Text>
              </View>
            )}

            {/* Bottom Button */}
            <TouchableOpacity 
              style={styles.doneBtn}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.doneBtnText}>Back to Home</Text>
            </TouchableOpacity>

          </Animated.View>
        )}
      </ScrollView>

      {/* API Key Input Modal */}
      <Modal
        visible={showKeyModal}
        transparent={true}
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Gemini API Key Required</Text>
            <Text style={styles.modalDescription}>
              This app uses Gemini 1.5 Flash to scan and identify plants. Please enter your Google Gemini API Key below.
            </Text>
            
            <TouchableOpacity 
              onPress={() => Alert.alert('Instructions', '1. Go to Google AI Studio (aistudio.google.com)\n2. Log in with your Google account.\n3. Click "Get API Key".\n4. Copy and paste it here. It is free to use!')}
              style={styles.guideBtn}
            >
              <Text style={styles.guideBtnText}>How to get a free API Key?</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.keyInput}
              placeholder="Paste AI Studio API Key"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={keyInput}
              onChangeText={setKeyInput}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn]} 
                onPress={() => setShowKeyModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveBtn]} 
                onPress={handleSaveKey}
              >
                <Text style={styles.saveBtnText}>Save Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfcfc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f3f4',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f7f8',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2c3e50',
  },
  settingsButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#e8f8f5',
  },
  settingsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#2ecc71',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageCardContainer: {
    marginBottom: 20,
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
    backgroundColor: '#f5f7f8',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  scanLine: {
    height: 4,
    backgroundColor: '#2ecc71',
    width: '100%',
    position: 'absolute',
    shadowColor: '#2ecc71',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  floatingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  floatingBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickActionBtn: {
    flex: 0.48,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4a5568',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  welcomeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#e8f8f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeIcon: {
    width: 40,
    height: 40,
    tintColor: '#2ecc71',
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  emptyActionRow: {
    width: '100%',
    paddingHorizontal: 10,
  },
  emptyActionBtn: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#2ecc71',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  galleryBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#2ecc71',
    shadowColor: 'transparent',
    elevation: 0,
  },
  galleryBtnText: {
    color: '#2ecc71',
  },
  loaderContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  loaderPhrase: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#2d3748',
    marginTop: 15,
    marginBottom: 5,
  },
  loaderSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#a0aec0',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fdf2f2',
    borderWidth: 1,
    borderColor: '#fde8e8',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#c53030',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9b2c2c',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#c53030',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  resultsContainer: {
    width: '100%',
  },
  plantHeaderCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  commonName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1a202c',
  },
  scientificName: {
    fontSize: 16,
    fontFamily: 'Poppins-Italic',
    fontStyle: 'italic',
    color: '#718096',
    marginTop: 4,
  },
  familyName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#a0aec0',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  badgeCard: {
    flex: 0.31,
    paddingVertical: 15,
    paddingHorizontal: 5,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeIcon: {
    width: 24,
    height: 24,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  badgeLabel: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#a0aec0',
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  sectionCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4a5568',
    lineHeight: 22,
  },
  toxicityNoteText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#c53030',
    marginTop: 15,
    lineHeight: 18,
    backgroundColor: '#fff5f5',
    padding: 10,
    borderRadius: 8,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  careTipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  careItem: {
    width: '48%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  careHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  careIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    resizeMode: 'contain',
  },
  careTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#718096',
  },
  careDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4a5568',
    lineHeight: 18,
  },
  funFactCard: {
    padding: 20,
    backgroundColor: '#e8f8f5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1f2eb',
    marginBottom: 25,
  },
  funFactTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1abc9c',
    marginBottom: 6,
  },
  funFactText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#16a085',
    lineHeight: 20,
  },
  doneBtn: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#2ecc71',
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#2ecc71',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#2d3748',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  guideBtn: {
    marginBottom: 20,
    padding: 5,
  },
  guideBtnText: {
    color: '#2ecc71',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    textDecorationLine: 'underline',
  },
  keyInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#2d3748',
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 0.47,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#edf2f7',
  },
  cancelBtnText: {
    color: '#4a5568',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
