# Firestore Security Spec

## 1. Data Invariants
- A `UserAppState` document must have a `userId` matching the document ID and the authenticated user's ID.
- Only the owner (the user whose `uid` matches the `userId`) can read or write their own document in the `users` collection.
- The `updatedAt` field must be a valid ISO string or server timestamp.
- Arrays should have reasonable limits to avoid excessive document size.

## 2. The "Dirty Dozen" Payloads
1. Unauthorized Read: Unauthenticated user attempts to read `/users/alice`.
2. Unauthorized Write: Unauthenticated user attempts to create `/users/alice`.
3. Identity Spoofing (Create): User `bob` attempts to create `/users/alice`.
4. Identity Spoofing (Update): User `bob` attempts to update `/users/alice`.
5. Shadow Field (Create): User `alice` creates their doc with an extra field `isAdmin: true`.
6. Shadow Field (Update): User `alice` updates their doc with an extra field `isAdmin: true`.
7. Type Poisoning: User `alice` sets `clients` to a string instead of an array.
8. ID Poisoning: User attempts to create a document with a massive ID.
9. Array Overflow: User `alice` attempts to store 10,000 tasks in the array. (Preventing Denial of Wallet).
10. Immutable Field Modification: User `alice` attempts to change `userId`.
11. Blank ID: User attempts to write to an empty string ID.
12. Valid Access: User `alice` creates and reads their own document correctly.
