require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');
const Test = require('./models/Test');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gk-neet';

const questionsData = [
  // Physics
  { subject: 'Physics', text: 'The unit of thermal conductivity is:', options: ['J m K^-1', 'J m^-1 K^-1', 'W m K^-1', 'W m^-1 K^-1'], correctAnswerIndex: 3 },
  { subject: 'Physics', text: 'If the kinetic energy of a free electron doubles, its de-Broglie wavelength changes by the factor:', options: ['1/sqrt(2)', 'sqrt(2)', '1/2', '2'], correctAnswerIndex: 0 },
  { subject: 'Physics', text: 'In a full wave rectifier circuit operating from 50 Hz mains frequency, the fundamental frequency in the ripple would be:', options: ['50 Hz', '100 Hz', '25 Hz', '70.7 Hz'], correctAnswerIndex: 1 },
  // Chemistry
  { subject: 'Chemistry', text: 'Which of the following is an amphoteric oxide?', options: ['V2O5', 'CrO', 'Cr2O3', 'MnO'], correctAnswerIndex: 0 },
  { subject: 'Chemistry', text: 'The number of d-electrons in Fe2+ (Z = 26) is not equal to the number of electrons in which one of the following?', options: ['d-electrons in Fe (Z = 26)', 'p-electrons in Ne (Z = 10)', 's-electrons in Mg (Z = 12)', 'p-electrons in Cl (Z = 17)'], correctAnswerIndex: 3 },
  { subject: 'Chemistry', text: 'Which of the following molecules has a zero dipole moment?', options: ['NH3', 'H2O', 'CO2', 'SO2'], correctAnswerIndex: 2 },
  // Botany
  { subject: 'Botany', text: 'Water soluble pigments found in plant cell vacuoles are:', options: ['Chlorophylls', 'Carotenoids', 'Anthocyanins', 'Xanthophylls'], correctAnswerIndex: 2 },
  { subject: 'Botany', text: 'In kranz anatomy, the bundle sheath cells have:', options: ['thin walls, many intercellular spaces and no chloroplasts', 'thick walls, no intercellular spaces and large number of chloroplasts', 'thin walls, no intercellular spaces and several chloroplasts', 'thick walls, many intercellular spaces and few chloroplasts'], correctAnswerIndex: 1 },
  { subject: 'Botany', text: 'Which one of the following is not a gaseous biogeochemical cycle in ecosystem?', options: ['Nitrogen cycle', 'Carbon cycle', 'Sulphur cycle', 'Phosphorus cycle'], correctAnswerIndex: 3 },
  // Zoology
  { subject: 'Zoology', text: 'Which of the following is an occupational respiratory disorder?', options: ['Anthracis', 'Silicosis', 'Botulism', 'Emphysema'], correctAnswerIndex: 1 },
  { subject: 'Zoology', text: 'Blood pressure in the mammalian aorta is maximum during:', options: ['Systole of the left ventricle', 'Diastole of the right atrium', 'Systole of the left atrium', 'Diastole of the right ventricle'], correctAnswerIndex: 0 },
  { subject: 'Zoology', text: 'Which of the following gastric cells indirectly help in erythropoiesis?', options: ['Chief cells', 'Mucous cells', 'Goblet cells', 'Parietal cells'], correctAnswerIndex: 3 }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Clear existing
    await Question.deleteMany({});
    await Test.deleteMany({});

    // Insert questions
    const createdQuestions = await Question.insertMany(questionsData);
    const questionIds = createdQuestions.map(q => q._id);

    // Create Test
    const test = new Test({
      title: 'NEET Full Mock Test 1 - PYQs',
      description: 'A realistic NEET mock test containing Previous Year Questions.',
      duration: 180, // 3 hours
      totalMarks: questionsData.length * 4,
      questions: questionIds
    });
    await test.save();

    console.log('Successfully seeded database with real NEET questions and test.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
