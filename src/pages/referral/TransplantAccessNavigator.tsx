import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  buttons,
  typography,
  cards,
  combineClasses,
  layout,
} from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import {
  apiService,
  TransplantCenter,
  PatientReferralState,
  ReferralPathway,
} from '../../services/api';

type TransplantAccessNavigatorProps = {
  onNavigateBack: () => void;
};

type Screen = 'centers' | 'pathway' | 'next-steps';

export const TransplantAccessNavigator = ({ onNavigateBack }: TransplantAccessNavigatorProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('centers');
  const [centers, setCenters] = useState<TransplantCenter[]>([]);
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [referralPathway, setReferralPathway] = useState<ReferralPathway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<TransplantCenter | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load referral state
      const state = await apiService.getReferralState();
      setReferralState(state);
      setZipCode(state.location?.zip || '');
      setState(state.location?.state || '');

      // Load referral pathway
      const pathway = await apiService.getReferralPathway();
      setReferralPathway(pathway);

      // Load nearby centers if we have location
      if (state.location?.state) {
        await loadCenters(state.location.state, state.location.zip);
      }
    } catch (error: any) {
      console.error('Error loading navigator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCenters = async (stateCode?: string, zip?: string) => {
    try {
      const nearbyCenters = await apiService.findNearbyCenters({
        state: stateCode || state,
        zip_code: zip || zipCode,
      });
      setCenters(nearbyCenters);
    } catch (error: any) {
      console.error('Error loading centers:', error);
    }
  };

  const handleFindCenters = () => {
    if (state || zipCode) {
      loadCenters(state, zipCode);
      // Update referral state with location
      if (referralState) {
        apiService.updateReferralState({
          ...referralState,
          location: {
            ...referralState.location,
            zip: zipCode || referralState.location?.zip,
            state: state || referralState.location?.state,
          },
        });
      }
    }
  };

  const handleSelectCenter = (center: TransplantCenter) => {
    setSelectedCenter(center);
    setCurrentScreen('pathway');
  };

  if (isLoading) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className={combineClasses(typography.body.medium, 'mt-4 text-gray-600')}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        {currentScreen === 'centers' && (
          <CentersScreen
            centers={centers}
            zipCode={zipCode}
            state={state}
            onZipCodeChange={setZipCode}
            onStateChange={setState}
            onFindCenters={handleFindCenters}
            onSelectCenter={handleSelectCenter}
            onViewPathway={() => setCurrentScreen('pathway')}
          />
        )}

        {currentScreen === 'pathway' && referralPathway && (
          <PathwayScreen
            pathway={referralPathway}
            selectedCenter={selectedCenter}
            referralState={referralState}
            onBack={() => setCurrentScreen('centers')}
            onNextSteps={() => setCurrentScreen('next-steps')}
            onUpdateReferralState={async (updates) => {
              if (referralState) {
                const updated = await apiService.updateReferralState({
                  ...referralState,
                  ...updates,
                });
                setReferralState(updated);
              }
            }}
          />
        )}

        {currentScreen === 'next-steps' && referralPathway && (
          <NextStepsScreen
            pathway={referralPathway}
            selectedCenter={selectedCenter}
            referralState={referralState}
            onBack={() => setCurrentScreen('pathway')}
            onUpdateReferralState={async (updates) => {
              if (referralState) {
                const updated = await apiService.updateReferralState({
                  ...referralState,
                  ...updates,
                });
                setReferralState(updated);
                // Reload pathway data to reflect changes
                await loadInitialData();
              }
            }}
            onNavigateBack={onNavigateBack}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Centers Screen Component
type CentersScreenProps = {
  centers: TransplantCenter[];
  zipCode: string;
  state: string;
  onZipCodeChange: (zip: string) => void;
  onStateChange: (state: string) => void;
  onFindCenters: () => void;
  onSelectCenter: (center: TransplantCenter) => void;
  onViewPathway: () => void;
};

const CentersScreen = ({
  centers,
  zipCode,
  state,
  onZipCodeChange,
  onStateChange,
  onFindCenters,
  onSelectCenter,
  onViewPathway,
}: CentersScreenProps) => {
  return (
    <View className="px-6 py-8">
      <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>
        Transplant Access Navigator
      </Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-gray-600')}>
        Find transplant centers near you and learn how to get a referral
      </Text>

      {/* Location Input */}
      <View className="mb-6">
        <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
          Your Location
        </Text>
        <View className="mb-3 flex-row gap-3">
          <View className="flex-1">
            <TextInput
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
              placeholder="ZIP Code"
              value={zipCode}
              onChangeText={onZipCodeChange}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <TextInput
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
              placeholder="State (e.g., CA)"
              value={state}
              onChangeText={onStateChange}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>
        <TouchableOpacity
          className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
          onPress={onFindCenters}
          activeOpacity={0.8}>
          <Text className={buttons.primary.text}>Find Centers</Text>
        </TouchableOpacity>
      </View>

      {/* Centers List */}
      {centers.length > 0 && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>
            Centers Near You
          </Text>
          {centers.map((center) => (
            <TouchableOpacity
              key={center.center_id}
              className={combineClasses(cards.default.container, 'mb-4')}
              onPress={() => onSelectCenter(center)}
              activeOpacity={0.7}>
              <View className="mb-2 flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className={combineClasses(typography.h6, 'mb-1')}>{center.name}</Text>
                  <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
                    {center.location.city}, {center.location.state}
                    {center.distance_miles && ` • ${center.distance_miles} miles away`}
                  </Text>
                </View>
              </View>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {center.referral_required && (
                  <View className="rounded-full bg-blue-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-blue-700">Referral Required</Text>
                  </View>
                )}
                {center.insurance_compatible && (
                  <View className="rounded-full bg-green-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-green-700">
                      Insurance Compatible
                    </Text>
                  </View>
                )}
              </View>
              <Text className="mt-2 text-xs text-gray-500">Tap to view referral pathway →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* View Pathway Button */}
      <TouchableOpacity
        className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
        onPress={onViewPathway}
        activeOpacity={0.8}>
        <Text className={buttons.outline.text}>View Your Referral Pathway</Text>
      </TouchableOpacity>
    </View>
  );
};

// Pathway Screen Component
type PathwayScreenProps = {
  pathway: ReferralPathway;
  selectedCenter: TransplantCenter | null;
  referralState: PatientReferralState | null;
  onBack: () => void;
  onNextSteps: () => void;
  onUpdateReferralState: (updates: Partial<PatientReferralState>) => Promise<void>;
};

const PathwayScreen = ({
  pathway,
  selectedCenter,
  referralState,
  onBack,
  onNextSteps,
  onUpdateReferralState,
}: PathwayScreenProps) => {
  const [nephrologistName, setNephrologistName] = useState(
    referralState?.last_nephrologist?.name || ''
  );
  const [nephrologistClinic, setNephrologistClinic] = useState(
    referralState?.last_nephrologist?.clinic || ''
  );
  const [dialysisCenterName, setDialysisCenterName] = useState(
    referralState?.dialysis_center?.name || ''
  );

  const handleSaveProviderInfo = async () => {
    await onUpdateReferralState({
      last_nephrologist:
        nephrologistName || nephrologistClinic
          ? {
              name: nephrologistName || null,
              clinic: nephrologistClinic || null,
            }
          : null,
      dialysis_center: dialysisCenterName
        ? {
            name: dialysisCenterName,
            social_worker_contact: null,
          }
        : null,
    });
  };

  return (
    <View className="px-6 py-8">
      <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>
        Your Referral Pathway
      </Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-gray-600')}>
        {pathway.guidance.title}
      </Text>

      {selectedCenter && (
        <View className={combineClasses(cards.colored.blue, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-blue-900')}>
            Selected Center
          </Text>
          <Text className={combineClasses(typography.body.medium, 'text-blue-800')}>
            {selectedCenter.name}
          </Text>
          <Text className={combineClasses(typography.body.small, 'mt-1 text-blue-700')}>
            {selectedCenter.contact.referral_phone}
          </Text>
        </View>
      )}

      {pathway.pathway === 'nephrologist_referral' && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>
            Provider Information
          </Text>
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Nephrologist Name
            </Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
              placeholder="Dr. Smith"
              value={nephrologistName}
              onChangeText={setNephrologistName}
            />
          </View>
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Clinic/Office Name
            </Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
              placeholder="Kidney Care Clinic"
              value={nephrologistClinic}
              onChangeText={setNephrologistClinic}
            />
          </View>
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={handleSaveProviderInfo}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Save Provider Info</Text>
          </TouchableOpacity>
        </View>
      )}

      {pathway.pathway === 'dialysis_center_referral' && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>
            Dialysis Center Information
          </Text>
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Dialysis Center Name
            </Text>
            <TextInput
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
              placeholder="Dialysis Center Name"
              value={dialysisCenterName}
              onChangeText={setDialysisCenterName}
            />
          </View>
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={handleSaveProviderInfo}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Save Dialysis Center Info</Text>
          </TouchableOpacity>
        </View>
      )}

      {pathway.guidance.steps && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>Next Steps</Text>
          {pathway.guidance.steps.map((step, index) => (
            <View key={index} className="mb-3 flex-row">
              <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Text className="text-sm font-semibold text-green-700">{index + 1}</Text>
              </View>
              <Text className={combineClasses(typography.body.medium, 'flex-1')}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {pathway.guidance.script && (
        <View className={combineClasses(cards.colored.green, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-green-900')}>
            What to Say
          </Text>
          <Text className={combineClasses(typography.body.medium, 'leading-6 text-green-800')}>
            "{pathway.guidance.script}"
          </Text>
        </View>
      )}

      {pathway.guidance.what_to_send && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>What to Send</Text>
          {pathway.guidance.what_to_send.map((item, index) => (
            <View key={index} className="mb-2 flex-row">
              <Text className="mr-2 text-green-600">✓</Text>
              <Text className={combineClasses(typography.body.medium, 'flex-1')}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {pathway.guidance.paths && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>
            Available Pathways
          </Text>
          {pathway.guidance.paths.map((path, index) => (
            <View key={index} className={combineClasses(cards.default.container, 'mb-4')}>
              <Text className={combineClasses(typography.h6, 'mb-2')}>{path.name}</Text>
              <Text className={combineClasses(typography.body.small, 'mb-3 text-gray-600')}>
                {path.description}
              </Text>
              <Text className={combineClasses(typography.body.small, 'font-semibold text-green-700')}>
                {path.action}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
        onPress={onNextSteps}
        activeOpacity={0.8}>
        <Text className={buttons.primary.text}>View Detailed Next Steps</Text>
      </TouchableOpacity>
    </View>
  );
};

// Next Steps Screen Component
type NextStepsScreenProps = {
  pathway: ReferralPathway;
  selectedCenter: TransplantCenter | null;
  referralState: PatientReferralState | null;
  onBack: () => void;
  onUpdateReferralState: (updates: Partial<PatientReferralState>) => Promise<void>;
  onNavigateBack: () => void;
};

const NextStepsScreen = ({
  pathway,
  selectedCenter,
  referralState,
  onBack,
  onUpdateReferralState,
  onNavigateBack,
}: NextStepsScreenProps) => {
  const [isMarkingReferral, setIsMarkingReferral] = useState(false);
  const hasReferral = referralState?.has_referral === true;

  const handleMarkReferralReceived = async () => {
    setIsMarkingReferral(true);
    try {
      await onUpdateReferralState({
        has_referral: true,
        referral_status: 'completed',
      });
      // Show success message and navigate back after a moment
      setTimeout(() => {
        onNavigateBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating referral status:', error);
      alert('Failed to update referral status. Please try again.');
    } finally {
      setIsMarkingReferral(false);
    }
  };
  return (
    <View className="px-6 py-8">
      <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>What to Do Next</Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-gray-600')}>
        Clear, actionable steps to secure your referral
      </Text>

      {selectedCenter && (
        <View className={combineClasses(cards.colored.blue, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-blue-900')}>
            Contact Information
          </Text>
          <Text className={combineClasses(typography.body.medium, 'mb-1 text-blue-800')}>
            {selectedCenter.name}
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-blue-700')}>
            Referral Phone: {selectedCenter.contact.referral_phone}
          </Text>
          {selectedCenter.contact.referral_fax && (
            <Text className={combineClasses(typography.body.small, 'text-blue-700')}>
              Fax: {selectedCenter.contact.referral_fax}
            </Text>
          )}
          {selectedCenter.contact.website && (
            <Text className={combineClasses(typography.body.small, 'text-blue-700 mt-1')}>
              Website: {selectedCenter.contact.website}
            </Text>
          )}
        </View>
      )}

      {pathway.guidance.steps && (
        <View className="mb-6">
          {pathway.guidance.steps.map((step, index) => (
            <View key={index} className={combineClasses(cards.default.container, 'mb-4')}>
              <View className="mb-2 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Text className="text-base font-semibold text-green-700">{index + 1}</Text>
                </View>
                <Text className={combineClasses(typography.h6, 'flex-1')}>Step {index + 1}</Text>
              </View>
              <Text className={combineClasses(typography.body.medium, 'leading-6 text-gray-700')}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      )}

      {pathway.guidance.script && (
        <View className={combineClasses(cards.colored.green, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-3 text-green-900')}>
            Script to Use
          </Text>
          <Text className={combineClasses(typography.body.large, 'leading-7 text-green-800')}>
            "{pathway.guidance.script}"
          </Text>
          <Text className={combineClasses(typography.body.small, 'mt-3 text-green-700')}>
            You can copy this and use it when speaking with your provider
          </Text>
        </View>
      )}

      <View className={combineClasses(cards.colored.amber, 'mb-6')}>
        <Text className={combineClasses(typography.h6, 'mb-2 text-amber-900')}>
          Important Reminder
        </Text>
        <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
          This tool helps you navigate the referral process. It does not guarantee acceptance or
          predict outcomes. Your care team will make the final decisions about your transplant
          evaluation.
        </Text>
      </View>

      {/* Mark Referral Received Button */}
      {!hasReferral && (
        <View className="mb-6">
          <View className={combineClasses(cards.colored.green, 'mb-4')}>
            <Text className={combineClasses(typography.h6, 'mb-2 text-green-900')}>
              Received Your Referral?
            </Text>
            <Text className={combineClasses(typography.body.small, 'mb-4 leading-6 text-green-800')}>
              Once you've received confirmation that your referral has been sent to the transplant
              center, mark it here to move to the next stage of your transplant journey.
            </Text>
          </View>
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={handleMarkReferralReceived}
            disabled={isMarkingReferral}
            activeOpacity={0.8}>
            {isMarkingReferral ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" className="mr-2" />
                <Text className={buttons.primary.text}>Updating...</Text>
              </View>
            ) : (
              <Text className={buttons.primary.text}>I Have Received My Referral</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {hasReferral && (
        <View className={combineClasses(cards.colored.green, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-green-900')}>
            ✓ Referral Received
          </Text>
          <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
            Great! Your referral has been marked as received. You can now proceed to the evaluation
            stage. Check your pathway to see the next steps.
          </Text>
        </View>
      )}
    </View>
  );
};

