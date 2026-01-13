import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WheelPicker } from './WheelPicker';

type WheelDatePickerProps = {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  maximumDate?: Date;
  style?: any;
};

export const WheelDatePicker = ({ value, onChange, maximumDate, style }: WheelDatePickerProps) => {
  const [month, setMonth] = useState(value.getMonth() + 1);
  const [day, setDay] = useState(value.getDate());
  const [year, setYear] = useState(value.getFullYear());

  // Generate options
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
    value: i + 1,
  }));

  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = maximumDate ? maximumDate.getFullYear() : currentYear;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    label: (maxYear - i).toString(),
    value: maxYear - i,
  }));

  // Get days in month
  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1,
  }));

  // Update date when month, day, or year changes
  useEffect(() => {
    const daysInNewMonth = getDaysInMonth(month, year);
    let newDay = day;
    
    // Adjust day if it exceeds days in month
    if (day > daysInNewMonth) {
      newDay = daysInNewMonth;
      setDay(newDay);
      return; // Exit early, will re-run with new day value
    }

    const newDate = new Date(year, month - 1, newDay);
    
    // Check if date exceeds maximumDate
    if (maximumDate && newDate > maximumDate) {
      const maxDate = new Date(maximumDate);
      if (year !== maxDate.getFullYear()) setYear(maxDate.getFullYear());
      if (month !== maxDate.getMonth() + 1) setMonth(maxDate.getMonth() + 1);
      if (day !== maxDate.getDate()) setDay(maxDate.getDate());
      return;
    }

    // Only call onChange if date actually changed
    const currentDate = new Date(value);
    if (
      currentDate.getFullYear() !== year ||
      currentDate.getMonth() !== month - 1 ||
      currentDate.getDate() !== newDay
    ) {
      onChange({ type: 'set' }, newDate);
    }
  }, [month, day, year]);

  // Update local state when value prop changes (from external source)
  useEffect(() => {
    if (value) {
      const newMonth = value.getMonth() + 1;
      const newDay = value.getDate();
      const newYear = value.getFullYear();
      
      // Only update if different to prevent loops
      if (newMonth !== month) setMonth(newMonth);
      if (newDay !== day) setDay(newDay);
      if (newYear !== year) setYear(newYear);
    }
  }, [value.getTime()]); // Use getTime() to compare dates properly

  return (
    <View style={[styles.container, style]}>
      <View style={styles.column}>
        <WheelPicker
          items={months}
          selectedValue={month}
          onValueChange={(val) => setMonth(Number(val))}
          style={styles.picker}
        />
      </View>
      <View style={styles.column}>
        <WheelPicker
          items={days}
          selectedValue={day}
          onValueChange={(val) => setDay(Number(val))}
          style={styles.picker}
        />
      </View>
      <View style={styles.column}>
        <WheelPicker
          items={years}
          selectedValue={year}
          onValueChange={(val) => setYear(Number(val))}
          style={styles.picker}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 280,
    ...(Platform.OS === 'web' && {
      justifyContent: 'space-around',
      alignItems: 'center',
    }),
  },
  column: {
    flex: 1,
    height: '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: '33.33%',
    }),
  },
  picker: {
    width: '100%',
    height: '100%',
  },
});

