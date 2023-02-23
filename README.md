# Backend Challenge

## Preamble

Please remember the cost this submission may have on my midterm grades. ECE 106 midterm looks less passable by the day.

I would also like to point out that a lot of the code here is shit. I have other things to do. If you want to see something better, I have [https://github.com/talentmaker/api](https://github.com/talentmaker/api).

Finally, this stuff is bare minimum, complying with the given spec of the challenge (expect for the tests). For example, users does not have full CRUD support, only reading and updating.

Also, no Docker setup. No time for that.

Some bare-minimum tests are in the `__tests__` directory. They demonstrate usage.

## What It's Made of

-   Prisma ORM
-   MySQL
-   Jest for tests
-   Typescript for source, Javascript everywhere else
-   GraphQL (first time, it's quite nice)
-   Express
-   Pothos (Prisma integration)

Pretty simple, bog-standard app that took forever to set up.

## Running

I'll try to get Docker set up later.

## Queries

### All Users

```graphql
query {
    allUsers {
        name
        company
        email
        phone
    }
}
```

### One User

```graphql
query {
    user(id: USER_ID) {
        name
        company
        phone
        email
        skills {
            skill
            rating(userId: USER_ID) # I couldn't figure out a good way around this
            frequency
        }
    }
}
```

### Skills

```graphql
query {
    skills(minFrequency: NUMBER, maxFrequency: NUMBER) {
        skill
        frequency
    }
}
```

## Mutations

### Update User

```graphql
mutation {
    # Data fields optional, of course
    updateUser(userId: 1, data: {phone: PHONE, company: COMPANY, email: EMAIL}) {
        name
        company
        phone
        email
    }
}
```

## Next Steps

Theoretical, of course

-   idk, like everything
-   Full CRUD support
-   Collect code coverage
-   More tests
-   Split some bigger files up
