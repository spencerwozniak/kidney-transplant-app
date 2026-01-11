import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { combineClasses } from '../styles/theme';

type Tab = 'pathway' | 'settings';

type BottomTabBarProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <View className="border-t border-gray-200 bg-white">
      <View className="flex-row items-center justify-around py-2">
        {/* Pathway Tab */}
        <TouchableOpacity
          onPress={() => onTabChange('pathway')}
          activeOpacity={0.7}
          className="flex-1 items-center py-3">
          <Text className="mb-1 text-2xl">🛤️</Text>
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'pathway' ? 'text-green-600' : 'text-gray-500'
            }`}>
            Pathway
          </Text>
          {activeTab === 'pathway' && (
            <View className="mt-1 h-0.5 w-8 rounded-full bg-green-600" />
          )}
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          onPress={() => onTabChange('settings')}
          activeOpacity={0.7}
          className="flex-1 items-center py-3">
          <Text className="mb-1 text-2xl">⚙️</Text>
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'settings' ? 'text-green-600' : 'text-gray-500'
            }`}>
            Settings
          </Text>
          {activeTab === 'settings' && (
            <View className="mt-1 h-0.5 w-8 rounded-full bg-green-600" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

