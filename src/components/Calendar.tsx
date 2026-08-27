import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { typography } from '../constants/typography';

const { width } = Dimensions.get('window');

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
  rangeStartDate?: Date;
  rangeEndDate?: Date;
}

function stripTime(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isSameDay(a: Date, b: Date): boolean {
  return stripTime(a) === stripTime(b);
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  maxDate = new Date(),
  minDate = new Date(2020, 0, 1),
  rangeStartDate,
  rangeEndDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);

    if (newMonth >= minDate) {
      setCurrentMonth(newMonth);
      setCurrentYear(newMonth.getFullYear());
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);

    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
      setCurrentYear(newMonth.getFullYear());
    }
  };

  const isDateSelectable = (date: Date) => date >= minDate && date <= maxDate;

  const isDateSelected = (date: Date) => isSameDay(date, selectedDate);

  const isToday = (date: Date) => isSameDay(date, new Date());

  const isRangeStart = (date: Date) =>
    rangeStartDate ? isSameDay(date, rangeStartDate) : false;

  const isRangeEnd = (date: Date) =>
    rangeEndDate ? isSameDay(date, rangeEndDate) : false;

  const isInStreakRange = (date: Date) => {
    if (!rangeStartDate || !rangeEndDate) return false;
    const value = stripTime(date);
    const start = stripTime(rangeStartDate);
    const end = stripTime(rangeEndDate);
    return value >= start && value <= end;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.monthNavigation}>
        <Text style={styles.monthYearText}>
          {monthNames[currentMonth.getMonth()]} {currentYear}
        </Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              !isDateSelectable(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)) &&
                styles.navButtonDisabled,
            ]}
            onPress={goToPreviousMonth}
            disabled={
              !isDateSelectable(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
            }
          >
            <Ionicons name="chevron-back" size={16} color={COLORS.primaryText} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              !isDateSelectable(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)) &&
                styles.navButtonDisabled,
            ]}
            onPress={goToNextMonth}
            disabled={
              !isDateSelectable(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
            }
          >
            <Ionicons name="chevron-forward" size={16} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      {rangeStartDate && rangeEndDate ? (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendStart]} />
            <Text style={styles.legendText}>Start</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendRange]} />
            <Text style={styles.legendText}>Streak</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendEnd]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.dayHeaders}>
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
          <Text key={day} style={styles.dayHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => (
          <View key={index} style={styles.dayCell}>
            {date ? (
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isInStreakRange(date) && !isRangeStart(date) && !isRangeEnd(date) && styles.inRangeDayButton,
                  isRangeStart(date) && styles.rangeStartButton,
                  isRangeEnd(date) && styles.rangeEndButton,
                  isDateSelected(date) && !isRangeStart(date) && styles.selectedDayButton,
                  isToday(date) && !isDateSelected(date) && !isRangeEnd(date) && styles.todayButton,
                  !isDateSelectable(date) && styles.disabledDayButton,
                ]}
                onPress={() => isDateSelectable(date) && onDateSelect(date)}
                disabled={!isDateSelectable(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    isInStreakRange(date) && styles.inRangeDayText,
                    isRangeStart(date) && styles.rangeStartText,
                    isRangeEnd(date) && styles.rangeEndText,
                    isDateSelected(date) && styles.selectedDayText,
                    isToday(date) && !isDateSelected(date) && !isRangeEnd(date) && styles.todayText,
                    !isDateSelectable(date) && styles.disabledDayText,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyCell} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  monthYearText: {
    ...typography.h3,
    color: COLORS.primaryText,
    fontWeight: '600',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendStart: {
    backgroundColor: '#C1FF72',
  },
  legendRange: {
    backgroundColor: 'rgba(193, 255, 114, 0.35)',
  },
  legendEnd: {
    backgroundColor: '#FFFFFF',
  },
  legendText: {
    ...typography.caption,
    color: COLORS.secondaryText,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  dayHeaderText: {
    ...typography.caption,
    color: COLORS.secondaryText,
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
  },
  dayCell: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  inRangeDayButton: {
    backgroundColor: 'rgba(193, 255, 114, 0.18)',
    borderRadius: 8,
    width: 34,
    height: 32,
  },
  rangeStartButton: {
    backgroundColor: 'rgba(193, 255, 114, 0.25)',
    borderWidth: 2,
    borderColor: '#C1FF72',
    ...SHADOWS.card,
  },
  rangeEndButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  selectedDayButton: {
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
  todayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledDayButton: {
    opacity: 0.3,
  },
  dayText: {
    ...typography.body,
    color: COLORS.primaryText,
    fontWeight: '500',
  },
  inRangeDayText: {
    color: '#D9F99D',
  },
  rangeStartText: {
    color: '#C1FF72',
    fontWeight: '800',
  },
  rangeEndText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  todayText: {
    color: COLORS.primaryText,
    fontWeight: '600',
  },
  disabledDayText: {
    color: COLORS.secondaryText,
  },
  emptyCell: {
    width: 32,
    height: 32,
  },
});

export default Calendar;
