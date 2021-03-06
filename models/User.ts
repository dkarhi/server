import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import config from '../config';
import { USER_BAN_REASON } from '../constants';

const schemaOptions = {
  /**
   * https://mongoosejs.com/docs/discriminators.html#discriminator-keys
   * The discriminator key is used to discern the different inherited models. The value of the disciminatorKey
   * is the property that is added to a model and resolves to that type of model e.g:
   * new Student()   --> type: "Student"
   * new Volunteer() --> type: "Volunteer"
   *
   **/
  discriminatorKey: 'type',
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

// baseUserSchema is a base schema that the Student and Volunteer schema inherit from
const baseUserSchema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v): boolean {
          return validator.isEmail(v);
        },
        message: '{VALUE} is not a valid email'
      }
    },
    password: {
      type: String,
      select: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    firstname: {
      type: String,
      required: [true, 'First name is required.']
    },
    lastname: {
      type: String,
      required: [true, 'Last name is required.']
    },

    // User type (volunteer or student)
    isVolunteer: {
      type: Boolean,
      default: false
    },

    isAdmin: {
      type: Boolean,
      default: false
    },

    isBanned: {
      type: Boolean,
      default: false
    },

    banReason: {
      type: String,
      enum: [
        USER_BAN_REASON.NON_US_SIGNUP,
        USER_BAN_REASON.BANNED_IP,
        USER_BAN_REASON.SESSION_REPORTED,
        USER_BAN_REASON.BANNED_SERVICE_PROVIDER
      ],
      select: false
    },

    /**
     * Test users are used to make help requests on production without bothering actual volunteers.
     * A student test user making a help request will only notify volunteer test users.
     */
    isTestUser: {
      type: Boolean,
      default: false
    },

    /*
     * Fake Users are real, fully functional accounts that we decide not to track because they've been
     * identified as accounts that aren't actual students/volunteers; just people trying out the service.
     */
    isFakeUser: {
      type: Boolean,
      default: false
    },

    isDeactivated: {
      type: Boolean,
      default: false
    },

    pastSessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],

    partnerUserId: {
      type: String,
      select: false
    },

    lastActivityAt: { type: Date, default: Date.now },

    referralCode: { type: String, unique: true },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      select: false
    },

    ipAddresses: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IpAddress' }],
      default: [],
      select: false
    },

    // This field is created from the value set for the discriminatorKey.
    // Added to help migrate existing users to also have this field.
    type: {
      type: String
    }
  },
  schemaOptions
);

baseUserSchema.methods.hashPassword = async function(
  password
): Promise<Error | string> {
  try {
    const salt = await bcrypt.genSalt(config.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error(error);
  }
};

baseUserSchema.statics.verifyPassword = (
  candidatePassword,
  userPassword
): Promise<Error | boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, userPassword, (error, isMatch) => {
      if (error) {
        return reject(error);
      }

      return resolve(isMatch);
    });
  });
};

const User = mongoose.model('User', baseUserSchema);

module.exports = User;
export default User;
