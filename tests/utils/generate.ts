import faker from 'faker';
import { Test } from 'supertest';
import { Types } from 'mongoose';
import base64url from 'base64url';
import { merge } from 'lodash';
import { PHOTO_ID_STATUS, REFERENCE_STATUS } from '../../constants';
import {
  User,
  Volunteer,
  Student,
  StudentRegistrationForm,
  VolunteerRegistrationForm,
  Reference,
  Availability,
  DAYS,
  HOURS,
  Certifications
} from './types';

export const getEmail = faker.internet.email;
export const getFirstName = faker.name.firstName;
export const getLastName = faker.name.lastName;
export const getId = faker.random.uuid;

const generateReferralCode = (userId): string =>
  base64url(Buffer.from(userId, 'hex'));

export const buildStudent = (overrides = {}): Student => {
  const firstName = getFirstName();
  const lastName = getLastName();
  const _id = Types.ObjectId();
  const student = {
    _id,
    email: getEmail().toLowerCase(),
    firstName,
    lastName,
    firstname: firstName,
    lastname: lastName,
    highSchoolId: '23456789',
    password: 'Password123',
    zipCode: '11201',
    studentPartnerOrg: 'example',
    referredByCode: '',
    referralCode: generateReferralCode(_id.toString()),
    ...overrides
  };

  return student;
};

export const buildVolunteer = (overrides = {}): Volunteer => {
  const firstName = getFirstName();
  const lastName = getLastName();
  const _id = Types.ObjectId();
  const volunteer = {
    _id,
    email: getEmail().toLowerCase(),
    firstName,
    lastName,
    firstname: firstName,
    lastname: lastName,
    password: 'Password123',
    zipCode: '11201',
    referredByCode: '',
    college: 'Columbia University',
    phone: '+12345678910',
    referralCode: generateReferralCode(_id.toString()),
    isApproved: false,
    ...overrides
  };

  return volunteer;
};

export const buildStudentRegistrationForm = (
  overrides = {}
): StudentRegistrationForm => {
  const student = buildStudent();
  const form = {
    terms: true,
    ...student,
    ...overrides
  };

  return form;
};

export const buildVolunteerRegistrationForm = (
  overrides = {}
): VolunteerRegistrationForm => {
  const volunteer = buildVolunteer();
  const form = {
    terms: true,
    ...volunteer,
    ...overrides
  };

  return form;
};

export const buildReference = (overrides = {}): Partial<Reference> => {
  const referenceFirstName = getFirstName();
  const referenceLastName = getLastName();
  const referenceEmail = getEmail();
  const reference = {
    _id: Types.ObjectId(),
    firstName: referenceFirstName,
    lastName: referenceLastName,
    email: referenceEmail,
    ...overrides
  };

  return reference;
};

export const buildReferenceForm = (overrides = {}): Partial<Reference> => {
  const randomNumToSix = (): number => Math.floor(Math.random() * 6) + 1;
  const randomNumToFive = (): number => Math.floor(Math.random() * 5) + 1;
  const form = {
    affiliation: faker.lorem.word(),
    relationshipLength: faker.lorem.word(),
    rejectionReason: faker.lorem.word(),
    additionalInfo: faker.lorem.sentence(),
    patient: randomNumToSix(),
    positiveRoleModel: randomNumToSix(),
    agreeableAndApproachable: randomNumToSix(),
    communicatesEffectively: randomNumToSix(),
    trustworthyWithChildren: randomNumToFive(),
    status: REFERENCE_STATUS.SUBMITTED,
    ...overrides
  };

  return form;
};

export const buildReferenceWithForm = (overrides = {}): Partial<Reference> => {
  const data = {
    ...buildReferenceForm(),
    ...buildReference(),
    ...overrides
  };

  return data;
};

export const buildPhotoIdData = (overrides = {}): Partial<Volunteer> => {
  const data = {
    photoIdS3Key: getId(),
    photoIdStatus: PHOTO_ID_STATUS.SUBMITTED,
    ...overrides
  };

  return data;
};

export const buildBackgroundInfo = (overrides = {}): Partial<Volunteer> => {
  const data = {
    occupation: ['An undergraduate student'],
    experience: {
      collegeCounseling: 'No prior experience',
      mentoring: '1-2 years',
      tutoring: '0-1 years'
    },
    languages: ['Spanish'],
    country: 'United States of America',
    state: 'New York',
    city: 'New York City',
    ...overrides
  };

  return data;
};

export const buildAvailability = (overrides = {}): Availability => {
  const availability = {} as Availability;
  for (const day in DAYS) {
    availability[DAYS[day]] = {};
    for (const hour in HOURS) {
      availability[DAYS[day]][HOURS[hour]] = false;
    }
  }

  const mergedAvailability = merge(availability, overrides);

  return mergedAvailability;
};

export const buildCertifications = (overrides = {}): Certifications => {
  const certifications = {
    prealgebra: { passed: false, tries: 0 },
    algebra: { passed: false, tries: 0 },
    geometry: { passed: false, tries: 0 },
    trigonometry: { passed: false, tries: 0 },
    precalculus: { passed: false, tries: 0 },
    calculus: { passed: false, tries: 0 },
    integratedMathOne: { passed: false, tries: 0 },
    integratedMathTwo: { passed: false, tries: 0 },
    integratedMathThree: { passed: false, tries: 0 },
    integratedMathFour: { passed: false, tries: 0 },
    applications: { passed: false, tries: 0 },
    essays: { passed: false, tries: 0 },
    planning: { passed: false, tries: 0 },
    biology: { passed: false, tries: 0 },
    chemistry: { passed: false, tries: 0 },
    physicsOne: { passed: false, tries: 0 },
    ...overrides
  };

  return certifications;
};

export const authLogin = (agent, { email, password }: Partial<User>): Test =>
  agent
    .post('/auth/login')
    .set('Accept', 'application/json')
    .send({ email, password });
