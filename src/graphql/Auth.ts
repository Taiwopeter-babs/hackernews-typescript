import { extendType, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { APP_SECRET } from '../utils/auth';


export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string('token');
        t.nonNull.field('user', {
            type: 'User'
        })
    },
});


// signup
export const AuthMutationSignUp = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('signup', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg()),
            },

            async resolve(parent, args, context) {
                const {email, name} = args;

                const password = await bcrypt.hash(args.password, 10);

                const user = await context.prisma.user.create({
                    data: {
                        email, name, password
                    }
                });

                const token = jwt.sign({userId: user.id}, APP_SECRET);

                return {
                    token, user
                }
            }
        });
        t.nonNull.field('login', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },

            async resolve(parent, args, context) {
                const {email, password} = args;


                const user = await context.prisma.user.findUnique({
                    where: {
                        email: email
                    }
                });

                if (!user) throw new Error('User not found');

                const isValid = await bcrypt.compare(password, user.password);

                if (!isValid) throw new Error('Invalid credentials');

                const token = jwt.sign({userId: user.id}, APP_SECRET);

                return {
                    token, user
                }
            }
        })
    },
    
})