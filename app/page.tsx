"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Building2, Users, ArrowRight, Headphones, PhoneCall, MessagesSquare, Phone, HeadphonesIcon, Target } from 'lucide-react';
import { WelcomeMessage } from '@/components/ChoicePage/WelcomeMessage';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeType, setWelcomeType] = useState<'company' | 'rep' | null>(null);

  const handleShowWelcome = (type: 'company' | 'rep') => {
    setWelcomeType(type);
    setShowWelcome(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div 
        className="h-[50vh] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-[43rem] w-full p-1">
            {/* Logo HARX Rectangulaire */}
            <div className="overflow-hidden rounded-2xl mb-1 mt-0 mx-auto inline-block">
              <Image 
                src="/harx-blanc.jpg" 
                alt="HARX Logo" 
                width={320}
                height={128}
                className="w-64 h-32 md:w-80 md:h-[7rem] object-contain drop-shadow-2xl transition-all duration-300"
                priority
              />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight text-shadow-lg">
              Transform Your Contact Center
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed text-shadow">
              Connect with opportunities or find the perfect talent for your customer service needs
            </p>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {/* Company Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 card-hover">
            <div className="h-40 rounded-t-2xl relative overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80" 
                alt="Modern office" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                  Post a Gig
                </h2>
                <p className="text-gray-200 text-base drop-shadow-md">
                  For companies seeking customer service talent
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <HeadphonesIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Customer Service Representatives</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <PhoneCall className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Telesales Professionals</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <MessagesSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Live Chat Support Agents</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Technical Support Specialists</span>
                </div>
              </div>
              <button 
                onClick={() => handleShowWelcome('company')}
                className="mt-4 w-full flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:from-blue-700 group-hover:to-blue-800"
              >
                Post a Gig
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Professional Card */}
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 card-hover">
            <div className="h-40 rounded-t-2xl relative overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80" 
                alt="Customer service professional" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                  Find Gigs
                </h2>
                <p className="text-gray-200 text-base drop-shadow-md">
                  For contact center professionals
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Work with Leading Companies</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Remote Opportunities Available</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <Headphones className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Flexible Scheduling Options</span>
                </div>
                <div className="flex items-center text-gray-700 hover:text-gray-900 transition-colors">
                  <div className="p-1 bg-blue-100 rounded-lg mr-2">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-sm">Join Professional Communities</span>
                </div>
              </div>
              <button 
                onClick={() => handleShowWelcome('rep')}
                className="mt-4 w-full flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group-hover:from-blue-700 group-hover:to-blue-800"
              >
                Find Gigs
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Looking for something specific? Our team is here to help you find the perfect match and guide you through the process.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWelcome && welcomeType && (
        <WelcomeMessage
          type={welcomeType}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}
