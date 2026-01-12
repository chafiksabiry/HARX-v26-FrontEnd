import Cookies from "js-cookie";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
const deploymentMode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'standalone';

export interface CompanyProfile {
  _id?: string;
  userId: string;
  name: string;
  logo?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  overview: string;
  mission?: string;
  companyIntro?: string;
  culture: {
    values: string[];
    benefits: string[];
    workEnvironment: string;
  };
  opportunities: {
    roles: string[];
    growthPotential: string;
    training: string;
    roles_list?: string[];
  };
  technology: {
    stack: string[];
    innovation: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface UniquenessCategory {
  title: string;
  icon: any; // Using any for React component type to avoid import issues
  description: string;
  score: number;
  details: string[];
}

export const searchCompanyLogo = async (
  companyName: string,
  companyWebsite?: string
): Promise<string | null> => {
  console.log('🔍 [Frontend] Searching company logo:', { companyName, companyWebsite });
  
  try {
    const response = await fetch(`${apiUrl}/openai/search-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName,
        companyWebsite,
      }),
    });

    if (!response.ok) {
      console.error('❌ [Frontend] Logo search failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Frontend] Logo search response:', data);
    
    return data.success ? data.data.logoUrl : null;
  } catch (error) {
    console.error("💥 [Frontend] Backend Logo Search Error:", error);
    return null;
  }
};

export const generateCompanyProfile = async (
  companyInfo: string
): Promise<CompanyProfile> => {
  console.log('🏢 [Frontend] Generating company profile:', { 
    companyInfo: companyInfo.substring(0, 100) + '...' 
  });

  let userId: string;
  
  if (deploymentMode === 'standalone') {
    userId = '681a91212c1ca099fe2b17df'; // Default ID for dev
  } else {
    const cookieUserId = Cookies.get("userId");
    if (!cookieUserId) {
      throw new Error("User ID not found in cookies. Please ensure you are logged in.");
    }
    userId = cookieUserId;
  }

  console.log('👤 [Frontend] Using userId:', userId);

  try {
    const response = await fetch(`${apiUrl}/openai/generate-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyInfo,
        userId,
      }),
    });

    if (!response.ok) {
      console.error('❌ [Frontend] Profile generation failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Frontend] Profile generation response:', {
      success: data.success,
      hasData: !!data.data,
      companyName: data.data?.name,
      industry: data.data?.industry,
      dataKeys: data.data ? Object.keys(data.data) : []
    });

    if (!data.success) {
      throw new Error(data.message || 'Failed to generate company profile');
    }

    return data.data;
  } catch (error) {
    console.error("💥 [Frontend] Backend API Error:", error);
    throw new Error("Failed to generate company profile");
  }
};

export async function generateCompanyIntro(profile: CompanyProfile): Promise<string> {
  try {
    return profile.companyIntro || "Error generating text";
  } catch (error) {
    console.error("Company intro error:", error);
    return "Error generating text";
  }
}

export async function generateUniquenessCategories(profile: CompanyProfile): Promise<UniquenessCategory[]> {
  console.log('⭐ [Frontend] Generating uniqueness categories for:', {
    companyName: profile.name,
    industry: profile.industry
  });

  try {
    const response = await fetch(`${apiUrl}/openai/generate-uniqueness`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile,
      }),
    });

    if (!response.ok) {
      console.error('❌ [Frontend] Uniqueness generation failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Frontend] Uniqueness generation response:', {
      success: data.success,
      categoriesCount: data.data?.length || 0,
      rawCategories: data.data?.map((cat: any) => ({
        title: cat.title,
        icon: cat.icon,
        score: cat.score
      })) || []
    });

    if (!data.success) {
      throw new Error(data.message || 'Failed to generate uniqueness categories');
    }

    // Import des icônes Lucide React
    const { 
      Award,
      Globe2,
      DollarSign,
      TrendingUp,
      Rocket,
      Users,
      ShieldCheck,
      Zap,
    } = await import("lucide-react");

    // Mapping des icônes
    const iconMap: { [key: string]: any } = {
      Award: Award,
      Globe2: Globe2,
      DollarSign: DollarSign,
      TrendingUp: TrendingUp,
      Rocket: Rocket,
      Users: Users,
      ShieldCheck: ShieldCheck,
      Zap: Zap,
    };

    // Transformer les données pour inclure les vraies icônes
    const transformedCategories = data.data.map((category: any) => ({
      title: category.title,
      description: category.description,
      score: category.score,
      details: category.details,
      icon: iconMap[category.icon] || Award, // Default to Award if icon not found
    }));

    return transformedCategories;
  } catch (error) {
    console.error("💥 [Frontend] Backend API Error:", error);
    throw new Error("Failed to generate uniqueness categories");
  }
}

export const createCompanyProfile = async (
  profileData: CompanyProfile
): Promise<CompanyProfile> => {
  console.log('💾 [Frontend] Creating company profile:', {
    companyName: profileData.name,
    industry: profileData.industry
  });

  try {
    const response = await fetch(`${apiUrl}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      console.error('❌ [Frontend] Profile creation failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Frontend] Profile creation response:', {
      success: data.success,
      companyName: data.data?.name,
      companyId: data.data?._id
    });

    if (!data.success) {
      throw new Error(data.message || 'Failed to create company profile');
    }

    return data.data;
  } catch (error) {
    console.error("💥 [Frontend] Profile creation error:", error);
    throw new Error("Failed to create company profile");
  }
};

export const updateCompanyProfile = async (
  companyId: string,
  profileData: Partial<CompanyProfile>
): Promise<CompanyProfile> => {
  console.log('💾 [Frontend] Updating company profile:', {
    companyId,
    fieldsToUpdate: Object.keys(profileData)
  });

  try {
    const response = await fetch(`${apiUrl}/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      console.error('❌ [Frontend] Profile update failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [Frontend] Profile update response:', {
      success: data.success,
      companyName: data.data?.name,
      updatedFields: Object.keys(profileData)
    });

    if (!data.success) {
      throw new Error(data.message || 'Failed to update company profile');
    }

    return data.data;
  } catch (error) {
    console.error("💥 [Frontend] Profile update error:", error);
    throw new Error("Failed to update company profile");
  }
};



