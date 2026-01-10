import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  buttons,
  cards,
  typography,
  progress as progressStyles,
  combineClasses,
  layout,
} from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';

type ResultsDetailScreenProps = {
  results: {
    hasAbsolute: boolean;
    hasRelative: boolean;
    absoluteContraindications: Array<{ id: string; question: string }>;
    relativeContraindications: Array<{ id: string; question: string }>;
  };
  onNavigateToHome?: () => void;
};

export const ResultsDetailScreen = ({ results, onNavigateToHome }: ResultsDetailScreenProps) => {
  return (
    <View className={layout.container.default}>
      <NavigationBar onBack={onNavigateToHome} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>Assessment Results</Text>
            <View className={progressStyles.indicator} />
          </View>

          {/* Important Disclaimer */}
          <View className={combineClasses(cards.colored.amber, 'mb-6')}>
            <Text className="mb-2 text-sm font-bold text-amber-900">Important Disclaimer</Text>
            <Text className="text-sm leading-5 text-amber-800">
              This is an educational tool only. It is not a substitute for professional medical
              evaluation. Please discuss your results with your healthcare team to determine if
              transplant evaluation is appropriate for you.
            </Text>
          </View>

          {/* Absolute Contraindications */}
          {results.hasAbsolute ? (
            <View className={combineClasses(cards.colored.red, 'mb-6')}>
              <Text className="mb-3 text-lg font-bold text-red-900">
                Absolute Contraindications Identified
              </Text>
              <Text className="mb-3 text-sm leading-5 text-red-800">
                Based on your responses, you indicated the following conditions that are considered
                absolute contraindications:
              </Text>
              {results.absoluteContraindications.map((q) => (
                <View key={q.id} className={cards.result.container}>
                  <Text className="text-sm font-semibold text-red-900">{q.question}</Text>
                </View>
              ))}
              <Text className="mt-3 text-sm font-semibold leading-5 text-red-900">
                Recommendation: Please discuss these conditions with your care team. Patients with
                these conditions should not be referred for transplant evaluation at this time.
              </Text>
            </View>
          ) : (
            <View className={combineClasses(cards.colored.green, 'mb-6')}>
              <Text className="mb-2 text-lg font-bold text-green-900">
                ✓ No Absolute Contraindications
              </Text>
              <Text className="text-sm leading-5 text-green-800">
                Based on your responses, you did not indicate any absolute contraindications for
                kidney transplant evaluation.
              </Text>
            </View>
          )}

          {/* Relative Contraindications */}
          {results.hasRelative ? (
            <View className={combineClasses(cards.colored.yellow, 'mb-6')}>
              <Text className="mb-3 text-lg font-bold text-yellow-900">
                Relative Contraindications Identified
              </Text>
              <Text className="mb-3 text-sm leading-5 text-yellow-800">
                You indicated the following factors that may need to be addressed before evaluation:
              </Text>
              {results.relativeContraindications.map((q) => (
                <View key={q.id} className={cards.result.container}>
                  <Text className="text-sm font-semibold text-yellow-900">{q.question}</Text>
                </View>
              ))}
              <Text className="mt-3 text-sm font-semibold leading-5 text-yellow-900">
                Recommendation: These factors can often be addressed with appropriate treatment and
                support. Discuss these with your care team to develop a plan before transplant
                evaluation.
              </Text>
            </View>
          ) : (
            <View className={combineClasses(cards.colored.green, 'mb-6')}>
              <Text className="mb-2 text-lg font-bold text-green-900">
                ✓ No Relative Contraindications
              </Text>
              <Text className="text-sm leading-5 text-green-800">
                You did not indicate any relative contraindications that need to be addressed.
              </Text>
            </View>
          )}

          {/* Age Information */}
          <View className={combineClasses(cards.colored.blue, 'mb-6')}>
            <Text className="mb-2 text-lg font-bold text-blue-900">About Age</Text>
            <Text className="text-sm leading-5 text-blue-800">
              There is no absolute age limit for kidney transplantation. Advanced age alone is not a
              contraindication. Patients over 70 can and do receive successful transplants with
              significant survival benefit. Your care team will evaluate your overall health and
              fitness, not just your age.
            </Text>
          </View>

          {/* Next Steps */}
          <View className={combineClasses(cards.default.container, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-3')}>Next Steps</Text>
            <Text className={combineClasses(typography.body.small, 'mb-2')}>
              1. Review these results with your nephrologist or primary care physician
            </Text>
            <Text className={combineClasses(typography.body.small, 'mb-2')}>
              2. Discuss whether transplant evaluation referral is appropriate for you
            </Text>
            <Text className={combineClasses(typography.body.small, 'mb-2')}>
              3. If you have relative contraindications, work with your care team to address them
            </Text>
            <Text className={typography.body.small}>
              4. Remember: This assessment is educational only. Your medical team will make the
              final determination about transplant candidacy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

