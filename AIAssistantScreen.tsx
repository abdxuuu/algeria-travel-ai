// src/screens/AIAssistantScreen.tsx
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'trip_card';
  data?: any;
};

export default function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI travel assistant for Algeria! 🎉 Where would you like to go? I can help you find the perfect trip based on your preferences!",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Quick suggestions
  const quickSuggestions = [
    "🏜️ Sahara desert trips",
    "🏖️ Beach destinations", 
    "⛰️ Mountain adventures",
    "🏙️ City breaks",
    "💰 Budget under 50,000 DA",
    "👨‍👩‍👧‍👦 Family-friendly options"
  ];

  // Sample trips for demonstration - FIXED: Added images array
  const sampleTrips = [
    {
      id: '1',
      title: 'Djanet Desert Magic',
      price: '89,000 DA',
      duration: '7 days',
      location: 'Djanet, Algeria',
      agency: 'Sahara Travels',
      rating: 4.8,
      description: 'Experience the magic of the Sahara with guided tours, camel rides, traditional Berber camps, and spectacular sunsets.',
      images: [require('../assets/image1.jpg')], // FIXED: Added images array
      category: 'Desert'
    },
    {
      id: '2',
      title: 'Bejaia Coastal Escape',
      price: '62,000 DA',
      duration: '5 days', 
      location: 'Bejaia, Algeria',
      agency: 'Coastal Tours',
      rating: 4.9,
      description: 'Relax on pristine Mediterranean beaches with luxury resort accommodation and water activities.',
      images: [require('../assets/image1.jpg')], // FIXED: Added images array
      category: 'Beach'
    }
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      generateAIResponse(inputText);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    let response = '';
    let responseType: 'text' | 'suggestion' | 'trip_card' = 'text';
    let responseData = null;

    // Simple AI logic - will be replaced with real AI later
    if (lowerInput.includes('sahara') || lowerInput.includes('desert')) {
      response = "The Sahara desert is absolutely magical! 🌵 I recommend Djanet for authentic desert experiences with traditional Berber camps. The best time to visit is October to April when temperatures are pleasant. Would you like me to show you some Sahara trip options?";
      responseType = 'trip_card';
      responseData = sampleTrips[0];
    } else if (lowerInput.includes('beach') || lowerInput.includes('sea')) {
      response = "Algeria has stunning Mediterranean beaches! 🏖️ Bejaia and Oran offer beautiful coastlines with crystal-clear waters. For families, I recommend resorts with kid-friendly facilities. Should I show you some coastal getaway options?";
      responseType = 'trip_card'; 
      responseData = sampleTrips[1];
    } else if (lowerInput.includes('mountain') || lowerInput.includes('hike')) {
      response = "The Kabylie mountains are breathtaking! ⛰️ Perfect for hiking and nature lovers. You can visit traditional villages and enjoy fresh mountain air. The best seasons are spring and autumn. Interested in mountain adventures?";
    } else if (lowerInput.includes('budget') || lowerInput.includes('cheap')) {
      response = "I can find great budget-friendly options for you! 💰 Algiers city breaks start around 25,000 DA, and there are amazing camping experiences in the Sahara for 35,000 DA. What's your preferred budget range?";
    } else if (lowerInput.includes('family') || lowerInput.includes('kids')) {
      response = "Perfect for families! 👨‍👩‍👧‍👦 I recommend beach resorts in Bejaia with kid clubs, or cultural tours in Algiers with interactive museum visits. Many agencies offer family packages with special rates for children.";
    } else {
      response = "That sounds interesting! 🇩🇿 Algeria has so much to offer - from Sahara adventures to Mediterranean beaches and historic cities. Tell me more about what you're looking for, and I'll find the perfect trip for you!";
    }

    const aiMessage: Message = {
      id: Date.now().toString(),
      text: response,
      sender: 'assistant',
      timestamp: new Date(),
      type: responseType,
      data: responseData,
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';

    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer
      ]}>
        {/* Avatar - Position changes based on user/assistant */}
        {!isUser && (
          <View style={[styles.avatar, styles.assistantAvatar]}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        )}
        
        {/* Message Content */}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText
          ]}>
            {message.text}
          </Text>
          
          {/* Trip Card for AI responses */}
          {message.type === 'trip_card' && message.data && (
            <TouchableOpacity 
              style={styles.tripCard}
              onPress={() => navigation.navigate('TripDetails', { trip: message.data })}
            >
              <Image source={message.data.images[0]} style={styles.tripCardImage} />
              <View style={styles.tripCardContent}>
                <Text style={styles.tripCardTitle}>{message.data.title}</Text>
                <Text style={styles.tripCardLocation}>{message.data.location}</Text>
                <Text style={styles.tripCardDescription}>{message.data.description}</Text>
                <View style={styles.tripCardFooter}>
                  <Text style={styles.tripCardPrice}>{message.data.price}</Text>
                  <Text style={styles.tripCardDuration}>{message.data.duration}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Timestamp */}
          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* User Avatar on the right side */}
        {isUser && (
          <View style={[styles.avatar, styles.userAvatar]}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Travel Assistant</Text>
          <Text style={styles.headerSubtitle}>Powered by AI • Algeria Expert</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Welcome Message */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>🎉 Welcome to Your AI Travel Assistant!</Text>
            <Text style={styles.welcomeText}>
              I specialize in Algerian tourism and can help you find perfect trips based on your preferences, budget, and travel style!
            </Text>
          </View>

          {/* Quick Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Quick Start</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.suggestionsRow}>
                {quickSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleQuickSuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Messages */}
          {messages.map(renderMessage)}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about trips, budgets, or destinations..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? "#ffffff" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    padding: 5,
  },
  chatContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  welcomeCard: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  suggestionsRow: {
    flexDirection: 'row',
  },
  suggestionChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: '#0066cc',
    order: 2,
    marginLeft: 8,
    marginRight: 0,
  },
  assistantAvatar: {
    backgroundColor: '#28a745',
  },
  avatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#0066cc',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#1a1a1a',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tripCardImage: {
    width: '100%',
    height: 120,
  },
  tripCardContent: {
    padding: 12,
  },
  tripCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tripCardLocation: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
    marginBottom: 4,
  },
  tripCardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  tripCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripCardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  tripCardDuration: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});