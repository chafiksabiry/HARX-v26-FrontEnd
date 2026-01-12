// Text processing utilities

export interface BasicInfo {
  name: string;
  email: string;
  languages: string[];
  certifications: string[];
  skills: string[];
}

export const extractBasicInfo = (text: string | null | undefined): BasicInfo => {
  if (!text || typeof text !== 'string') {
    return {
      name: '',
      email: '',
      languages: [],
      certifications: [],
      skills: []
    };
  }

  const patterns = {
    name: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    languages: /\b(Arabic|English|French|Spanish|German|Italian|Portuguese|Russian|Chinese|Japanese|Korean)\b/gi,
    certifications: /(Certified|Certification|Certificate)\s[^.,\n]+/g,
    skills: /(?:Technical Skills|Skills|Competencies|Expertise):\s*([^]*?)(?:\n\n|\n[A-Z]|$)/i
  };

  const matches: BasicInfo = {
    name: (text.match(patterns.name) || [''])[0],
    email: (text.match(patterns.email) || [''])[0],
    languages: [...new Set((text.match(patterns.languages) || []).map(lang => lang.toLowerCase()))],
    certifications: (text.match(patterns.certifications) || []).filter(cert => cert.length < 100), // Filter out unreasonably long matches
    skills: []
  };

  // Extract skills section and split into individual skills
  const skillsMatch = text.match(patterns.skills);
  if (skillsMatch && skillsMatch[1]) {
    matches.skills = skillsMatch[1]
      .split(/[,;\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && skill.length < 50); // Filter out empty and unreasonably long skills
  }

  return matches;
};

export const chunkText = (text: string | null | undefined, maxLength: number = 12000): string[] => {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text provided to chunkText');
    return [];
  }
  
  try {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed maxLength
      if ((currentChunk + paragraph).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        
        // If a single paragraph is too long, split it by sentences
        if (paragraph.length > maxLength) {
          const sentences = paragraph.split(/(?<=[.!?])\s+/)
            .filter(s => s.trim().length > 0);
          
          currentChunk = '';
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength) {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
              }
              // If a single sentence is too long, split it by words
              if (sentence.length > maxLength) {
                const words = sentence.split(/\s+/);
                let wordChunk = '';
                for (const word of words) {
                  if ((wordChunk + word).length > maxLength) {
                    if (wordChunk) {
                      chunks.push(wordChunk.trim());
                    }
                    wordChunk = word;
                  } else {
                    wordChunk += (wordChunk ? ' ' : '') + word;
                  }
                }
                if (wordChunk) {
                  currentChunk = wordChunk;
                }
              } else {
                currentChunk = sentence;
              }
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    // Validate chunks
    return chunks.filter(chunk => {
      const isValid = chunk && typeof chunk === 'string' && chunk.trim().length > 0;
      if (!isValid) {
        console.warn('Invalid chunk detected and filtered out');
      }
      return isValid;
    });
  } catch (error) {
    console.error('Error in chunkText:', error);
    return [];
  }
};

export const safeJSONParse = (text: string | null | undefined): any => {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid input provided to safeJSONParse');
    return null;
  }

  try {
    // Try to find JSON-like content within the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON-like content found in text');
      return null;
    }

    const jsonContent = jsonMatch[0];
    const parsed = JSON.parse(jsonContent);
    
    // Validate the parsed object has the expected structure
    const requiredFields = ['personalInfo', 'professionalSummary', 'skills'];
    const missingFields = requiredFields.filter(field => !parsed[field]);
    
    if (missingFields.length > 0) {
      console.warn(`Parsed JSON missing required fields: ${missingFields.join(', ')}`);
      return null;
    }
    
    // Ensure all arrays are properly initialized
    const ensureArray = (obj: any, path: string) => {
      const value = path.split('.').reduce((o, key) => o?.[key], obj);
      if (!Array.isArray(value)) {
        const parts = path.split('.');
        const parent = parts.slice(0, -1).reduce((o, key) => o[key], obj);
        const key = parts.pop();
        if (parent && key) parent[key] = [];
      }
    };

    [
      'personalInfo.languages',
      'professionalSummary.industries',
      'professionalSummary.keyExpertise',
      'professionalSummary.notableCompanies',
      'skills.technical',
      'skills.professional',
      'skills.soft',
      'achievements'
    ].forEach(path => ensureArray(parsed, path));
    
    return parsed;
  } catch (err) {
    console.warn('Failed to parse JSON:', err);
    return null;
  }
};

export const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> => {
  if (typeof operation !== 'function') {
    throw new Error('Operation must be a function');
  }

  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();
      if (result === undefined || result === null) {
        throw new Error('Operation returned null or undefined');
      }
      return result;
    } catch (err: any) {
      lastError = err;
      console.warn(`Retry attempt ${i + 1} failed:`, err);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
};

