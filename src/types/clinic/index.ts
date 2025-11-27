import { Types } from "mongoose";

export type AddressType = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};


export type ClinicType = {
  id: string;
  name: string;
  userId: Types.ObjectId;
  address: AddressType;
  phones: string[];
  emails: string[];
  website?: string;
};

// {
//     "id": "0",
//     "role": "admin",
//     "displayName": "Abbott Keitch",
//     "photoURL": "/assets/images/avatars/brian-hughes.jpg",
//     "email": "admin@fusetheme.com",
//     "settings": {
//         "layout": {},
//         "theme": {}
//     },
//     "shortcuts": [
//         "apps.calendar",
//         "apps.mailbox",
//         "apps.contacts"
//     ]
// }

// {
//     "user": {
//         "id": "0",
//         "role": "admin",
//         "displayName": "Abbott Keitch",
//         "photoURL": "/assets/images/avatars/brian-hughes.jpg",
//         "email": "admin@fusetheme.com",
//         "settings": {
//             "layout": {},
//             "theme": {}
//         },
//         "shortcuts": [
//             "apps.calendar",
//             "apps.mailbox",
//             "apps.contacts"
//         ]
//     },
//     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4NzgzNjMsImlzcyI6IkZ1c2UiLCJleHAiOjE3NjQ0ODMxNjMsImlkIjoiMCJ9.gLqrfnB4JyZMwiaQudnL4RMfGmpZ9-5AeLwD3AETm-E"
// }