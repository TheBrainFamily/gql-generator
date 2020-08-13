---
id: understanding-types
title: Understanding Types
---

Mapping that happens in the `codegen.js` file allows us to expect that a Query/Mutation returning a given type returns all fields that are based on the intrinsic data of that object. Other fields will be treated as `computed`, meaning - they will need their own resolvers.

To demonstrate this with an example, let's take the type User from [Quick Start](quickstart.md)

```graphql
type User @entity {
  id: ID! @column
  name: String! @column
  dateOfBirth: Number! @column
  underage: Boolean
}
```

Note that we annotate it with @entity. Fields that come straight from a Data Source is marked with @column. In our example those are `name`, `dataOfBirth` and `id`

On the other hand - we don't save the information whether someone is or is not underage - we calculate it runtime (no annotation). That means that the resolver for Query like this:

```graphql
type Query {
  UserById(id: ID!): User!
}
```

will only expect to have the user name and dateOfBirth as it's return type. To speak in code:

```typescript
// Correct, sufficient
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
    dateOfBirth: 1597154923818,
  };
};

// Incorrect, TypeScript will error:
//  Property 'dateOfBirth' is missing in type '{ name: string; }' but required in type 'UserDbObject'.
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
  };
};

// Technically correct, but will be overrulled by the underageResolver
export const UserById: QueryResolvers['UserById'] = (_, args) => {
  return {
    id: 'id',
    name: 'Lukasz',
    dateOfBirth: 1597154923818,
    underage: true,
  };
};
```

Generator will also generate a resolver for User.underage to return a boolean based on the current date and the users dateOfBirth.

> If you are following along from the Quick Start make sure you've modified your User type definition and run `npm run graphl:generateAll`. At that point you will notice src/modules/Users/graphql/types/UserUnderage.ts file with a test scaffold next to it. As a practice go ahead and implement it, starting with test!

```typescript
export const UserUnderage: UserResolvers['underage'] = (user) => {
  return isUnderage(user.dateOfBirth, new Date());
};
```

This might seem like a rarely used feature at first, but it works the same way when you want to link different types (which itself is one of the main reasons to use GraphQL in the first place).

```graphql
type User @entity {
  # ...
  friends: [User!]!
}
```

```typescript
export const UserFriends: UserResolvers['friends'] = (user, args, context) => {
  return context.friendsService.fetchFriendsFor(user.id);
};
```
