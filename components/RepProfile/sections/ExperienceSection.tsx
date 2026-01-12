import React, { useState } from 'react';

interface Experience {
  title: string;
  company: string;
  startDate: string | Date;
  endDate: string | Date;
  responsibilities: string[];
}

interface ExperienceSectionProps {
  experiences: Experience[];
  onUpdate: (experiences: Experience[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    responsibilities: ['']
  });

  const handleAddExperience = () => {
    onUpdate([...experiences, newExperience]);
    setIsAdding(false);
    setNewExperience({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        responsibilities: ['']
    });
  };

  const handleRemoveExperience = (index: number) => {
    const updated = experiences.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  const formatDate = (date: string | Date) => {
      if (!date) return '';
      if (date === 'present') return 'Present';
      return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex justify-between items-center">
        <span>Experience</span>
        <button 
            onClick={() => setIsAdding(true)}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
        >
            + Add Position
        </button>
      </h3>
      
      {isAdding && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Job Title" 
                    className="p-2 border rounded"
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Company" 
                    className="p-2 border rounded"
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  />
                  <input 
                    type="date" 
                    placeholder="Start Date" 
                    className="p-2 border rounded"
                    value={newExperience.startDate as string}
                    onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                  />
                  <input 
                    type="date" 
                    placeholder="End Date" 
                    className="p-2 border rounded"
                    value={newExperience.endDate as string}
                    onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                  />
              </div>
              <div className="flex justify-end gap-2">
                  <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-gray-600">Cancel</button>
                  <button onClick={handleAddExperience} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
              </div>
          </div>
      )}

      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
            <button 
                onClick={() => handleRemoveExperience(index)}
                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                Remove
            </button>
            <h4 className="font-semibold text-lg">{exp.title}</h4>
            <p className="text-gray-600">{exp.company} | {formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
            <ul className="list-disc list-inside mt-2 text-gray-700 text-sm">
                {exp.responsibilities?.map((resp, i) => (
                    <li key={i}>{resp}</li>
                ))}
            </ul>
          </div>
        ))}
        {experiences.length === 0 && !isAdding && (
            <p className="text-gray-500 italic">No experience listed.</p>
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;

