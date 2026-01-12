"use client";

import React, { useState } from "react";
import { ArrowLeft, CheckCircle, Brain, Briefcase, Globe2, Clock, DollarSign, Award, Users } from "lucide-react";
import { GigSuggestion } from "../../types/gigs";

interface SuggestionsProps {
  input: string;
  onBack: () => void;
  onConfirm: (suggestions: GigSuggestion) => void;
  initialSuggestions?: GigSuggestion | null;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ input, onBack, onConfirm, initialSuggestions }) => {
  const [suggestions, setSuggestions] = useState<GigSuggestion | null>(initialSuggestions || null);

  if (!suggestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Generating suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900">AI Suggestions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="flex items-center text-lg font-semibold mb-4 text-blue-700">
            <Briefcase className="w-5 h-5 mr-2" />
            Job Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Recommended Title</label>
              <div className="mt-1 p-3 bg-blue-50 rounded-lg text-blue-900">
                {suggestions.jobTitles?.[0] || suggestions.selectedJobTitle || "No title generated"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                {suggestions.description}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <div className="mt-1 p-2 bg-purple-50 text-purple-700 rounded-lg inline-block text-sm">
                {suggestions.category}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="flex items-center text-lg font-semibold mb-4 text-emerald-700">
            <Globe2 className="w-5 h-5 mr-2" />
            Schedule & Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Region</label>
              <div className="mt-1 p-3 bg-emerald-50 rounded-lg text-emerald-900">
                {suggestions.destinationZones?.[0] || "Global"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time Zone</label>
              <div className="mt-1 p-3 bg-emerald-50 rounded-lg text-emerald-900">
                {suggestions.availability?.time_zone || suggestions.schedule?.time_zone || "Flexible"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flexibility</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {(suggestions.availability?.flexibility || []).map((flex, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {flex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="flex items-center text-lg font-semibold mb-4 text-amber-700">
            <DollarSign className="w-5 h-5 mr-2" />
            Commission
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <div className="mt-1 font-semibold text-gray-900">
                  {suggestions.commission?.currency || "EUR"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Amount</label>
                <div className="mt-1 font-semibold text-gray-900">
                  {suggestions.commission?.baseAmount || 0}
                </div>
              </div>
            </div>
            {suggestions.commission?.bonusAmount ? (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-amber-800 font-medium">Bonus: </span>
                <span className="text-amber-900">{suggestions.commission.bonusAmount}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="flex items-center text-lg font-semibold mb-4 text-purple-700">
            <Award className="w-5 h-5 mr-2" />
            Required Skills
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {(suggestions.skills?.languages || []).map((lang: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {lang.language} ({lang.proficiency})
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
              <div className="flex flex-wrap gap-2">
                {(suggestions.skills?.technical || []).map((skill: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {typeof skill.skill === 'string' ? skill.skill : (skill.skill?.name || 'Unknown')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-4 z-10">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(suggestions)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

