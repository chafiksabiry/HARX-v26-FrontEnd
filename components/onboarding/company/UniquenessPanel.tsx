import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ArrowRight,
  Loader2,
  LucideProps,
} from "lucide-react";
import type { CompanyProfile, UniquenessCategory } from "@/lib/company/api";
import { generateUniquenessCategories } from "@/lib/company/api";
import { DifferentiatorsPanel } from "./DifferentiatorsPanel";

interface Props {
  profile: CompanyProfile;
  onBack: () => void;
}

export function UniquenessPanel({ profile, onBack }: Props) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [categories, setCategories] = useState<UniquenessCategory[]>([]);
  const [showDifferentiators, setShowDifferentiators] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate categories when component mounts
  useEffect(() => {
    generateCategories();
  }, [profile]);

  const generateCategories = async () => {
    setIsGenerating(true);
    try {
      const generatedCategories = await generateUniquenessCategories(profile);
      setCategories(generatedCategories);
    } catch (error) {
      console.error("Failed to generate categories:", error);
      // Show error state instead of fallback
      setCategories([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleSave = (field: string) => {
    const [categoryIndex, fieldType, detailIndex] = field.split(".");
    const newCategories = [...categories];
    const category = newCategories[parseInt(categoryIndex)];

    if (fieldType === "title") {
      category.title = tempValue;
    } else if (fieldType === "description") {
      category.description = tempValue;
    } else if (fieldType === "details") {
      category.details[parseInt(detailIndex)] = tempValue;
    }

    setCategories(newCategories);
    setEditingField(null);
  };

  const EditableField = ({
    value,
    field,
    icon: Icon,
    type = "text",
    className = "",
  }: {
    value: string;
    field: string;
    icon?: React.ComponentType<LucideProps>;
    type?: string;
    className?: string;
  }) => {
    // Champs multi-lignes : description, details et companyIntro
    const isMultiline = field === 'companyIntro' || field.endsWith('.description') || field.includes('.details.');
    
    // Helper to render icon safely
    const renderIcon = (IconComp: React.ComponentType<LucideProps> | undefined) => {
      if (!IconComp) return null;
      // Use any to bypass the prop type mismatch
      const IconElement = IconComp as any;
      return <IconElement size={18} className="text-gray-600" />;
    };
    
    return (
      <div className={`group relative ${className}`}>
        {editingField === field ? (
          <div className="flex items-center gap-2 w-full">
            {isMultiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full min-h-16 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 resize-y"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSave(field);
                  if (e.key === "Escape") setEditingField(null);
                }}
                autoFocus
                onBlur={() => handleSave(field)}
              />
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave(field);
                  if (e.key === "Escape") setEditingField(null);
                }}
                autoFocus
                onBlur={() => handleSave(field)}
              />
            )}
          </div>
        ) : (
          <div 
            className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 border border-transparent hover:bg-gray-50 transition-colors"
            onClick={() => handleEdit(field, value)}
            title="Click to edit"
          >
            {renderIcon(Icon)}
            <span className={!value ? 'text-gray-400 italic' : ''}>{value || 'Click to edit...'}</span>
          </div>
        )}
      </div>
    );
  };

  if (showDifferentiators) {
    return (
      <DifferentiatorsPanel
        profile={profile}
        onBack={() => setShowDifferentiators(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-full flex items-center justify-between mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to Profile</span>
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h1>
              <p className="text-gray-500 mt-1">{profile.industry}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDifferentiators(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl flex items-center gap-2 mb-2"
          >
            Next: Choose Differentiators
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Overview */}
          <section className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Partner With Us?
            </h2>
            <div className="flex justify-center">
              <div className="w-full">
                <EditableField
                  value={profile.companyIntro || "Loading..."}
                  field="companyIntro"
                  className="text-lg text-gray-600 leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                <p className="text-gray-600">Generating unique features for {profile.name}...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No categories generated. Please try again.</p>
                <button
                  onClick={generateCategories}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Generate Categories
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      {category.icon && <category.icon className="text-indigo-600" size={24} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <EditableField
                          value={category.title}
                          field={`${index}.title`}
                          className="text-xl font-bold text-gray-900"
                        />
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < category.score
                                  ? "bg-indigo-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <EditableField
                        value={category.description}
                        field={`${index}.description`}
                        className="text-gray-600 mb-4"
                      />
                      <ul className="space-y-2">
                        {category.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            {category.icon && (
                                <category.icon
                                size={14}
                                className="text-indigo-500 flex-shrink-0"
                                />
                            )}
                            <EditableField
                              value={detail}
                              field={`${index}.details.${i}`}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}


