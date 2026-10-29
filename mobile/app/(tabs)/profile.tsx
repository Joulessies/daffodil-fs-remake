import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/services/supabase';
import {
  initDatabase,
  getDatabaseStatus,
  syncDatabase,
  DatabaseStatus,
} from '@/services/database';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, signInWithGoogle, signInAsDemoClient } = useAuth();
  const { wishlist, addToCart, toggleWishlist } = useCart();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  // Saved Customer Contact & Delivery Details
  const [profileName, setProfileName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  );
  const [profilePhone, setProfilePhone] = useState('0917 123 4567');
  const [profileStreet, setProfileStreet] = useState('Unit 14B, Ayala Avenue');
  const [profileCity, setProfileCity] = useState('Makati City, Metro Manila');
  const [profilePostalCode, setProfilePostalCode] = useState('1226');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Update (logged in users)
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initDatabase().then((status) => {
      setDbStatus(status);
    });

    AsyncStorage.getItem('@daffodil_saved_profile').then((str) => {
      if (str) {
        try {
          const parsed = JSON.parse(str);
          if (parsed.fullName) setProfileName(parsed.fullName);
          if (parsed.phone) setProfilePhone(parsed.phone);
          if (parsed.street) setProfileStreet(parsed.street);
          if (parsed.city) setProfileCity(parsed.city);
          if (parsed.postalCode) setProfilePostalCode(parsed.postalCode);
        } catch (e) {}
      } else if (user?.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name);
      }
    });
  }, [user]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) {
      Alert.alert('Google Sign-In', error.message || 'Could not authenticate with Google.');
    }
  };

  const handleQuickLogin = async () => {
    setQuickLoading(true);
    const { error } = await signInAsDemoClient('julius.sanjose08@gmail.com', 'Julius San Jose');
    setQuickLoading(false);
    if (error) {
      Alert.alert('Sign In', error.message);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await AsyncStorage.setItem(
        '@daffodil_saved_profile',
        JSON.stringify({
          fullName: profileName.trim(),
          phone: profilePhone.trim(),
          street: profileStreet.trim(),
          city: profileCity.trim(),
          postalCode: profilePostalCode.trim(),
        })
      );

      if (user) {
        await supabase.auth.updateUser({
          data: { full_name: profileName.trim() },
        });
      }

      Alert.alert(
        'Profile Saved',
        'Your contact information and delivery address have been updated for express checkout.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not save profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Missing Field', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password Length', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        Alert.alert('Update Failed', error.message);
      } else {
        setNewPassword('');
        setConfirmNewPassword('');
        setShowPasswordSection(false);
        Alert.alert('Success', 'Your password has been successfully updated.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const res = await syncDatabase();
    const updated = await getDatabaseStatus();
    setDbStatus(updated);
    setIsSyncing(false);
    Alert.alert(res.success ? 'Catalog Synced' : 'Sync Status', res.message);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* LOGGED IN: User Profile Card */}
        {user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color={Theme.colors.textPrimary} />
            </View>
            <View style={styles.userInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.userName}>
                  {profileName ||
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0]}
                </Text>
                <View style={styles.memberPill}>
                  <Text style={styles.memberPillText}>CLIENT</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          /* NOT LOGGED IN: Dedicated Sign In Card */
          <View style={styles.authPromptCard}>
            <View style={styles.authPromptHeader}>
              <View style={styles.authPromptIconWrapper}>
                <Ionicons name="flower-outline" size={26} color={Theme.colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.authPromptTitle}>Welcome to Daffodil</Text>
                <Text style={styles.authPromptSub}>
                  Sign in or register to access your order history, track flower deliveries, and manage your delivery address.
                </Text>
              </View>
            </View>

            {/* Quick 1-Tap Client Access */}
            <TouchableOpacity
              style={styles.quickAccessBtn}
              onPress={handleQuickLogin}
              disabled={quickLoading}
              activeOpacity={0.85}
            >
              {quickLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={17} color="#FFFFFF" />
                  <Text style={styles.quickAccessBtnText}>Instant Sign In as Julius San Jose</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Direct Google OAuth Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              activeOpacity={0.85}
            >
              {googleLoading ? (
                <ActivityIndicator color={Theme.colors.textPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.authDividerRow}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>OR</Text>
              <View style={styles.authDividerLine} />
            </View>

            {/* Email & Register Buttons */}
            <View style={styles.authActionRow}>
              <TouchableOpacity
                style={styles.emailSignInBtn}
                onPress={() => router.push('/(auth)/login' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="mail-outline" size={15} color="#FFFFFF" />
                <Text style={styles.emailSignInBtnText}>Sign In with Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push('/(auth)/register' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.registerBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Shortcuts */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/(tabs)/orders' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={20} color={Theme.colors.accentGold} />
            <Text style={styles.quickNavTitle}>Order History</Text>
            <Text style={styles.quickNavSub}>Live delivery tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/(tabs)/cart' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-handle-outline" size={20} color={Theme.colors.accentRose} />
            <Text style={styles.quickNavTitle}>Shopping Bag</Text>
            <Text style={styles.quickNavSub}>Saved bag items</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Details Card (Visible for logged in users to edit or pre-fill) */}
        {user && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="location-outline" size={16} color={Theme.colors.accentGold} />
              <Text style={styles.sectionTitle}>DELIVERY ADDRESS & CONTACT</Text>
            </View>
            <Text style={styles.sectionSub}>
              Saved details will auto-fill during checkout for express courier dispatch.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Maria Santos"
                placeholderTextColor={Theme.colors.textMuted}
                value={profileName}
                onChangeText={setProfileName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONTACT PHONE</Text>
              <TextInput
                style={styles.input}
                placeholder="0917 123 4567"
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="phone-pad"
                value={profilePhone}
                onChangeText={setProfilePhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>STREET ADDRESS / UNIT</Text>
              <TextInput
                style={styles.input}
                placeholder="Unit, Building, Street Name"
                placeholderTextColor={Theme.colors.textMuted}
                value={profileStreet}
                onChangeText={setProfileStreet}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.inputLabel}>CITY / REGION</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Makati City, Metro Manila"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={profileCity}
                  onChangeText={setProfileCity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>POSTAL CODE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1226"
                  placeholderTextColor={Theme.colors.textMuted}
                  keyboardType="numeric"
                  value={profilePostalCode}
                  onChangeText={setProfilePostalCode}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveProfile}
              disabled={isSavingProfile}
              activeOpacity={0.85}
            >
              {isSavingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveProfileBtnText}>Save Delivery Address</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Change Password Card (Only if user is logged in) */}
        {user && (
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
              activeOpacity={0.8}
            >
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Theme.colors.accentRose} />
                <Text style={styles.sectionTitle}>CHANGE ACCOUNT PASSWORD</Text>
              </View>
              <Ionicons
                name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {showPasswordSection && (
              <View style={{ marginTop: 14 }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Theme.colors.textMuted}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat new password"
                    placeholderTextColor={Theme.colors.textMuted}
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.updatePasswordBtn}
                  onPress={handleChangePassword}
                  disabled={isUpdatingPassword}
                  activeOpacity={0.85}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.updatePasswordBtnText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Floral Catalog Status */}
        <View style={styles.sectionCard}>
          <View style={styles.dbHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles-outline" size={15} color={Theme.colors.accentGold} />
              <Text style={styles.sectionTitle}>FLORAL ATELIER CATALOG</Text>
            </View>
            <View style={styles.dbStatusPill}>
              <View
                style={[
                  styles.dbStatusDot,
                  {
                    backgroundColor: dbStatus?.isCloudConnected
                      ? Theme.colors.success
                      : Theme.colors.warning,
                  },
                ]}
              />
              <Text style={styles.dbStatusText}>
                {dbStatus?.isCloudConnected ? 'Cloud Synced' : 'Offline Ready'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Curated Arrangements</Text>
            <Text style={styles.infoVal}>{dbStatus?.productCount || 0} bouquets in catalog</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Mode</Text>
            <Text style={styles.infoVal}>Client Boutique (Android APK)</Text>
          </View>

          <View style={styles.divider} />

          {/* Sync Button */}
          <TouchableOpacity
            style={styles.syncBtn}
            onPress={handleSync}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.syncBtnText}>Refresh Catalog & Offers</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Wishlist Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SAVED FLORALS ({wishlist.length})</Text>

          {wishlist.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.wishlistScroll}
            >
              {wishlist.map((item) => (
                <View key={item.id} style={styles.wishlistCard}>
                  <Image source={{ uri: item.images[0] }} style={styles.wishlistImage} />
                  <Text style={styles.wishlistTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.wishlistPrice}>₱{item.price.toLocaleString()}</Text>

                  <View style={styles.wishlistBtnRow}>
                    <TouchableOpacity
                      style={styles.wishlistAddBtn}
                      onPress={() => addToCart(item, 1)}
                    >
                      <Text style={styles.wishlistAddBtnText}>Add to Bag</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.wishlistRemoveBtn}
                      onPress={() => toggleWishlist(item)}
                    >
                      <Ionicons name="close" size={14} color={Theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyWishlistText}>
              Your saved floral arrangements will appear here.
            </Text>
          )}
        </View>

        {/* Atelier & Concierge Contacts */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ATELIER & CONCIERGE</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client Hotline</Text>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+639178924410')}>
              <Text style={[styles.infoVal, { color: Theme.colors.accentGold }]}>+63 917 892 4410</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Concierge Inquiries</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:concierge@daffodilflowershop.me')}>
              <Text style={[styles.infoVal, { color: Theme.colors.accentGold }]}>concierge@daffodilflowershop.me</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Studio Location</Text>
            <Text style={styles.infoVal}>Makati City, Metro Manila</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Boutique Hours</Text>
            <Text style={styles.infoVal}>Mon – Sun • 7:00 AM – 9:00 PM</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Courier Coverage</Text>
            <Text style={styles.infoVal}>Metro Manila Same-Day Express</Text>
          </View>
        </View>

        {/* Sign Out Button (if logged in) */}
        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out from Atelier</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: 18,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  memberPill: {
    backgroundColor: Theme.colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  memberPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: Theme.colors.accentGold,
    letterSpacing: 0.8,
  },
  userEmail: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  authPromptCard: {
    backgroundColor: Theme.colors.surface,
    padding: 18,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 14,
  },
  authPromptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  authPromptIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  authPromptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  authPromptSub: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  quickAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: '#7C3AED',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAccessBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    gap: 10,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  authDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  authDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  authDividerText: {
    paddingHorizontal: 12,
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  authActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emailSignInBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    height: 42,
    borderRadius: Theme.borderRadius.sm,
    gap: 6,
  },
  emailSignInBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  registerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 42,
    borderRadius: Theme.borderRadius.sm,
  },
  registerBtnText: {
    color: Theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickNavCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: 14,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickNavTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 8,
  },
  quickNavSub: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Theme.colors.textSecondary,
  },
  sectionSub: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Theme.colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  saveProfileBtn: {
    backgroundColor: Theme.colors.primary,
    height: 42,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatePasswordBtn: {
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 40,
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  updatePasswordBtnText: {
    color: Theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  dbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dbStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dbStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dbStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  syncBtn: {
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 9,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  wishlistScroll: {
    paddingTop: 12,
    gap: 12,
  },
  wishlistCard: {
    width: 130,
    backgroundColor: Theme.colors.surfaceSubtle,
    borderRadius: Theme.borderRadius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  wishlistImage: {
    width: '100%',
    height: 110,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.border,
    marginBottom: 6,
  },
  wishlistTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  wishlistPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  wishlistBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wishlistAddBtn: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
  },
  wishlistAddBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistRemoveBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyWishlistText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider,
    marginVertical: 10,
  },
  signOutButton: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.accentRose,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  signOutText: {
    color: Theme.colors.accentRose,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
