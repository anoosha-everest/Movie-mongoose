import mongoose from "mongoose";
import { Movie } from "./schema";
import { Critic } from "./schema";
import { User } from "./schema";
import nconf from 'nconf';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

nconf.file('config', { file: path.resolve(__dirname, 'config.json') });

async function readCSVMovies(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const csvStream = csvParser();
    fileStream
      .pipe(csvStream)
      .on('data', async (data: any) => {
        try {
          await Movie.findOneAndUpdate(
            { movieTitle: data.movieTitle }, 
            data,
            { upsert: true, new: true }  // Insert if not exists, update if exists
          );
        } catch (err) {
          console.error('Error updating/inserting document:', err);
        }
      })
      .on('end', () => {
        console.log('Movies data has been processed and inserted/updated in the database');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error processing movies CSV data:', error);
        reject(error);
      });
  });
}

async function readCSVCritics(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const csvStream = csvParser();
    fileStream
      .pipe(csvStream)
      .on('data', async (data: any) => {
        try {
          const movie = await Movie.findOne({ movieId: data.movieId });
          if (!movie) {
            throw new Error(`Movie with movieId ${data.movieId} not found`);
          }
          const critic:any = {
            reviewId: data.reviewId,
            scoreSentiment:data.scoreSentiment,
            movieId:movie._id,
            creationDate:data.creationDate,
            criticName:data.criticName,
            criticPageUrl:data.criticPageUrl,
            reviewState:data.reviewState,
            isFresh:isBoolean(data.isFresh),
            isRotten:isBoolean(data.isRotten),
            isRtUrl:isBoolean(data.isRtUrl),
            isTopCritic:isBoolean(data.isTopCritic),
            publicationUrl:data.publicationUrl,
            publicationName:data.publicationName,
            reviewUrl:data.reviewUrl,
            originalScore:preprocessRating(data.originalScore)
          };
          await Critic.findOneAndUpdate(
            { reviewId: critic.reviewId }, 
            critic,
            { upsert: true, new: true }  // Insert if not exists, update if exists
          );
        } catch (err) {
          console.error('Error updating/inserting document:', err);
        }
      })
      .on('end', () => {
        console.log('Critics data has been processed and inserted/updated in the database');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error processing critics CSV data:', error);
        reject(error);
      });
  });
}

async function readCSVUsers(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const csvStream = csvParser();
    fileStream
      .pipe(csvStream)
      .on('data', async (data: any) => {
        try {
          const movie = await Movie.findOne({ movieId: data.movieId });
          if (!movie) {
            throw new Error(`Movie with movieId ${data.movieId} not found`);
          }
          const user:any = {
            movieId:movie._id,
            rating:data.rating,
            reviewId:data.reviewId,
            isVerified:isBoolean(data.isVerified),
            isSuperReviewer:isBoolean(data.isSuperReviewer),
            hasSpoilers:isBoolean(data.hasSpoilers),
            hasProfanity:isBoolean(data.hasProfanity),
            score:data.score,
            creationDate:data.creationDate,
            userDisplayName:data.userDisplayName,
            userRealm:data.userRealm,
            userId:data.userId,
          }
          await User.findOneAndUpdate(
            { movieId: user.movieId ,userId:user.userId,rating:user.rating,
              reviewId:user.reviewId,
              isVerified:user.isVerified,
              isSuperReviewer:user.isSuperReviewer,
              hasSpoilers:user.hasSpoilers,
              hasProfanity:user.hasProfanity,
              score:user.score,
              creationDate:user.creationDate,
              userDisplayName:user.userDisplayName,
              userRealm:user.userRealm},
            user,
            { upsert: true, new: true }  // Insert if not exists, update if exists
          );
        } catch (err) {
          console.error('Error updating/inserting document:', err);
        }
      })
      .on('end', () => {
        console.log('Users data has been processed and inserted/updated in the database');
        resolve();
      })
      .on('error', (error) => {
        console.error('Error processing critics User CSV data:', error);
        reject(error);
      });
  });
}
function isBoolean(bool:any){
  if(bool=="False"){
    return false;
  }
  else{
    return true;
  }
}

function preprocessFraction(fraction: any) {
  const [numerator, denominator] = fraction.split('/').map(Number);
  const result = (numerator / denominator) * 5;
  return result.toFixed(1);
}


function preprocessLetter(letter: any) {
  const mapping: any = {
    'A+': 5.0,
    'A': 4.5,
    'A-': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'B-': 2.5,
    'C+': 2.0,
    'C': 1.5,
    'C-': 1.0,
    'D+': 0.5,
    'D': 0.0,
    'D-': 0.0,
    'F': 0.0
  };
  return mapping[letter] || 0;
}

function preprocessRating(rating: any) {
  if (rating.includes('/')) {
    return preprocessFraction(rating);
  } else if (['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].includes(rating)) {
    return preprocessLetter(rating);
  } else {
    return 0;
  }
}

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb://localhost:27017/movies');
    console.log('MongoDB connected successfully!');
    const movieDataPath = nconf.get('movieDataPath');
    if (!movieDataPath) {
      throw new Error('movieDataPath must be specified in the config file');
    }
    await Movie.deleteMany();
    await readCSVMovies(movieDataPath);
    console.log("inserted movies");
    const criticDataPath = nconf.get('criticReviewDataPath');
    if (!criticDataPath) {
      throw new Error('criticDataPath must be specified in the config file');
    }
    await Critic.deleteMany();
    await readCSVCritics(criticDataPath);
    console.log("Inserted Critics");  
    const userDataPath = nconf.get('userReviewDataPath');
    if (!userDataPath) {
      throw new Error('userDataPath must be specified in the config file');
    }
    // await User.deleteMany();
    // await readCSVUsers(userDataPath);
    console.log("Inserted Users"); 
    const mov="The Philadelphia Story";
    const id:any=await Movie.find({movieTitle:mov});
     const anu=id[0]._id;
    const ratingFrequencies = await Critic.aggregate([
      {
        $match: { movieId: anu }},
      {
        $group: {
          _id: '$originalScore',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          rating: '$_id',
          frequency: '$count',
          _id: 0
        }
      },
      {
        $sort: { rating: 1 }
      }
    ]);
    console.log(`${mov} Rating Frequencies:`,ratingFrequencies);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

connectToDatabase();