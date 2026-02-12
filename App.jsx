import React, { useState, useEffect } from 'react';
import { Camera, Search, Plus, TrendingDown, Target, Activity, Calendar, BarChart3, Apple, Utensils, Moon, Coffee, Award, ChevronRight, X, Check, Scale, Flame, Footprints, Mic, Clock, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FoodTracker() {
  const [activeTab, setActiveTab] = useState('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showAddFood, setShowAddFood] = useState(false);
  const [showWeightLog, setShowWeightLog] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeLoggingMethod, setActiveLoggingMethod] = useState('search'); // 'search', 'recent', 'voice', 'photo'
  const [showRecipeCreator, setShowRecipeCreator] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showExerciseLog, setShowExerciseLog] = useState(false);
  const [selectedFoodsForRecipe, setSelectedFoodsForRecipe] = useState([]);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  
  // User profile and goals
  const [userProfile, setUserProfile] = useState({
    currentWeight: 85,
    targetWeight: 75,
    height: 175, // cm
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    goalType: 'lose_weight', // 'lose_weight', 'maintain', 'gain_muscle'
    targetDate: '2026-08-12', // 6 months from now
    motivation: 'health'
  });

  const [todayExercises, setTodayExercises] = useState([
    { id: 1, name: 'Morning Run', duration: 30, caloriesBurned: 300, time: '07:00' },
    { id: 2, name: 'Weight Training', duration: 45, caloriesBurned: 250, time: '18:00' }
  ]);

  const [savedRecipes, setSavedRecipes] = useState([
    { 
      id: 1, 
      name: 'Power Breakfast Bowl',
      items: [
        { name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 5 },
        { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 10, fat: 3 }
      ],
      totalCalories: 370,
      totalProtein: 23,
      totalCarbs: 55,
      totalFat: 8,
      createdDate: '2026-02-10'
    }
  ]);

  // Calculate BMI and recommendations
  const calculateBMI = () => {
    const heightInMeters = userProfile.height / 100;
    return (userProfile.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getRecommendations = () => {
    const bmi = calculateBMI();
    const weightDiff = Math.abs(userProfile.currentWeight - userProfile.targetWeight);
    const targetDate = new Date(userProfile.targetDate);
    const today = new Date('2026-02-12');
    const daysToGoal = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const weeksToGoal = Math.ceil(daysToGoal / 7);
    
    // Basic calculation (can be enhanced with more sophisticated formulas)
    let bmr = userProfile.gender === 'male' 
      ? 10 * userProfile.currentWeight + 6.25 * userProfile.height - 5 * userProfile.age + 5
      : 10 * userProfile.currentWeight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const tdee = bmr * activityMultipliers[userProfile.activityLevel];
    
    // Adjust calorie target based on goal
    let calorieAdjustment = 0;
    if (userProfile.goalType === 'lose_weight') {
      calorieAdjustment = -500; // 500 cal deficit
    } else if (userProfile.goalType === 'gain_muscle') {
      calorieAdjustment = 300; // 300 cal surplus
    }
    
    const totalExerciseCalories = todayExercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
    const calorieTarget = Math.round(tdee + calorieAdjustment);
    const calorieTargetWithExercise = calorieTarget + totalExerciseCalories;
    
    // Calculate step target based on goal and activity
    let baseSteps = 8000;
    if (userProfile.goalType === 'lose_weight') {
      baseSteps = userProfile.activityLevel === 'sedentary' ? 10000 : 12000;
    } else if (userProfile.goalType === 'gain_muscle') {
      baseSteps = 7000;
    } else {
      baseSteps = userProfile.activityLevel === 'sedentary' ? 8000 : 10000;
    }
    
    const stepTarget = baseSteps;
    
    return {
      bmi,
      calorieTarget: calorieTargetWithExercise,
      baseCalorieTarget: calorieTarget,
      stepTarget,
      weeksToGoal,
      daysToGoal,
      exerciseCalories: totalExerciseCalories,
      status: bmi < 18.5 ? 'underweight' : bmi < 25 ? 'healthy' : bmi < 30 ? 'overweight' : 'obese'
    };
  };

  const recommendations = getRecommendations();

  // Daily encouragement messages based on progress
  const getDailyEncouragement = () => {
    const progress = ((userProfile.currentWeight - userProfile.targetWeight) / (87 - userProfile.targetWeight)) * 100;
    const messages = [
      { threshold: 0, msg: "🎯 You've got this! Every journey begins with a single step." },
      { threshold: 20, msg: "💪 Great start! You're 20% closer to your goal!" },
      { threshold: 40, msg: "🌟 Amazing progress! You're nearly halfway there!" },
      { threshold: 60, msg: "🔥 Incredible! You're over 60% to your target!" },
      { threshold: 80, msg: "🏆 Almost there! Keep pushing, you're so close!" },
      { threshold: 95, msg: "👏 Final push! Your goal is within reach!" }
    ];
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (progress >= messages[i].threshold) {
        return messages[i].msg;
      }
    }
    return messages[0].msg;
  };

  // Mock food data - in production, this would come from FatSecret API
  const [todayLogs, setTodayLogs] = useState([
    { id: 1, meal: 'breakfast', name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 5, time: '08:30' },
    { id: 2, meal: 'breakfast', name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 10, fat: 3, time: '08:30' },
    { id: 3, meal: 'lunch', name: 'Grilled Chicken Salad', calories: 380, protein: 35, carbs: 20, fat: 18, time: '13:00' },
    { id: 4, meal: 'snack', name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, time: '16:00' },
  ]);

  const [searchResults] = useState([
    { id: 101, name: 'Grilled Salmon', calories: 367, protein: 40, carbs: 0, fat: 22, serving: '100g' },
    { id: 102, name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 2, serving: '1 cup' },
    { id: 103, name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0, serving: '1 cup' },
    { id: 104, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, serving: '100g' },
    { id: 105, name: 'Sweet Potato', calories: 180, protein: 4, carbs: 41, fat: 0, serving: '1 medium' },
  ]);

  // Recent foods for quick re-logging
  const [recentFoods] = useState([
    { id: 201, name: 'Oatmeal with Berries', calories: 250, protein: 8, carbs: 45, fat: 5, serving: '1 bowl', lastLogged: 'Today' },
    { id: 202, name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 10, fat: 3, serving: '150g', lastLogged: 'Today' },
    { id: 203, name: 'Grilled Chicken Salad', calories: 380, protein: 35, carbs: 20, fat: 18, serving: '1 plate', lastLogged: 'Today' },
    { id: 204, name: 'Protein Shake', calories: 180, protein: 25, carbs: 10, fat: 3, serving: '1 scoop', lastLogged: 'Yesterday' },
    { id: 205, name: 'Scrambled Eggs', calories: 220, protein: 18, carbs: 2, fat: 16, serving: '2 eggs', lastLogged: 'Yesterday' },
    { id: 206, name: 'Avocado Toast', calories: 320, protein: 12, carbs: 35, fat: 18, serving: '2 slices', lastLogged: '2 days ago' },
    { id: 207, name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, serving: '1 medium', lastLogged: '2 days ago' },
    { id: 208, name: 'Almonds', calories: 160, protein: 6, carbs: 6, fat: 14, serving: '28g', lastLogged: '3 days ago' },
  ]);

  const [weightHistory] = useState([
    { date: 'Feb 5', weight: 87, bmi: 28.4 },
    { date: 'Feb 6', weight: 86.5, bmi: 28.2 },
    { date: 'Feb 7', weight: 86.2, bmi: 28.1 },
    { date: 'Feb 8', weight: 86, bmi: 28.0 },
    { date: 'Feb 9', weight: 85.8, bmi: 27.9 },
    { date: 'Feb 10', weight: 85.5, bmi: 27.8 },
    { date: 'Feb 11', weight: 85.2, bmi: 27.7 },
    { date: 'Feb 12', weight: 85, bmi: 27.7 },
  ]);

  const [weeklyNutrition] = useState([
    { day: 'Mon', calories: 1850, protein: 120, carbs: 180, fat: 65 },
    { day: 'Tue', calories: 1920, protein: 115, carbs: 195, fat: 70 },
    { day: 'Wed', calories: 1780, protein: 125, carbs: 170, fat: 60 },
    { day: 'Thu', calories: 1850, protein: 118, carbs: 185, fat: 68 },
    { day: 'Fri', calories: 1900, protein: 122, carbs: 190, fat: 72 },
    { day: 'Sat', calories: 2100, protein: 110, carbs: 220, fat: 80 },
    { day: 'Sun', calories: 1850, protein: 120, carbs: 180, fat: 65 },
  ]);

  const totalCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = todayLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFat = todayLogs.reduce((sum, log) => sum + log.fat, 0);

  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#10b981' },
    { name: 'Carbs', value: totalCarbs, color: '#3b82f6' },
    { name: 'Fat', value: totalFat, color: '#f59e0b' },
  ];

  const mealIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Moon,
    snack: Apple
  };

  const addFoodToLog = (food) => {
    const newLog = {
      id: Date.now(),
      meal: selectedMeal,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setTodayLogs([...todayLogs, newLog]);
    setShowAddFood(false);
    setSearchQuery('');
  };

  const removeFood = (id) => {
    setTodayLogs(todayLogs.filter(log => log.id !== id));
  };

  // Voice input handler
  const startVoiceInput = () => {
    setIsListening(true);
    
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
      setIsListening(false);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target.result);
        analyzePhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate AI photo analysis (in production, use Vision API)
  const analyzePhoto = (photoData) => {
    setPhotoAnalyzing(true);
    // Simulate API call delay
    setTimeout(() => {
      // Mock result - in production, this would come from AI vision API
      const mockResult = {
        detectedFoods: [
          { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, confidence: 0.95 },
          { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 2, confidence: 0.88 },
          { name: 'Broccoli', calories: 55, protein: 4, carbs: 11, fat: 0, confidence: 0.92 }
        ]
      };
      setSearchQuery('detected foods');
      setPhotoAnalyzing(false);
    }, 2000);
  };

  // Recipe/Meal creation
  const createRecipeFromSelected = () => {
    if (selectedFoodsForRecipe.length === 0) {
      alert('Please select at least one food item to create a recipe');
      return;
    }
    setIsCreatingRecipe(true);
  };

  const saveRecipe = (recipeName) => {
    const totalCalories = selectedFoodsForRecipe.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = selectedFoodsForRecipe.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = selectedFoodsForRecipe.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = selectedFoodsForRecipe.reduce((sum, food) => sum + food.fat, 0);

    const newRecipe = {
      id: Date.now(),
      name: recipeName,
      items: selectedFoodsForRecipe,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setSavedRecipes([...savedRecipes, newRecipe]);
    setSelectedFoodsForRecipe([]);
    setIsCreatingRecipe(false);
    alert(`Recipe "${recipeName}" saved successfully!`);
  };

  const toggleFoodSelection = (food) => {
    const isSelected = selectedFoodsForRecipe.find(f => f.id === food.id);
    if (isSelected) {
      setSelectedFoodsForRecipe(selectedFoodsForRecipe.filter(f => f.id !== food.id));
    } else {
      setSelectedFoodsForRecipe([...selectedFoodsForRecipe, food]);
    }
  };

  const addRecipeToLog = (recipe) => {
    const newLogs = recipe.items.map(item => ({
      id: Date.now() + Math.random(),
      meal: selectedMeal,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      recipeId: recipe.id,
      recipeName: recipe.name
    }));
    setTodayLogs([...todayLogs, ...newLogs]);
    setShowAddFood(false);
  };

  const addExercise = (exercise) => {
    const newExercise = {
      id: Date.now(),
      name: exercise.name,
      duration: exercise.duration,
      caloriesBurned: exercise.caloriesBurned,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setTodayExercises([...todayExercises, newExercise]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
      fontFamily: '"DM Sans", -apple-system, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '24px 32px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em'
              }}>
                NutriTrack
              </h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '15px' }}>
                Thursday, February 12, 2026
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowGoalSetter(true)}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  color: '#8b5cf6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#8b5cf6';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#8b5cf6';
                }}
              >
                <Target size={18} />
                Set Goal
              </button>
              <button
                onClick={() => setShowExerciseLog(true)}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  border: '2px solid #f59e0b',
                  borderRadius: '12px',
                  color: '#f59e0b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f59e0b';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#f59e0b';
                }}
              >
                <Activity size={18} />
                Log Exercise
              </button>
              <button
                onClick={() => setShowWeightLog(true)}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  color: '#10b981',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#10b981';
                }}
              >
                <Scale size={18} />
                Log Weight
              </button>
              <button
                onClick={() => setShowBarcodeScanner(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Camera size={18} />
                Scan
              </button>
            </div>
          </div>
        </header>

        {/* Daily Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Calories Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Flame size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>Calories</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                    {totalCalories}
                    <span style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '400' }}> / {recommendations.calorieTarget}</span>
                  </p>
                </div>
              </div>
              <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                  height: '100%',
                  width: `${Math.min((totalCalories / recommendations.calorieTarget) * 100, 100)}%`,
                  borderRadius: '12px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                {recommendations.calorieTarget - totalCalories > 0 
                  ? `${recommendations.calorieTarget - totalCalories} cal remaining`
                  : `${totalCalories - recommendations.calorieTarget} cal over target`
                }
              </p>
            </div>
          </div>

          {/* Steps Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Footprints size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>Steps Today</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                    7,452
                    <span style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '400' }}> / {recommendations.stepTarget.toLocaleString()}</span>
                  </p>
                </div>
              </div>
              <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                  height: '100%',
                  width: `${Math.min((7452 / recommendations.stepTarget) * 100, 100)}%`,
                  borderRadius: '12px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                {recommendations.stepTarget - 7452} steps to goal
              </p>
            </div>
          </div>

          {/* Weight Progress Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(16, 185, 129, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingDown size={24} color="white" />
                </div>
                <div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', fontWeight: '500' }}>Weight Progress</p>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
                    {userProfile.currentWeight}
                    <span style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '400' }}> kg</span>
                  </p>
                </div>
              </div>
              <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  height: '100%',
                  width: `${((userProfile.currentWeight - userProfile.targetWeight) / (userProfile.currentWeight - userProfile.targetWeight)) * 100}%`,
                  borderRadius: '12px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                {userProfile.currentWeight - userProfile.targetWeight} kg to goal • BMI: {recommendations.bmi}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Encouragement Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '20px',
          padding: '20px 28px',
          marginBottom: '24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
              Daily Motivation • Day {recommendations.daysToGoal > 0 ? Math.ceil((new Date(userProfile.targetDate) - new Date('2026-02-12')) / (1000 * 60 * 60 * 24)) - recommendations.daysToGoal + 1 : 1} of your journey
            </p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', lineHeight: '1.4' }}>
              {getDailyEncouragement()}
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.9 }}>Days to Goal</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>{recommendations.daysToGoal}</p>
          </div>
        </div>

        {/* Personalized Recommendations Panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Target size={24} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Your Personalized Plan
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Daily Calorie Target</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {recommendations.calorieTarget} cal
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                500 cal deficit for healthy weight loss
              </p>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Daily Step Goal</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                {recommendations.stepTarget.toLocaleString()}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Based on {userProfile.activityLevel} activity level
              </p>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Time to Goal</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                {recommendations.weeksToGoal} weeks
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Losing {userProfile.currentWeight - userProfile.targetWeight} kg safely
              </p>
            </div>
            <div style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Health Status</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#8b5cf6', textTransform: 'capitalize' }}>
                {recommendations.status}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                BMI: {recommendations.bmi} • Keep up the progress!
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          display: 'inline-flex',
          gap: '4px'
        }}>
          {[
            { id: 'log', label: 'Food Log', icon: Utensils },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'plan', label: 'Meal Plan', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 28px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                  border: 'none',
                  borderRadius: '16px',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Food Log Tab */}
        {activeTab === 'log' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
            {/* Meals Section */}
            <div>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(meal => {
                const Icon = mealIcons[meal];
                const mealLogs = todayLogs.filter(log => log.meal === meal);
                const mealCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0);

                return (
                  <div key={meal} style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    marginBottom: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={20} color="white" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937', textTransform: 'capitalize' }}>
                            {meal}
                          </h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                            {mealCalories} calories
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedMeal(meal);
                          setShowAddFood(true);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: 'white',
                          border: '2px solid #10b981',
                          borderRadius: '10px',
                          color: '#10b981',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#10b981';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#10b981';
                        }}
                      >
                        <Plus size={16} />
                        Add Food
                      </button>
                    </div>

                    {mealLogs.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mealLogs.map(log => (
                          <div key={log.id} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #f3f4f6'
                          }}>
                            <div>
                              <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                                {log.name}
                              </p>
                              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g • {log.time}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                {log.calories} cal
                              </span>
                              <button
                                onClick={() => removeFood(log.id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  color: '#9ca3af',
                                  transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                        No foods logged yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Today's Macros Sidebar */}
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                position: 'sticky',
                top: '20px'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  Today's Macros
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Protein</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{totalProtein}g</span>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#10b981',
                        height: '100%',
                        width: `${(totalProtein / 150) * 100}%`,
                        borderRadius: '8px'
                      }} />
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '3px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Carbs</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{totalCarbs}g</span>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#3b82f6',
                        height: '100%',
                        width: `${(totalCarbs / 200) * 100}%`,
                        borderRadius: '8px'
                      }} />
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '3px' }} />
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Fat</span>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{totalFat}g</span>
                    </div>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      height: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: '#f59e0b',
                        height: '100%',
                        width: `${(totalFat / 70) * 100}%`,
                        borderRadius: '8px'
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Award size={18} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>Quick Tip</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Aim for 30g of protein per meal to support muscle maintenance during weight loss.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                Weight Progress
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightHistory}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[84, 88]} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                Weekly Calorie Intake
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyNutrition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Bar dataKey="calories" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                Weekly Macros Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyNutrition}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="carbs" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="fat" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Meal Plan Tab */}
        {activeTab === 'plan' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Calendar size={40} color="white" />
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Meal Planning Coming Soon
              </h3>
              <p style={{ margin: 0, fontSize: '16px', color: '#6b7280', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                We're building an intelligent meal planning feature that will suggest balanced meals based on your goals, preferences, and nutritional needs.
              </p>
              <button
                style={{
                  marginTop: '24px',
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '15px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                Notify Me When Ready
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {showAddFood && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowAddFood(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Add Food to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
              </h3>
              <button
                onClick={() => setShowAddFood(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Logging Method Tabs */}
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '24px',
              background: '#f3f4f6',
              padding: '6px',
              borderRadius: '12px',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveLoggingMethod('search')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeLoggingMethod === 'search' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeLoggingMethod === 'search' ? '#10b981' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: activeLoggingMethod === 'search' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: 'fit-content'
                }}
              >
                <Search size={18} />
                Search
              </button>
              <button
                onClick={() => setActiveLoggingMethod('recent')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeLoggingMethod === 'recent' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeLoggingMethod === 'recent' ? '#10b981' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: activeLoggingMethod === 'recent' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: 'fit-content'
                }}
              >
                <Clock size={18} />
                Recent
              </button>
              <button
                onClick={() => setActiveLoggingMethod('recipes')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeLoggingMethod === 'recipes' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeLoggingMethod === 'recipes' ? '#10b981' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: activeLoggingMethod === 'recipes' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: 'fit-content'
                }}
              >
                <Utensils size={18} />
                Recipes
              </button>
              <button
                onClick={() => setActiveLoggingMethod('photo')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeLoggingMethod === 'photo' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeLoggingMethod === 'photo' ? '#10b981' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: activeLoggingMethod === 'photo' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: 'fit-content'
                }}
              >
                <Camera size={18} />
                Photo
              </button>
              <button
                onClick={() => setActiveLoggingMethod('voice')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeLoggingMethod === 'voice' ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeLoggingMethod === 'voice' ? '#10b981' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: activeLoggingMethod === 'voice' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                  minWidth: 'fit-content'
                }}
              >
                <Mic size={18} />
                Voice
              </button>
            </div>

            {/* Search Method */}
            {activeLoggingMethod === 'search' && (
              <>
                <div style={{
                  position: 'relative',
                  marginBottom: '24px'
                }}>
                  <Search size={20} color="#9ca3af" style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }} />
                  <input
                    type="text"
                    placeholder="Search foods from FatSecret database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 14px 14px 48px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {searchResults.filter(food => 
                    food.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(food => (
                    <div key={food.id} style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '2px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onClick={() => addFoodToLog(food)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                            {food.name}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                            {food.serving} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                          </p>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '15px'
                        }}>
                          {food.calories} cal
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent Foods Method */}
            {activeLoggingMethod === 'recent' && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Zap size={18} color="#10b981" />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>Quick Re-Log</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Tap any food to instantly add it to your {selectedMeal}. Perfect for foods you eat regularly!
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {recentFoods.map(food => (
                    <div key={food.id} style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '2px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onClick={() => addFoodToLog(food)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                              {food.name}
                            </p>
                            <span style={{
                              fontSize: '11px',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: '500'
                            }}>
                              {food.lastLogged}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                            {food.serving} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                          </p>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '15px',
                          marginLeft: '12px'
                        }}>
                          {food.calories} cal
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Saved Recipes Method */}
            {activeLoggingMethod === 'recipes' && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Utensils size={18} color="#8b5cf6" />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>Your Saved Recipes & Meals</span>
                    </div>
                    <button
                      onClick={() => setShowRecipeCreator(true)}
                      style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} />
                      New Recipe
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                    Log entire meals in one tap! Create recipes from your favorite food combinations.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {savedRecipes.map(recipe => (
                    <div key={recipe.id} style={{
                      background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '2px solid transparent'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#faf5ff';
                      e.currentTarget.style.borderColor = '#8b5cf6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onClick={() => addRecipeToLog(recipe)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                            {recipe.name}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#8b5cf6', fontWeight: '500' }}>
                            {recipe.items.length} items • Created {recipe.createdDate}
                          </p>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '15px',
                          marginLeft: '12px'
                        }}>
                          {recipe.totalCalories} cal
                        </div>
                      </div>
                      <div style={{ 
                        background: 'white', 
                        borderRadius: '8px', 
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <strong>Includes:</strong> {recipe.items.map(item => item.name).join(', ')}
                      </div>
                      <div style={{ 
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#6b7280',
                        display: 'flex',
                        gap: '12px'
                      }}>
                        <span>P: {recipe.totalProtein}g</span>
                        <span>C: {recipe.totalCarbs}g</span>
                        <span>F: {recipe.totalFat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Photo Upload Method */}
            {activeLoggingMethod === 'photo' && (
              <>
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  {!uploadedPhoto ? (
                    <>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                      }}>
                        <Camera size={48} color="white" />
                      </div>
                      
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                        Photo Food Logger
                      </h4>
                      <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                        Take a photo of your meal and our AI will automatically detect the foods and estimate nutrition
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        id="photoInput"
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      <button
                        onClick={() => document.getElementById('photoInput').click()}
                        style={{
                          padding: '14px 32px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '15px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Camera size={18} />
                        Take or Upload Photo
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{
                        background: '#f3f4f6',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px'
                      }}>
                        <img src={uploadedPhoto} alt="Uploaded food" style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '8px'
                        }} />
                      </div>

                      {photoAnalyzing ? (
                        <div style={{
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid #e5e7eb',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            animation: 'spin 1s linear infinite'
                          }} />
                          <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', fontWeight: '600' }}>
                            Analyzing your photo...
                          </p>
                        </div>
                      ) : (
                        <>
                          <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                            Detected Foods
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {searchResults.slice(0, 3).map(food => (
                              <div key={food.id} style={{
                                background: '#f9fafb',
                                borderRadius: '12px',
                                padding: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '2px solid transparent'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderColor = '#3b82f6';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.borderColor = 'transparent';
                              }}
                              onClick={() => addFoodToLog(food)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                      {food.name}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                      {food.serving} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                    </p>
                                  </div>
                                  <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '15px'
                                  }}>
                                    {food.calories} cal
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setUploadedPhoto(null);
                              setPhotoAnalyzing(false);
                            }}
                            style={{
                              marginTop: '16px',
                              padding: '12px 24px',
                              background: 'white',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              color: '#6b7280',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Take Another Photo
                          </button>
                        </>
                      )}

                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </>
                  )}
                </div>

                <div style={{
                  padding: '16px',
                  background: '#eff6ff',
                  borderRadius: '12px',
                  border: '1px solid #dbeafe'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', lineHeight: '1.5' }}>
                    💡 <strong>AI Vision:</strong> In production, this would use Claude's vision API or Google Cloud Vision to analyze food photos and estimate nutritional content.
                  </p>
                </div>
              </>
            )}

            {/* Voice Input Method */}
            {activeLoggingMethod === 'voice' && (
              <>
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    background: isListening 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: isListening 
                      ? '0 0 0 0 rgba(239, 68, 68, 0.4), 0 0 0 20px rgba(239, 68, 68, 0.2), 0 0 0 40px rgba(239, 68, 68, 0.1)'
                      : '0 8px 24px rgba(16, 185, 129, 0.3)',
                    animation: isListening ? 'pulse 1.5s infinite' : 'none'
                  }}
                  onClick={startVoiceInput}>
                    <Mic size={48} color="white" />
                  </div>
                  
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </h4>
                  <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                    {isListening 
                      ? 'Speak now to search for foods'
                      : 'Tap the microphone and say the name of the food you want to log'
                    }
                  </p>

                  {!isListening && searchQuery && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #10b981',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '20px'
                    }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#059669' }}>
                        <strong>Heard:</strong> "{searchQuery}"
                      </p>
                    </div>
                  )}

                  {!isListening && (
                    <button
                      onClick={startVoiceInput}
                      style={{
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '15px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Mic size={18} />
                      Start Voice Input
                    </button>
                  )}
                </div>

                {searchQuery && !isListening && (
                  <>
                    <div style={{
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '20px',
                      marginTop: '20px'
                    }}>
                      <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                        Search Results
                      </h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                        {searchResults.filter(food => 
                          food.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(food => (
                          <div key={food.id} style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '2px solid transparent'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = '#f0fdf4';
                            e.currentTarget.style.borderColor = '#10b981';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.borderColor = 'transparent';
                          }}
                          onClick={() => addFoodToLog(food)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                  {food.name}
                                </p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                  {food.serving} • P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                                </p>
                              </div>
                              <div style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '15px'
                              }}>
                                {food.calories} cal
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <style>{`
                  @keyframes pulse {
                    0% {
                      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4), 0 0 0 20px rgba(239, 68, 68, 0.2), 0 0 0 40px rgba(239, 68, 68, 0.1);
                    }
                    50% {
                      box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.4), 0 0 0 30px rgba(239, 68, 68, 0.2), 0 0 0 50px rgba(239, 68, 68, 0.1);
                    }
                    100% {
                      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4), 0 0 0 20px rgba(239, 68, 68, 0.2), 0 0 0 40px rgba(239, 68, 68, 0.1);
                    }
                  }
                `}</style>
              </>
            )}

            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #dbeafe'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6', lineHeight: '1.5' }}>
                💡 <strong>Note:</strong> This app uses the FatSecret Platform API. To enable real food search, you'll need to register for a free API key at platform.fatsecret.com and add it to the app configuration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Weight Log Modal */}
      {showWeightLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowWeightLog(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Log Your Weight
              </h3>
              <button
                onClick={() => setShowWeightLog(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue={userProfile.currentWeight}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Date
              </label>
              <input
                type="date"
                defaultValue="2026-02-12"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={20} />
              Save Weight
            </button>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowBarcodeScanner(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Camera size={40} color="white" />
            </div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
              Barcode Scanner
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
              Point your camera at a food barcode to instantly log nutritional information. This feature requires camera permissions and the FatSecret Barcode API.
            </p>
            <button
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                marginRight: '12px'
              }}
            >
              Enable Camera
            </button>
            <button
              onClick={() => setShowBarcodeScanner(false)}
              style={{
                padding: '14px 32px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                color: '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goal Setter Modal */}
      {showGoalSetter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowGoalSetter(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Set Your Goals
              </h3>
              <button
                onClick={() => setShowGoalSetter(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue={userProfile.targetWeight}
                onChange={(e) => setUserProfile({...userProfile, targetWeight: parseFloat(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Target Date
              </label>
              <input
                type="date"
                defaultValue={userProfile.targetDate}
                onChange={(e) => setUserProfile({...userProfile, targetDate: e.target.value})}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Goal Type
              </label>
              <select
                value={userProfile.goalType}
                onChange={(e) => setUserProfile({...userProfile, goalType: e.target.value})}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain_muscle">Gain Muscle</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                Activity Level
              </label>
              <select
                value={userProfile.activityLevel}
                onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value})}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="veryActive">Very Active (2x per day)</option>
              </select>
            </div>

            <button
              onClick={() => setShowGoalSetter(false)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Check size={20} />
              Save Goals
            </button>
          </div>
        </div>
      )}

      {/* Exercise Logger Modal */}
      {showExerciseLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowExerciseLog(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Log Exercise
              </h3>
              <button
                onClick={() => setShowExerciseLog(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#f59e0b', lineHeight: '1.5' }}>
                💪 <strong>Exercise increases your daily calorie budget!</strong> Logged exercises add calories to your target, helping you fuel your workouts while staying on track.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addExercise({
                name: formData.get('exerciseName'),
                duration: parseInt(formData.get('duration')),
                caloriesBurned: parseInt(formData.get('calories'))
              });
              setShowExerciseLog(false);
              e.target.reset();
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                  Exercise Name
                </label>
                <input
                  type="text"
                  name="exerciseName"
                  placeholder="e.g., Running, Weight Training, Yoga"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  placeholder="30"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                  Calories Burned
                </label>
                <input
                  type="number"
                  name="calories"
                  placeholder="250"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '2px solid #e5e7eb',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Check size={20} />
                Log Exercise
              </button>
            </form>

            {/* Today's Exercises */}
            {todayExercises.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#6b7280' }}>
                  Today's Exercises
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todayExercises.map(exercise => (
                    <div key={exercise.id} style={{
                      background: '#fef3c7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {exercise.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#92400e' }}>
                          {exercise.duration} min • {exercise.time}
                        </p>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b' }}>
                        +{exercise.caloriesBurned} cal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recipe Creator Modal */}
      {showRecipeCreator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => !isCreatingRecipe && setShowRecipeCreator(false)}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {isCreatingRecipe ? 'Name Your Recipe' : 'Create Recipe from Today\'s Log'}
              </h3>
              <button
                onClick={() => {
                  setShowRecipeCreator(false);
                  setIsCreatingRecipe(false);
                  setSelectedFoodsForRecipe([]);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {!isCreatingRecipe ? (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8b5cf6', lineHeight: '1.5' }}>
                    🍽️ <strong>Select foods from today's log to create a recipe.</strong> Group meals you eat together to log them faster next time!
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>
                    Selected: {selectedFoodsForRecipe.length} items
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                  {todayLogs.map(log => {
                    const isSelected = selectedFoodsForRecipe.find(f => f.id === log.id);
                    return (
                      <div key={log.id} style={{
                        background: isSelected ? '#faf5ff' : '#f9fafb',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: isSelected ? '2px solid #8b5cf6' : '2px solid transparent'
                      }}
                      onClick={() => toggleFoodSelection(log)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                              {log.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                              {log.meal} • P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: isSelected ? '#8b5cf6' : '#6b7280' }}>
                              {log.calories} cal
                            </span>
                            {isSelected && <Check size={20} color="#8b5cf6" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={createRecipeFromSelected}
                  disabled={selectedFoodsForRecipe.length === 0}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: selectedFoodsForRecipe.length === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: selectedFoodsForRecipe.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    boxShadow: selectedFoodsForRecipe.length === 0 ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <ChevronRight size={20} />
                  Continue to Name Recipe
                </button>
              </>
            ) : (
              <>
                <div style={{
                  background: '#faf5ff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Recipe includes:</p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1f2937' }}>
                    {selectedFoodsForRecipe.map(food => (
                      <li key={food.id}>{food.name}</li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  saveRecipe(formData.get('recipeName'));
                  setShowRecipeCreator(false);
                  setIsCreatingRecipe(false);
                }}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      name="recipeName"
                      placeholder="e.g., My Morning Protein Boost"
                      required
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '2px solid #e5e7eb',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={20} />
                    Save Recipe
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
