require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github');
const bcrypt = require('bcrypt');
const { ObjectID } = require('mongodb');

module.exports = function (app, myDatabase) {
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, doc);
        });
    });

    passport.use(
        new LocalStrategy((username, password, done) => {
            myDatabase.findOne({ username: username }, (err, user) => {
                console.log(`User ${username} attempted to log in.`);
                if (err) {
                    console.log('Auth Error.');
                    return done(err);
                }
                if (!user) {
                    console.log('No user found.');
                    return done(null, false);
                }
                if (!bcrypt.compareSync(password, user.password)) {
                    console.log('Incorrect Password.');
                    return done(null, false);
                }
                console.log('All good.');
                return done(null, user);
            });
        })
    );

    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL:
                    'https://b709-5-89-116-142.ngrok-free.app/auth/github/callback',
            },
            (accessToken, refreshToken, profile, cb) => {
                myDatabase.findOneAndUpdate(
                    { id: profile.id },
                    {
                        $setOnInsert: {
                            id: profile.id,
                            username: profile.username,
                            name: profile.displayName || 'John Doe',
                            photo: profile.photos[0].value || '',
                            email: Array.isArray(profile.emails)
                                ? profile.emails[0].value
                                : 'No public email',
                            created_on: new Date(),
                            provider: profile.provider || '',
                        },
                        $set: {
                            last_login: new Date(),
                        },
                        $inc: {
                            login_count: 1,
                        },
                    },
                    { upsert: true, new: true },
                    (err, doc) => {
                        return cb(null, doc.value);
                    }
                );
            }
        )
    );
};
