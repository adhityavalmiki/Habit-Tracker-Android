import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {Circle, Defs, Stop, LinearGradient as SvgLinearGradient} from 'react-native-svg';
import { Alert } from 'react-native';
import { Modal, Pressable } from 'react-native';







const today = new Date().toISOString().slice(0, 10);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const Tab = createBottomTabNavigator();



/* ---------- SCREENS ---------- */

function Screen({ title }) {
  return (
    <LinearGradient colors={['#020617', '#020617']} style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
    </LinearGradient>
  );
}

function getStreak(log) {
  let streak = 0;
  let date = new Date();

  while (true) {
    const d = date.toISOString().slice(0, 10);
    if (log[d]) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLastNDays(n) {
  const days = [];
  const d = new Date();

  for (let i = 0; i < n; i++) {
    days.unshift(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return days;
}





function HomeScreen({ habits = [], toggleHabit, deleteHabit, setHabits}) {

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  const [menuHabit, setMenuHabit] = useState(null);
  const [renamingHabit, setRenamingHabit] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');



    const openHabitMenu = (habit) => {
  setSelectedHabit(habit);
  setMenuVisible(true);
};


  const renameHabit = () => {
  if (!renameText.trim()) return;

  setHabits(prev =>
    prev.map(h =>
      h.id === renamingHabit.id
        ? { ...h, name: renameText }
        : h
    )
  );

  setRenamingHabit(null);
  setRenameText('');
};



  const total = habits.length;
  const doneToday = habits.filter(h => h.log?.[today]).length;
  const progress = total === 0 ? 0 : doneToday / total;

  const circumference = 2 * Math.PI * 55;
  const animatedProgress = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <LinearGradient colors={['#020617', '#020617']} style={styles.screen}>
      <Text style={styles.title}>Habit Tracker</Text>

      {/* 🔵 ANIMATED RING */}
      <View style={styles.ringContainer}>
        <Svg width={140} height={140}>
          <Defs>
            <SvgLinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#7dd3fc" />
              <Stop offset="100%" stopColor="#c084fc" />
            </SvgLinearGradient>
          </Defs>


          <Circle
            cx="70"
            cy="70"
            r="55"
            stroke="#1e293b"
            strokeWidth="12"
            fill="none"
          />

          <AnimatedCircle
            cx="70"
            cy="70"
            r="55"
            stroke="url(#ringGrad)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="70,70"
          />
        </Svg>

        <Text style={styles.ringText}>
          {Math.round(progress * 100)}%
        </Text>

        <Text style={styles.ringSub}>
          {doneToday} / {total} habits
        </Text>
      </View>

      {habits.length === 0 && (
        <Text style={styles.empty}>No habits yet</Text>
      )}

      {habits.map(habit => (
        <TouchableOpacity
  key={habit.id}
  activeOpacity={0.85}
  onPress={() => toggleHabit(habit.id)}
  onLongPress={() => openHabitMenu(habit)}
  delayLongPress={400}
>
  {renamingHabit && (
  <View style={styles.renameOverlay}>
    <View style={styles.renameBox}>
      <Text style={styles.renameTitle}>Rename Habit</Text>

      <TextInput
        value={renameText}
        onChangeText={setRenameText}
        autoFocus
        style={styles.renameInput}
      />

      <View style={styles.renameActions}>
        <TouchableOpacity onPress={() => setRenamingHabit(null)}>
          <Text style={styles.renameCancel}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={renameHabit}>
          <Text style={styles.renameSave}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}


  <LinearGradient
    colors={
      habit.log[today]
        ? ['#3b82f6', '#6366f1']
        : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
    }
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.habitCard}
  >
    <View style={styles.habitLeft}>
      <View
        style={[
          styles.checkCircle,
          habit.log[today] && styles.checkCircleDone
        ]}
      >
        {habit.log[today] && (
          <Ionicons name="checkmark" size={16} color="#020617" />
        )}
      </View>

      <View>
        {editingId === habit.id ? (
  <TextInput
    value={editingText}
    onChangeText={setEditingText}
    autoFocus
    style={styles.habitRenameInput}
    onSubmitEditing={() => {
      setHabits(prev =>
        prev.map(h =>
          h.id === habit.id ? { ...h, name: editingText } : h
        )
      );
      setEditingId(null);
    }}
    onBlur={() => {
      setHabits(prev =>
        prev.map(h =>
          h.id === habit.id ? { ...h, name: editingText } : h
        )
      );
      setEditingId(null);
    }}
  />
) : (
  <Text
    style={[
      styles.habitTitle,
      habit.log[today] && styles.habitTitleDone
    ]}
  >
    {habit.name}
  </Text>
)}

        <Text style={styles.habitSub}>
          🔥 {getStreak(habit.log)} day streak
        </Text>
      </View>
    </View>

        <Ionicons
            name="chevron-forward"
            size={18}
            color={habit.log[today] ? '#e0e7ff' : '#94a3b8'}
        />
           </LinearGradient>
          </TouchableOpacity>

      ))}

      {menuVisible && (
  <Modal
    transparent
    animationType="fade"
    onRequestClose={() => setMenuVisible(false)}
  >
    <Pressable
      style={styles.menuOverlay}
      onPress={() => setMenuVisible(false)}
    >
      <View style={styles.menuContainer}>
        
        {/* Rename */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            setEditingId(selectedHabit.id);
            setEditingText(selectedHabit.name);
            setMenuVisible(false);
          }}
        >
          <Ionicons name="pencil" size={18} color="#e5e7eb" style={styles.menuIcon} />
          <Text style={styles.menuText}>Rename</Text>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuDelete]}
          onPress={() => {
            setMenuVisible(false);
            Alert.alert(
              'Delete Habit',
              `Delete "${selectedHabit.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteHabit(selectedHabit.id),
                },
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#f87171" style={styles.menuIcon} />
          <Text style={[styles.menuText, styles.menuDeleteText]}>
            Delete
          </Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        {/* Cancel */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setMenuVisible(false)}
        >
          <Ionicons name="close" size={18} color="#94a3b8" style={styles.menuIcon} />
          <Text style={styles.menuText}>Cancel</Text>
        </TouchableOpacity>

      </View>
    </Pressable>
  </Modal>
)}


    </LinearGradient>
  );
}





function AddScreen({ addHabit }) {
  const [text, setText] = useState('');

  return (
    <LinearGradient colors={['#020617', '#020617']} style={styles.screen}>
      <Text style={styles.title}>Add Habit</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Habit name"
        placeholderTextColor="#64748b"
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (!text.trim()) return;
          addHabit(text);
          setText('');
        }}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      

    </LinearGradient>
  );
}


function StatsScreen({ habits }) {
  const [mode, setMode] = useState('week');

  const days =
    mode === 'day' ? getLastNDays(1)
    : mode === 'week' ? getLastNDays(7)
    : getLastNDays(30);

  return (
    <LinearGradient colors={['#020617', '#020617']} style={styles.screen}>
      <Text style={styles.title}>Stats</Text>

      {/* MODE TOGGLE */}
      <View style={styles.toggleRow}>
        {['day', 'week', 'month'].map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[
              styles.toggleButton,
              mode === m && styles.toggleActive
            ]}
          >
            <Text style={styles.toggleText}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {habits.map(habit => {
        const completed = days.filter(d => habit.log[d]).length;
        const streak = getStreak(habit.log);

        return (
          <View key={habit.id} style={styles.statCard}>
            <Text style={styles.habitName}>{habit.name}</Text>

            <Text style={styles.statText}>
              ✅ {completed} / {days.length}
            </Text>

            <Text style={styles.statText}>
              🔥 Streak: {streak}
            </Text>

            {/* SIMPLE GRAPH */}
            <View style={styles.graphRow}>
              {days.map(d => (
                <View
                  key={d}
                  style={[
                    styles.graphBar,
                    habit.log[d] && styles.graphBarActive
                  ]}
                />
              ))}
            </View>
          </View>
        );
      })}
    </LinearGradient>
  );
}



/* ---------- APP ---------- */

export default function App() {
  const [habits, setHabits] = useState([]);
  

  useEffect(() => {
  const loadHabits = async () => {
    const saved = await AsyncStorage.getItem('habits');
    if (saved) setHabits(JSON.parse(saved));
  };
  loadHabits();
}, []);



  useEffect(() => {
  const checkDate = async () => {
    const lastDate = await AsyncStorage.getItem('lastDate');

    if (lastDate !== today) {
      // New day → no action needed because log is date-based
      await AsyncStorage.setItem('lastDate', today);
    }
  };

  checkDate();
}, []);



  useEffect(() => {
  const loadHabits = async () => {
    const saved = await AsyncStorage.getItem('habits');

    if (!saved) {
      setHabits([]);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch {
      setHabits([]);
      return;
    }

    if (!Array.isArray(parsed)) {
      setHabits([]);
      return;
    }

    setHabits(
      parsed.map(h => ({
        ...h,
        log: h.log || {}
      }))
    );
  };

  loadHabits();
}, []);

  



  const addHabit = name => {
  setHabits([
    ...habits,
    {
      id: Date.now(),
      name,
      log: {} // date -> true
    }
  ]);
};


  const today = new Date().toISOString().slice(0, 10);

const toggleHabit = id => {
  setHabits(
    habits.map(habit =>
      habit.id === id
        ? {
            ...habit,
            log: {
              ...habit.log,
              [today]: !habit.log[today]
            }
          }
        : habit
    )
  );
};

const deleteHabit = id => {
  setHabits(habits.filter(habit => habit.id !== id));
};
const renameHabit = (id, newName) => {
  setHabits(habits.map(h =>
    h.id === id ? { ...h, name: newName } : h
  ));
};


  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          
          tabBarIcon: ({ focused }) => {
  if (route.name === 'Add') {
    return (
      <View style={styles.centerAdd}>
        <Ionicons name="add" size={30} color="#020617" />
      </View>
    );
  }

  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Stats: focused ? 'stats-chart' : 'stats-chart-outline',
    Profile: focused ? 'person' : 'person-outline',
  };

  return (
    <Ionicons
      name={icons[route.name]}
      size={24}
      color={focused ? '#e5e7eb' : '#94a3b8'}
    />
  );
}

        })}
      >
        <Tab.Screen name="Home">
          {() => <HomeScreen habits={habits} toggleHabit={toggleHabit} deleteHabit={deleteHabit} setHabits={setHabits} />}
        </Tab.Screen>

        <Tab.Screen name="Stats"> 
          {() => <StatsScreen habits={habits} />}
        </Tab.Screen>


        <Tab.Screen name="Add">
          {() => <AddScreen addHabit={addHabit} />}
        </Tab.Screen>

        <Tab.Screen name="Profile">
          {() => <LinearGradient colors={['#020617', '#020617']} style={styles.screen}><Text style={styles.title}>Profile</Text></LinearGradient>}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#020617'
  },

  title: {
    color: '#e5e7eb',
    fontSize: 28,
    fontWeight: '600'
  },

  tabBar: {
  position: 'absolute',
  left: 20,
  right: 20,
  bottom: 24,

  height: 72,
  borderRadius: 36,

  backgroundColor: 'rgba(15, 23, 42, 0.75)',
  borderTopWidth: 0,

  elevation: 10,

  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 }
},


input: {
  backgroundColor: '#0f172a',
  color: '#e5e7eb',
  padding: 14,
  borderRadius: 14,
  marginTop: 20
},

addButton: {
  backgroundColor: '#6366f1',
  padding: 16,
  borderRadius: 16,
  marginTop: 20,
  alignItems: 'center',
},

addButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600'
},

empty: {
  color: '#64748b',
  marginTop: 20
},

habitCard: {
  borderRadius: 20,
  padding: 16,
  marginTop: 14,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)'
},

habitLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14
},

checkCircle: {
  width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 2,
  borderColor: '#6366f1',
  justifyContent: 'center',
  alignItems: 'center'
},

checkCircleDone: {
  backgroundColor: '#e0e7ff',
  borderColor: '#e0e7ff'
},

habitTitle: {
  color: '#e5e7eb',
  fontSize: 16,
  fontWeight: '600'
},

habitTitleDone: {
  color: '#e0e7ff'
},

habitSub: {
  color: '#94a3b8',
  fontSize: 12,
  marginTop: 2
},



ringContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 24
},

ringText: {
  position: 'absolute',
  color: '#e5e7eb',
  fontSize: 20,
  fontWeight: '600'
},

toggleRow: {
  flexDirection: 'row',
  marginVertical: 16,
  gap: 8
},

toggleButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 12,
  backgroundColor: '#0f172a'
},

toggleActive: {
  backgroundColor: '#6366f1'
},

toggleText: {
  color: '#e5e7eb',
  fontSize: 12,
  fontWeight: '600'
},

statCard: {
  backgroundColor: '#0f172a',
  padding: 16,
  borderRadius: 16,
  marginBottom: 16
},

habitName: {
  color: '#e5e7eb',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 8
},

statText: {
  color: '#94a3b8',
  fontSize: 14
},

graphRow: {
  flexDirection: 'row',
  marginTop: 12,
  gap: 4
},

graphBar: {
  width: 10,
  height: 40,
  borderRadius: 4,
  backgroundColor: '#1e293b'
},

graphBarActive: {
  backgroundColor: '#6366f1'
},

centerAdd: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#7dd3fc',

  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: 32,

  shadowColor: '#7dd3fc',
  shadowOpacity: 0.6,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 }
},

ringSub: {
  position: 'absolute',
  top: 88,
  fontSize: 13,
  color: '#94a3b8',
},

renameOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(2,6,23,0.75)',
  justifyContent: 'center',
  alignItems: 'center',
},

renameCard: {
  width: '88%',
  backgroundColor: '#020617',
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
},

renameTitle: {
  color: '#e5e7eb',
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 14,
},

renameInput: {
  backgroundColor: '#0f172a',
  borderRadius: 14,
  padding: 14,
  color: '#e5e7eb',
  fontSize: 16,
},

renameButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 18,
  gap: 12,
},

renameCancelBtn: {
  paddingVertical: 10,
  paddingHorizontal: 14,
},

renameCancelText: {
  color: '#94a3b8',
  fontSize: 14,
},

renameSaveBtn: {
  backgroundColor: '#6366f1',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 12,
},

renameSaveText: {
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '600',
},

habitRenameInput: {
  color: '#e5e7eb',
  fontSize: 16,
  fontWeight: '600',
  paddingVertical: 2,
  borderBottomWidth: 1,
  borderBottomColor: '#6366f1',
},

menuOverlay: {
  flex: 1,
  backgroundColor: 'rgba(2,6,23,0.6)',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  paddingTop: 140,
  paddingRight: 16,
},


menuContainer: {
  width: 180,
  backgroundColor: '#262e3f',
  borderRadius: 14,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
},


menuItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 18,
},

menuIcon: {
  width: 28,
  textAlign: 'center',
},


menuText: {
  color: '#e5e7eb',
  fontSize: 16,
  fontWeight: '500',
},

menuDelete: {
  backgroundColor: 'rgba(239,68,68,0.08)',
},

menuDeleteText: {
  color: '#f87171',
},

menuDivider: {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.08)',
  marginVertical: 6,
},



});
