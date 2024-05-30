import { objectType, extendType, nonNull, stringArg, intArg, idArg, nullable, inputObjectType, enumType, arg, list } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";
import { Prisma } from "@prisma/client";

// SDL Link type
export const Link = objectType({
    name: 'Link',
    definition(t) {
        t.nonNull.int('id'),
        t.nonNull.string('description'),
        t.nonNull.string('url'),
        t.nonNull.dateTime("createdAt"),
        t.field('author', {
            type: 'User',
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({where: {id: parent.id}})
                    .author();
            }
        }),
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id }})
                    .voters();
            }
        })
    } 
});

// SDL Feed type
export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", {type: Link}),
        t.nonNull.int("count"),
        t.id('id')
    },
})

// enum query input
export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"]
});

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", {type: Sort}),
        t.field("url", {type: Sort}),
        t.field("createdAt", {type: Sort})

    },
})

// get all links
export const LinkQuery = extendType({
    type: 'Query',
    definition(t) {
        t.nonNull.field('feed', {
            type: 'Feed',
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) })
            },
            async resolve(parent, args, context, info) {

                const {filter, skip, take, orderBy} = args;

                const whereQuery: Prisma.LinkWhereInput = filter
                    ? {
                        OR: [
                            {description: {contains: filter}},
                            {url: {contains: filter}}
                        ]
                    }
                    : {};

                const links = await context.prisma.link.findMany({
                    where: whereQuery,
                    skip: skip as number | undefined,
                    take: take as number | undefined,
                    orderBy: orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined
                });

                const count = await context.prisma.link.count({where: whereQuery});
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id
                }

            }
        });
    }
});

// find one link
export const LinkQueryOne = extendType({
    type: 'Query',
    definition(t) {
        t.nullable.field('link', {
            type: 'Link',
            args: {
                id: nonNull(idArg())
            },
            resolve(parent, args, context, info) {
                const {id} = args;

                const link = context.prisma.link.findUnique({
                    where: {
                        id: Number(id)
                    }
                });

                return link;
            }
        })
    }
});

// create link
export const LinkMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('post', {
            type: 'Link',
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },
            resolve(parent, args, context) {
                const {description, url} = args;
                const {userId} = context;

                if (!userId) {
                    throw new Error('Cannot post without authorization');
                }

                const newLink = context.prisma.link.create({
                    data: {
                        description: description,
                        url: url,
                        author: {connect: {id: userId}}
                    }
                });

                return newLink;
            }
        })
    },
});

// update a link
export const LinkMutationUpdate = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('updateLink', {
            type: 'Link',
            args: {
                id: nonNull(idArg()),
                description: nullable(stringArg()),
                url: nullable(stringArg())
            },
            resolve(parent, args, context) {
                const {id, description, url} = args;

                const idInt = Number(id);

                const link = context.prisma.link.update({
                    where: {
                        id: idInt
                    },
                    data: {
                        description: description!,
                        url: url!
                    }
                });
                
                return link;
            }
        })
    },
});

// delete a link
export const LinkMutationDelete = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('deleteLink', {
            type: 'Link',
            args: {
                id: nonNull(idArg()),
            },
            resolve(parent, args, context) {
                const {id} = args;

                const idInt = Number(id);

                const deletedLink = context.prisma.link.delete({
                    where: {
                        id: idInt
                    },
                });

                return deletedLink;
                
            }
        })
    },
})