import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Device, Call } from '@twilio/voice-sdk';
import axios from 'axios';
import { useAuth } from '@/lib/dashboard/hooks/useAuth';
// import { QalqulSDK } from "@qalqul/sdk-call/dist/model/QalqulSDK"; 
// Assuming package is missing, we'll mock or comment out for now to allow build
// import io from "socket.io-client";
import { callsApi } from '@/lib/dashboard/services/callsClient';
import { AIAssistantAPI, AIAssistantMessage } from './GlobalAIAssistant';
import { useRouter } from 'next/navigation';
import api from '@/lib/rep-profile/client';

type CallStatus = 'idle' | 'initiating' | 'active' | 'ended';

interface CallInterfaceProps {
  phoneNumber: string;
  agentId: string;
  onEnd: () => void;
  onCallSaved?: () => void;
  provider?: 'twilio' | 'qalqul';
  keepAIPanelAfterCall?: boolean;
  callId: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function CallInterface({ phoneNumber, agentId, onEnd, onCallSaved, provider = 'twilio', keepAIPanelAfterCall = true, callId }: CallInterfaceProps) {
  // Constants for audio processing and transcription
  const SPEECH_THRESHOLD = 0.015;
  const SILENCE_TIMEOUT = 2000;
  const TRANSCRIPT_PROCESS_DELAY = 2000;

  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [connection, setConnection] = useState<Call | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [audioProcessor, setAudioProcessor] = useState<AudioWorkletNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { user: currentUser } = useAuth();
  
  // Qalqul mock vars
  let qalqulSDK: any | undefined;
  let calls: any[] = [];
  let isSdkInitialized: boolean = false;
  let start_timer_var = 0;  
  let callTimer = "00:00:00";
  let uuId: string | null = null;
  let callManage: NodeJS.Timeout | undefined;
  let intervalTimer: any;

  const [lastProcessedTranscript, setLastProcessedTranscript] = useState<string>('');
  const [transcriptBuffer, setTranscriptBuffer] = useState<string>('');
  const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [lastProcessedText, setLastProcessedText] = useState<string>('');
  const [currentSpeechSegment, setCurrentSpeechSegment] = useState<string>('');
  const [lastSpeechTimestamp, setLastSpeechTimestamp] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const router = useRouter();
  const socketRef = useRef<any>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Initialement, s'assurer que le panel AI est visible
  useEffect(() => {
    // Ensure AI panel is visible at start
    AIAssistantAPI.showPanel();
    AIAssistantAPI.setCallEnded(false);
    AIAssistantAPI.clearMessages();
  }, []);

  const processMarkdownResponse = (markdown: string): { content: string, category: 'suggestion' | 'alert' | 'info' | 'action', priority: 'high' | 'medium' | 'low' } => {
    // Extract the main content without markdown headers and formatting
    const content = markdown
      .replace(/^#+\s*.*?\n/gm, '')    // Remove headers
      .replace(/\*\*/g, '')            // Remove bold
      .replace(/\n+/g, ' ')            // Replace newlines with space
      .replace(/^\d+\.\s+/g, '')       // Remove numbered lists
      .replace(/^[-*]\s+/gm, '')       // Remove bullet points
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim();

    // Skip pure sentiment analysis messages unless they contain actionable info
    if (content.toLowerCase().includes('customer sentiment') && 
        !content.toLowerCase().includes('suggest') && 
        !content.toLowerCase().includes('should') && 
        !content.toLowerCase().includes('please')) {
      return { content: '', category: 'info', priority: 'low' };
    }

    let category: 'suggestion' | 'alert' | 'info' | 'action' = 'info';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    const lowerContent = content.toLowerCase();

    // Improved categorization logic
    if (lowerContent.includes('warning') || lowerContent.includes('caution') || 
        lowerContent.includes('important') || lowerContent.includes('urgent')) {
      category = 'alert';
      priority = 'high';
    } else if (lowerContent.includes('please') || lowerContent.includes('need to') || 
               lowerContent.includes('should') || lowerContent.includes('must')) {
      category = 'action';
      priority = lowerContent.includes('immediately') ? 'high' : 'medium';
    } else if (lowerContent.includes('suggest') || lowerContent.includes('recommend') || 
               lowerContent.includes('might want to') || lowerContent.includes('consider')) {
      category = 'suggestion';
      priority = lowerContent.includes('strongly') ? 'medium' : 'low';
    }

    return { content, category, priority };
  };

  const handleTranscription = async (transcription: string) => {
    if (!transcription?.trim()) {
      console.log('❌ Empty transcription, skipping processing');
      return;
    }

    try {
      console.log('🎯 Sending transcription to AI assistant:', transcription);
      
      // Get current messages from global state for context (mocking window access safely)
      const currentMessages: any[] = (globalThis as any).AIAssistant?.messages || []; // This relies on implementation detail
      
      const payload = {
        transcription,
        callSid: callSid || 'unknown',
        isAgent: false,
        context: currentMessages.slice(-5).map((msg: AIAssistantMessage) => ({
          role: msg.role,
          content: msg.content,
          category: msg.category,
          priority: msg.priority,
          timestamp: msg.timestamp
        }))
      };

      const response = await api.post('/calls/ai-assist', payload);
      console.log('📝 AI assistant response:', response.data);
      
      if (response.data?.suggestion) {
        const { content, category, priority } = processMarkdownResponse(response.data.suggestion);
        
        if (content.trim()) {
          const newMessage: AIAssistantMessage = {
            role: 'assistant',
            content,
            timestamp: new Date(),
            category,
            priority,
            isProcessed: false
          };

          console.log('🆕 Creating new AI message:', newMessage);
          
          // Add message directly to global state
          AIAssistantAPI.addMessage(newMessage);
          console.log('✅ Message added to global state');
        }
      }
    } catch (error) {
      console.error('🚨 Error processing transcription:', error);
    }
  };

  const hasEnoughSilence = () => {
    const now = Date.now();
    return now - lastSpeechTimestamp > SILENCE_TIMEOUT;
  };

  const processTranscriptionSegment = async (segment: string, isFinal: boolean) => {
    if (!segment?.trim()) return;

    if ((isFinal || hasEnoughSilence()) && !isProcessingTranscript) {
      console.log(`🎯 Processing transcript segment (${isFinal ? 'final' : 'silence'}):`);
      setIsProcessingTranscript(true);
      try {
        await handleTranscription(segment);
        setLastProcessedText(segment);
        setCurrentSpeechSegment('');
      } finally {
        setIsProcessingTranscript(false);
      }
    } else if (!isFinal) {
      setCurrentSpeechSegment(segment);
    }
  };

  const analyzeAudio = useCallback((dataArray: Float32Array) => {
    let rms = 0;
    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const amplitude = Math.abs(dataArray[i]);
      rms += amplitude * amplitude;
      peak = Math.max(peak, amplitude);
    }
    
    rms = Math.sqrt(rms / dataArray.length);
    const now = Date.now();
    const isActive = rms > SPEECH_THRESHOLD;
    
    if (isActive) {
      setLastSpeechTimestamp(now);
      if (!isSpeaking) {
        setIsSpeaking(true);
        console.log('🗣️ Speech started');
      }
    } else if (isSpeaking && hasEnoughSilence()) {
      setIsSpeaking(false);
      console.log('🤫 Speech ended - Processing transcript buffer');
      if (currentSpeechSegment && currentSpeechSegment.trim().length > 0) {
        processTranscriptionSegment(currentSpeechSegment, false);
      }
    }
    
    return { rms, peak, isActive };
  }, [isSpeaking, lastSpeechTimestamp, currentSpeechSegment]);

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📥 Speech recognition result:', data);
      
      if (data.error) {
        console.error('❌ Speech recognition error:', data.error);
        return;
      }

      let transcriptToProcess = '';

      if (data.transcript) {
        transcriptToProcess = data.transcript;
      } else if (data.results?.[0]?.alternatives?.[0]?.transcript) {
        transcriptToProcess = data.results[0].alternatives[0].transcript;
      }

      if (transcriptToProcess?.trim()) {
        const cleanedTranscript = transcriptToProcess.replace(lastProcessedText, '').trim();
        
        if (cleanedTranscript) {
          console.log('✨ New transcript segment:', cleanedTranscript);
          
          if (transcriptTimeoutRef.current) {
            clearTimeout(transcriptTimeoutRef.current);
          }

          if (data.isFinal) {
            console.log('🏁 Final transcript received');
            const fullSegment = `${currentSpeechSegment} ${cleanedTranscript}`.trim();
            processTranscriptionSegment(fullSegment, true);
          } else {
            const newSegment = `${currentSpeechSegment} ${cleanedTranscript}`.trim();
            setCurrentSpeechSegment(newSegment);
            
            transcriptTimeoutRef.current = setTimeout(() => {
              if (hasEnoughSilence()) {
                processTranscriptionSegment(newSegment, false);
              }
            }, TRANSCRIPT_PROCESS_DELAY);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  };

  useEffect(() => {
    const initiateCall = async () => {
      if (!currentUser) {
        setError('You must be logged in to make calls');
        return;
      }

      console.log('Initiating the call...');

      try {
        if (provider === 'qalqul') {
          // Initialize Qalqul with credentials
          // Skipped Qalqul implementation as package is not available
          setError('Qalqul provider not supported in this migration yet.');
          onEnd();
        } else {
          // Existing Twilio implementation
          const response = await callsApi.generateTwilioToken();
          const token = response.token;

          const newDevice = new Device(token, {
            codecPreferences: ['pcmu', 'pcma'] as any,
            edge: ['ashburn', 'dublin', 'sydney']
          });
          
          await newDevice.register();
          const conn = await newDevice.connect({
            params: { 
              To: phoneNumber,
              MediaStream: true,
            },
            rtcConfiguration: { 
              sdpSemantics: "unified-plan",
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
              ]
            },
            audio: {
              echoCancellation: true,
              autoGainControl: true,
              noiseSuppression: true
            }
          } as any);

          setConnection(conn);
          setCallStatus("initiating");

          conn.on('connect', () => {
            const callSid = conn.parameters.CallSid;
            console.log("CallSid:", callSid);
          });

          conn.on('accept', () => {
            console.log("✅ Call accepted");
            const Sid = conn.parameters.CallSid;
            console.log("CallSid recupéré", Sid);
            setCallSid(Sid);
            // Set call details in global state
            AIAssistantAPI.setCallDetails(Sid, agentId);
            setCallStatus("active");

            // Wait a moment for the media stream to be ready
            setTimeout(() => {
              const stream = conn.getRemoteStream();
              console.log("mediaStream:", stream);
              
              if (stream) {
                try {
                  // Create an audio context to process the stream
                  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
                  const audioContext = new AudioContextClass();
                  setAudioContext(audioContext);
                  const source = audioContext.createMediaStreamSource(stream);
                  
                  // Create audio analyzer to monitor audio levels
                  const analyzer = audioContext.createAnalyser();
                  analyzer.fftSize = 2048;
                  source.connect(analyzer);

                  let isCallActive = true;
                  let cleanupInitiated = false;

                  const getLanguageFromPhoneNumber = (phone: string): string => {
                    if (phone.startsWith('+33') || phone.startsWith('0033')) {
                      return 'fr-FR';
                    } else if (phone.startsWith('+212') || phone.startsWith('00212')) {
                      return 'ar-MA';
                    } else if (phone.startsWith('+34') || phone.startsWith('0034')) {
                      return 'es-ES';
                    } else if (phone.startsWith('+49') || phone.startsWith('0049')) {
                      return 'de-DE';
                    } else {
                      return 'en-US'; // Default to English
                    }
                  };

                  const cleanup = async () => {
                    if (cleanupInitiated) return;
                    cleanupInitiated = true;
                    console.log("🧹 Starting cleanup...");
                    
                    isCallActive = false;
                    
                    // Close WebSocket first
                    if (ws?.readyState === WebSocket.OPEN) {
                      console.log("🔌 Closing WebSocket connection...");
                      ws.close(1000, "Call ended normally");
                    }

                    // Wait a bit for WebSocket to close cleanly
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Then cleanup audio
                    try {
                      console.log("🎵 Cleaning up audio resources...");
                      if (analyzer) {
                        analyzer.disconnect();
                      }
                      if (source) {
                        source.disconnect();
                      }
                      if (audioProcessor) {
                        audioProcessor.disconnect();
                      }
                      if (audioContext) {
                        await audioContext.close();
                      }
                    } catch (error) {
                      console.error("❌ Error during audio cleanup:", error);
                    }

                    console.log("✅ Cleanup complete");
                  };

                  // Initialize WebSocket connection for streaming audio to backend
                  // Use Env var or fallback
                  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002/speech-to-text'; 
                  // Note: Assuming external WS server is used as Next.js API routes don't support WS well.
                  console.log('Connecting to WebSocket URL:', wsUrl);
                  
                  const newWs = new WebSocket(wsUrl);
                  setWs(newWs);
                  let newAudioProcessor: AudioWorkletNode | null = null;

                  newWs.onopen = async () => {
                    if (!isCallActive) {
                      console.log("Call no longer active, closing new WebSocket connection");
                      newWs.close(1000, "Call already ended");
                      return;
                    }

                    console.log('🔌 WebSocket connection established for speech-to-text');
                    try {
                      // Create audio worklet for processing after WebSocket is ready
                      // Assuming audio-processor.js is in public folder
                      await audioContext.audioWorklet.addModule('/audio-processor.js');
                      newAudioProcessor = new AudioWorkletNode(audioContext, 'audio-processor', {
                        numberOfInputs: 1,
                        numberOfOutputs: 1,
                        channelCount: 1,
                        processorOptions: {
                          sampleRate: audioContext.sampleRate
                        }
                      });
                      setAudioProcessor(newAudioProcessor);
                      
                      source.connect(newAudioProcessor);
                      newAudioProcessor.connect(audioContext.destination);

                      // Send configuration message
                      const config = {
                        config: {
                          encoding: 'LINEAR16',
                          sampleRateHertz: audioContext.sampleRate,
                          languageCode: getLanguageFromPhoneNumber(phoneNumber),
                          enableAutomaticPunctuation: true,
                          model: 'phone_call',
                          useEnhanced: true,
                          audioChannelCount: 1,
                          enableWordConfidence: true,
                          enableSpeakerDiarization: true,
                          diarizationConfig: {
                            enableSpeakerDiarization: true,
                            minSpeakerCount: 2,
                            maxSpeakerCount: 2
                          },
                          enableAutomaticLanguageIdentification: true,
                          alternativeLanguageCodes: ['en-US', 'fr-FR', 'ar-MA', 'es-ES', 'de-DE'],
                          interimResults: true,
                          singleUtterance: false
                        }
                      };
                      
                      console.log('📝 Sending speech recognition config:', config);
                      newWs.send(JSON.stringify(config));

                      // Handle audio data from worklet
                      newAudioProcessor.port.onmessage = (event) => {
                        if (newWs.readyState === WebSocket.OPEN && isCallActive) {
                          try {
                            const audioData = event.data;
                            if (!(audioData instanceof ArrayBuffer)) {
                              return;
                            }

                            // Convert to 16-bit PCM
                            const view = new DataView(audioData);
                            const pcmData = new Int16Array(audioData.byteLength / 2);
                            for (let i = 0; i < pcmData.length; i++) {
                              pcmData[i] = view.getInt16(i * 2, true);
                            }
                            
                            // Send audio data
                            try {
                              newWs.send(pcmData.buffer);
                            } catch (wsError) {
                              console.error('❌ WebSocket send error:', wsError);
                            }
                          } catch (error) {
                            console.error('❌ Error processing audio data:', error);
                          }
                        }
                      };

                      // Start monitoring audio levels
                      const monitorAudio = () => {
                        if (!isCallActive) return;
                        
                        const dataArray = new Float32Array(analyzer.frequencyBinCount);
                        analyzer.getFloatTimeDomainData(dataArray);
                        
                        const { rms } = analyzeAudio(dataArray);
                        
                        if (isCallActive) {
                          requestAnimationFrame(monitorAudio);
                        }
                      };
                      monitorAudio();

                    } catch (error) {
                      console.error('❌ Error initializing audio worklet:', error);
                    }
                  };

                  newWs.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                  };

                  newWs.onclose = (event) => {
                    console.log('WebSocket connection closed:', event.code, event.reason);
                  };

                  newWs.onmessage = handleWebSocketMessage;

                  // Set up cleanup for call end
                  conn.on("disconnect", async () => {
                
                    console.log("❌ Call disconnected - Starting cleanup and save process");
                   
                    const currentCallSid = conn.parameters.CallSid;
                    onEnd();
                    try {
                      await cleanup();
                      console.log("✅ Cleanup completed, proceeding to save call details");

                      // Save call details using global state
                      if (currentCallSid) {
                        await AIAssistantAPI.saveCallToDB();
                        console.log("✅ Successfully saved call details to DB");
                        if (onCallSaved) {
                          onCallSaved();
                        }
                      }
                    } catch (error) {
                      console.error("❌ Error during cleanup or save:", error);
                    } finally {
                       setCallStatus("ended"); 
                    }
                  });

                  return () => {
                    cleanup();
                  };

                } catch (error) {
                  console.error('Error initializing audio processing:', error);
                }
              } else {
                console.error("No media stream available - Make sure media permissions are granted");
              }
            }, 1000);
          });

        }
      } catch (err) {
        console.error("Error initiating call:", err);
        setError('Failed to initiate call');
        onEnd();
      }
    };

    initiateCall();
  }, [phoneNumber, onEnd, agentId, provider]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === 'active') {
      timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMuteToggle = () => {
    if (provider === 'qalqul' ? qalqulSDK : connection) {
      if (provider === 'qalqul') {
        // manageMuteCall(calls[calls.length - 1]);
      } else {
        connection?.mute(!isMuted);
      }
      setIsMuted(!isMuted);
    }
  };

  const handleAudioToggle = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleEndCall = async () => {
    try {
      console.log("🔴 Manual call end initiated");
      
      AIAssistantAPI.setCallEnded(true);
      
      if (localStream) {
        localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      setCallStatus('ended');

      if (provider === 'qalqul') {
        // manageHangupCall
      } else if (connection) {
        connection.disconnect();
      }
      
      onEnd();
    } catch (error) {
      console.error('❌ Error ending call:', error);
      onEnd();
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-xl font-semibold mb-2">{phoneNumber}</div>
        <div className="text-gray-500">{formatDuration(duration)}</div>
        {callStatus === 'initiating' && (
          <div className="text-blue-600">Initiating call...</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleMuteToggle}
          className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6 mx-auto" /> : <Mic className="w-6 h-6 mx-auto" />}
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 text-white"
        >
          <Phone className="w-6 h-6 mx-auto transform rotate-135" />
        </button>
        <button
          onClick={handleAudioToggle}
          className={`p-4 rounded-full ${!isAudioEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {isAudioEnabled ? (
            <Volume2 className="w-6 h-6 mx-auto" />
          ) : (
            <VolumeX className="w-6 h-6 mx-auto" />
          )}
        </button>
      </div>

      <div className="text-sm text-gray-500">
        {callStatus === 'active' ? 'Call in progress...' : 'Connecting...'}
      </div>
    </div>
  );
}

