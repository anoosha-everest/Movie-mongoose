import mongoose,{Schema} from "mongoose";
import { required } from "nconf";


const movieSchema=new Schema({
    movieId:{
        type:String,
        unique:true,
        required:true,
    },
    movieTitle:{
        type:String,
        unique:true,
        required:true,
    },
    movieYear:{
        type:Number,
        required:true,
    },
    movieURL:{
        type:String,
        unique:true,
        required:true,
    },
    movieRank:{
        type:Number,
        required:true,
    },
    critic_score:{
        type:String,
        required:true,
    },
    audience_score:{
        type:String,
        required:true,
    }
});


enum state{
    fresh="fresh",
    rotten="rotten"
}
enum score{
    POSITIVE='POSITIVE',
    NEGATIVE='NEGATIVE'
}
const criticSchema = new mongoose.Schema({
  reviewId:{
    type:Number,
    unique:true,
    required:true,
  },
  creationDate:{
    type:Date,
    required:true,
  },
  criticName:{
    type:String,
  },
  criticPageUrl:{
    type:String,
  },
  reviewState:{
    type:Object.values(state),
    required:true,
  },
  isFresh:{
    type:Boolean,
    required:true,
  },
  isRotten:{
    type:Boolean,
    required:true,
  },
  isRtUrl:{
    type:Boolean,
  },
  isTopCritic:{
    type:Boolean,
    required:true,
  },
  publicationUrl:{
    type:String,
    required:true,
  },
  publicationName:{
    type:String,
    required:true,
  },
  reviewUrl:{
    type:String,
  },
  scoreSentiment:{
    type:Object.values(score),
    required:true,
  },
  originalScore:{
    type:String,
  },
  movieId:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:"Movie",
  }
});

const userSchema= new mongoose.Schema({
    movieId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Movie"
    },
    rating:{
        type:Number,
        required:true,
    },
    reviewId:{
        type:String,
    },
    isVerified:{
        type:Boolean,
        required:true,
    },
    isSuperReviewer:{
        type:Boolean,
        required:true,
    },
    hasSpoilers:{
        type:Boolean,
        required:true,
    },
    hasProfanity:{
        type:Boolean,
        required:true,
    },
    score:{
        type:Number,
        required:true,
    },
    creationDate:{
        type:Date,
        required:true,
    },
    userDisplayName:{
        type:String,
    },
    userRealm:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
    }
});

export const User=mongoose.model('User',userSchema);

export const Critic = mongoose.model('Critic', criticSchema);

export const Movie = mongoose.model('Movie', movieSchema);
