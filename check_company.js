
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env vars
const envLocalPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function checkCompany() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const companySchema = new mongoose.Schema({
        name: String,
    }, { strict: false }); // Use strict false to just read whatever is there

    // Force collection name 'companies' just in case
    const Company = mongoose.models.Company || mongoose.model('Company', companySchema, 'companies');

    const targetId = '6830839c641398dc582eb897';
    console.log(`Checking for company with ID: ${targetId}`);

    const company = await Company.findById(targetId);
    
    if (company) {
      console.log('✅ Company found:', company);
    } else {
      console.log('❌ Company NOT found.');
      
      console.log('Listing first 5 companies to check IDs:');
      const companies = await Company.find().limit(5);
      companies.forEach(c => console.log(`- ${c._id}: ${c.name}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkCompany();

