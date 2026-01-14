/**
 * Referral Received Button Component
 *
 * Displays button to mark referral as received, or confirmation message if already received
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../../styles/theme';

type ReferralReceivedButtonProps = {
  hasReferral: boolean;
  isMarkingReferral?: boolean;
  onMarkReferralReceived: () => void;
};

export const ReferralReceivedButton = ({
  hasReferral,
  isMarkingReferral = false,
  onMarkReferralReceived,
}: ReferralReceivedButtonProps) => {
  if (!hasReferral) {
    return (
      <View className="mb-6">
        <View
          className={combineClasses(
            cards.default.container,
            'mb-4 border-l-4 border-green-500 bg-white/95'
          )}>
          <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
            Received Your Referral?
          </Text>
          <Text className={combineClasses(typography.body.small, 'mb-4 leading-6 text-green-800')}>
            Once you've received confirmation that your referral has been sent to the transplant
            center, mark it here to move to the next stage of your transplant journey.
          </Text>
        </View>
        <TouchableOpacity
          className="rounded-full bg-white px-6 py-4 active:opacity-90"
          onPress={onMarkReferralReceived}
          disabled={isMarkingReferral}
          activeOpacity={0.8}>
          {isMarkingReferral ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#1f2937" className="mr-2" />
              <Text className="font-nunito-semibold text-center text-xl text-gray-800">
                Updating...
              </Text>
            </View>
          ) : (
            <Text className="font-nunito-semibold text-center text-xl text-gray-800">
              I Have Received My Referral
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className={combineClasses(
        cards.default.container,
        'mb-6 border-l-4 border-green-500 bg-white/95'
      )}>
      <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
        ✓ Referral Received
      </Text>
      <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
        Great! Your referral has been marked as received. You can now proceed to the evaluation
        stage. Check your pathway to see the next steps.
      </Text>
    </View>
  );
};
