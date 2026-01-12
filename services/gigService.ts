import Gig from '../models/Gig';
import dbConnect from '../lib/db/mongodb';
import mongoose from 'mongoose';

// Import related models to ensure they are registered
import '../models/Activity';
import '../models/Country';
import '../models/Currency';
import '../models/Industry';
import '../models/Language';
import '../models/Sector';
import '../models/Skill';
import '../models/Timezone';
import '../models/User';
import '../models/Company';

class GigService {
  async createGig(gigData: any) {
    await dbConnect();
    try {
      const newGig = new Gig(gigData);
      await newGig.save();
      return newGig;
    } catch (error: any) {
      console.error("Error in createGig:", error);
      if (error.name === "ValidationError") {
        throw new Error("Validation failed: " + Object.values(error.errors).map((err: any) => err.message).join(", "));
      }
      throw new Error("Failed to create Gig");
    }
  }

  async getAllGigs() {
    await dbConnect();
    try {
      return await Gig.find()
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
    } catch (error) {
      console.error("Error in getAllGigs:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  async getGigById(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const gig = await Gig.findById(id)
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId');
      
      if (!gig) {
        throw new Error("Gig not found");
      }
      return gig;
    } catch (error) {
      console.error("Error in getGigById:", error);
      throw error;
    }
  }

  async updateGig(id: string, updateData: any) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const updatedGig = await Gig.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedGig) {
        throw new Error("Gig not found");
      }

      return updatedGig;
    } catch (error) {
      console.error("Error in updateGig:", error);
      throw error;
    }
  }

  async deleteGig(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const deletedGig = await Gig.findByIdAndDelete(id);
      if (!deletedGig) {
        throw new Error("Gig not found");
      }
      return deletedGig;
    } catch (error) {
      console.error("Error in deleteGig:", error);
      throw error;
    }
  }

  async getGigsByUserId(userId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid User ID format");
      }

      const gigs = await Gig.find({ userId })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      return gigs;
    } catch (error) {
      console.error("Error in getGigsByUserId:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  async getGigsByCompanyId(companyId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new Error("Invalid Company ID format");
      }

      const gigs = await Gig.find({ companyId })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      return gigs;
    } catch (error) {
      console.error("Error in getGigsByCompanyId:", error);
      throw new Error("Failed to retrieve gigs");
    }
  }

  async getActiveGigs() {
    await dbConnect();
    try {
      return await Gig.find({ status: 'active' })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId');
    } catch (error) {
      console.error("Error in getActiveGigs:", error);
      throw new Error("Failed to retrieve active gigs");
    }
  }

  async getGigDetailsById(id: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid Gig ID format");
      }

      const gig = await Gig.findById(id)
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language')
        .populate('companyId');
      
      if (!gig) {
        throw new Error("Gig not found");
      }
      return gig;
    } catch (error) {
      console.error("Error in getGigDetailsById:", error);
      throw new Error("Failed to retrieve gig details");
    }
  }

  async getLastGigByCompanyId(companyId: string) {
    await dbConnect();
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new Error("Invalid Company ID format");
      }

      const lastGig = await Gig.findOne({ companyId })
        .sort({ createdAt: -1 })
        .populate('sectors')
        .populate('activities')
        .populate('industries')
        .populate('destination_zone')
        .populate('availability.time_zone')
        .populate('commission.currency')
        .populate('team.territories')
        .populate('skills.professional.skill')
        .populate('skills.technical.skill')
        .populate('skills.soft.skill')
        .populate('skills.languages.language');
      
      return lastGig;
    } catch (error) {
      console.error("Error in getLastGigByCompanyId:", error);
      throw new Error("Failed to retrieve last gig");
    }
  }
}

export default new GigService();



