import type { Situation } from './types';

/**
 * Situation catalog. Titles, difficulty and duration come from the design
 * handoff (RP-1 lists). The RP-2 detail copy the handoff specifies — one per
 * category, plus the featured situations — is reproduced verbatim; the rest is
 * written to the same copy rules (US English, contractions, second person,
 * three goals, verb-first buttons).
 */
export const situations: Situation[] = [
  // ── Featured (the unfiltered browse list and the home rail) ───────────────
  {
    id: 'cafe-order',
    categoryId: 'shopping',
    title: 'Ordering at a café',
    difficulty: 'Easy',
    minutes: 8,
    place: 'Café',
    featured: true,
    progress: { completed: 7, total: 8, percent: 88 },
    detail: {
      situation:
        "You stop by a café before class. Order a drink, say whether you're staying, and pick a size.",
      aiRole: 'Barista',
      aiRoleDescription: 'Takes your order and asks follow-up questions',
      goals: [
        'Order one drink clearly',
        'Say whether it’s to go or for here',
        'Answer the size question',
      ],
    },
  },
  {
    id: 'pharmacy-symptoms',
    categoryId: 'clinic',
    title: 'Symptoms at the pharmacy',
    difficulty: 'Hard',
    minutes: 8,
    place: 'Pharmacy',
    featured: true,
    progress: { completed: 1, total: 4, percent: 25 },
    detail: {
      situation:
        "You've caught a cold and stop by a pharmacy. Describe your symptoms, get a recommendation, and buy the medicine.",
      aiRole: 'Pharmacist',
      aiRoleDescription: 'Asks politely and checks your symptoms',
      goals: [
        'Describe at least two symptoms',
        'Ask how to take the medicine',
        'End the conversation politely',
      ],
    },
  },
  {
    id: 'restaurant-order',
    categoryId: 'shopping',
    title: 'Ordering food at a restaurant',
    difficulty: 'Easy',
    minutes: 6,
    place: 'Restaurant',
    featured: true,
    detail: {
      situation:
        'You sit down at a small restaurant at lunchtime. Order for one, ask about the side dishes, and ask for the check.',
      aiRole: 'Server',
      aiRoleDescription: 'Takes your order and explains the menu',
      goals: [
        'Order one dish and a drink',
        'Ask one question about the menu',
        'Ask for the check politely',
      ],
    },
  },

  // ── Shopping ─────────────────────────────────────────────────────────────
  {
    id: 'shopping-size',
    categoryId: 'shopping',
    title: 'Asking for a size',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation:
        "You like a shirt but it doesn't fit. Ask for another size and try it on.",
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Checks the stock and suggests sizes',
      goals: ['Say which size you need', 'Ask to try it on', 'Say what you decided'],
    },
  },
  {
    id: 'shopping-refund',
    categoryId: 'shopping',
    title: 'Requesting a refund',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        "The shirt you bought yesterday doesn't fit. Show the receipt, explain why and complete the refund.",
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Explains the refund policy and asks why',
      goals: [
        'Explain why you want a refund',
        'Ask them to check the receipt and payment',
        'Close the request politely',
      ],
    },
  },
  {
    id: 'shopping-exchange',
    categoryId: 'shopping',
    title: 'Asking about an exchange',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation:
        'You want a different color of the same item. Ask whether an exchange is possible and how long it takes.',
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Explains what can be exchanged and when',
      goals: [
        'Say what you want to exchange it for',
        'Ask what you need to bring',
        'Confirm the date you can pick it up',
      ],
    },
  },
  {
    id: 'shopping-discount',
    categoryId: 'shopping',
    title: 'Asking about a discount',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation:
        'A sign says the sale ends today. Ask what the discount covers and how much you pay.',
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Explains the sale and the final price',
      goals: [
        'Ask which items are on sale',
        'Ask what the final price is',
        'Say how you want to pay',
      ],
    },
  },
  {
    id: 'shopping-delivery',
    categoryId: 'shopping',
    title: 'Requesting delivery',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation:
        "The box is too big to carry. Ask for delivery, give your address, and check when it'll arrive.",
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Takes your address and explains the fee',
      goals: ['Ask for delivery', 'Give your address clearly', 'Ask when it arrives'],
    },
  },
  {
    id: 'shopping-stock',
    categoryId: 'shopping',
    title: 'Checking color stock',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation:
        "The color you want isn't on the shelf. Ask whether it's in stock and what else they have.",
      aiRole: 'Shop assistant',
      aiRoleDescription: 'Checks the stock room and offers options',
      goals: [
        'Name the color you want',
        'Ask them to check the stock room',
        'Ask them to hold it for you',
      ],
    },
  },

  // ── Clinic ───────────────────────────────────────────────────────────────
  {
    id: 'clinic-symptoms',
    categoryId: 'clinic',
    title: 'Describing symptoms',
    difficulty: 'Hard',
    minutes: 8,
    detail: {
      situation:
        'You visit a clinic with cold symptoms. Explain when it started and what you feel, step by step.',
      aiRole: 'Doctor',
      aiRoleDescription: 'Asks politely and checks your symptoms',
      goals: [
        'Name where it hurts and two symptoms',
        'Say when the symptoms started',
        'Ask the doctor to repeat and confirm',
      ],
    },
  },
  {
    id: 'clinic-reception',
    categoryId: 'clinic',
    title: 'Checking in at reception',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation:
        "It's your first visit. Give your name, fill in the form, and ask how long the wait is.",
      aiRole: 'Receptionist',
      aiRoleDescription: 'Takes your details and explains the wait',
      goals: [
        'Say it’s your first visit',
        'Give your name and phone number',
        'Ask how long the wait is',
      ],
    },
  },
  {
    id: 'clinic-appointment',
    categoryId: 'clinic',
    title: 'Booking an appointment',
    difficulty: 'Medium',
    minutes: 6,
    detail: {
      situation: 'You call to book a check-up. Suggest a day and time, then confirm it.',
      aiRole: 'Receptionist',
      aiRoleDescription: 'Offers open slots and confirms the booking',
      goals: [
        'Say what the appointment is for',
        'Suggest two times that work',
        'Repeat the booking back to confirm',
      ],
    },
  },
  {
    id: 'clinic-prescription',
    categoryId: 'clinic',
    title: 'Getting a prescription',
    difficulty: 'Medium',
    minutes: 6,
    detail: {
      situation:
        'You hand in your prescription. Ask how to take the medicine and what to avoid.',
      aiRole: 'Pharmacist',
      aiRoleDescription: 'Explains the dose and the side effects',
      goals: [
        'Hand over the prescription',
        'Ask how many times a day to take it',
        'Ask what you should avoid',
      ],
    },
  },
  {
    id: 'clinic-test',
    categoryId: 'clinic',
    title: 'Following test instructions',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        "You're getting a blood test. Follow what the nurse says and check anything you miss.",
      aiRole: 'Nurse',
      aiRoleDescription: 'Gives step-by-step instructions',
      goals: [
        'Say whether you ate this morning',
        'Ask them to repeat one instruction',
        'Ask when the results come out',
      ],
    },
  },
  {
    id: 'clinic-next-visit',
    categoryId: 'clinic',
    title: 'Booking your next visit',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'Treatment is over for today. Book the follow-up before you leave.',
      aiRole: 'Receptionist',
      aiRoleDescription: 'Suggests a follow-up date',
      goals: [
        'Ask when you should come back',
        'Pick a day that works for you',
        'Confirm the time and say thanks',
      ],
    },
  },

  // ── School ───────────────────────────────────────────────────────────────
  {
    id: 'school-professor',
    categoryId: 'school',
    title: 'Asking your professor',
    difficulty: 'Medium',
    minutes: 8,
    featured: true,
    detail: {
      situation:
        "After class you ask your professor about something you didn't catch. Organize the question and ask politely.",
      aiRole: 'Professor',
      aiRoleDescription: 'Answers formally and asks follow-ups',
      goals: [
        'Sum up your question in one sentence',
        'Say exactly what was unclear',
        'End with a thank-you',
      ],
    },
  },
  {
    id: 'school-registration',
    categoryId: 'school',
    title: 'Asking about registration',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation:
        'Course registration opens tomorrow. Ask the office what you need and when to do it.',
      aiRole: 'Office staff',
      aiRoleDescription: 'Explains the steps and the deadline',
      goals: [
        'Say which course you want',
        'Ask what documents you need',
        'Check the deadline',
      ],
    },
  },
  {
    id: 'school-group-project',
    categoryId: 'school',
    title: 'Planning a group project',
    difficulty: 'Hard',
    minutes: 10,
    detail: {
      situation:
        'Your team meets for the first time. Split the work, set a deadline, and agree on the next meeting.',
      aiRole: 'Classmate',
      aiRoleDescription: 'Suggests ideas and asks what you can take on',
      goals: [
        'Say which part you’ll take',
        'Suggest a deadline',
        'Agree on the next meeting',
      ],
    },
  },
  {
    id: 'school-absence',
    categoryId: 'school',
    title: 'Explaining an absence',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "You missed class because you were sick. Explain why and ask what you missed.",
      aiRole: 'Professor',
      aiRoleDescription: 'Asks why and tells you what to catch up on',
      goals: [
        'Say why you were absent',
        'Ask what you missed',
        'Ask whether you need a doctor’s note',
      ],
    },
  },
  {
    id: 'school-library',
    categoryId: 'school',
    title: 'Library questions',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "You can't find a book you need. Ask at the desk and borrow it.",
      aiRole: 'Librarian',
      aiRoleDescription: 'Looks up the book and explains the rules',
      goals: [
        'Give the title you’re looking for',
        'Ask how long you can keep it',
        'Ask where to return it',
      ],
    },
  },
  {
    id: 'school-grade',
    categoryId: 'school',
    title: 'Asking about a grade',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        "Your grade came out lower than you expected. Ask how it was scored, politely.",
      aiRole: 'Professor',
      aiRoleDescription: 'Explains the scoring and takes questions',
      goals: [
        'Say which assignment you mean',
        'Ask how the points were given',
        'Ask what to do better next time',
      ],
    },
  },

  // ── Transit ──────────────────────────────────────────────────────────────
  {
    id: 'transit-bus-directions',
    categoryId: 'transit',
    title: 'Asking directions on the bus',
    difficulty: 'Medium',
    minutes: 7,
    featured: true,
    detail: {
      situation:
        "You're not sure this bus goes where you need. Ask the driver and check where to get off.",
      aiRole: 'Bus driver',
      aiRoleDescription: 'Confirms the route and tells you the stop',
      goals: [
        'Say where you’re going',
        'Ask whether this bus goes there',
        'Ask which stop to get off at',
      ],
    },
  },
  {
    id: 'transit-transfer',
    categoryId: 'transit',
    title: 'Asking about a transfer',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: 'You need to change lines. Ask where to transfer and how long it takes.',
      aiRole: 'Station staff',
      aiRoleDescription: 'Explains the transfer and the direction',
      goals: [
        'Say which line you need',
        'Ask where to transfer',
        'Ask how long the trip takes',
      ],
    },
  },
  {
    id: 'transit-taxi',
    categoryId: 'transit',
    title: 'Telling a taxi where to go',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "You take a taxi across town. Give the address and ask when you'll get there.",
      aiRole: 'Taxi driver',
      aiRoleDescription: 'Repeats the address and describes the route',
      goals: [
        'Say the address clearly',
        'Asking how long it takes',
        'State how you will pay',
      ],
    },
  },
  {
    id: 'transit-card',
    categoryId: 'transit',
    title: 'Topping up a transit card',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'Your card is empty. Top it up at the convenience store counter.',
      aiRole: 'Store clerk',
      aiRoleDescription: 'Takes the card and confirms the amount',
      goals: [
        'Ask them to top up your card',
        'Say how much you want to add',
        'Check the balance afterward',
      ],
    },
  },
  {
    id: 'transit-train-ticket',
    categoryId: 'transit',
    title: 'Booking a train ticket',
    difficulty: 'Medium',
    minutes: 8,
    detail: {
      situation:
        "You're taking the KTX this weekend. Book a seat for the time you want.",
      aiRole: 'Ticket agent',
      aiRoleDescription: 'Checks the times and the seats left',
      goals: [
        'Say where and when you’re going',
        'Ask for a window or aisle seat',
        'Confirm the price and the platform',
      ],
    },
  },
  {
    id: 'transit-lost-items',
    categoryId: 'transit',
    title: 'Asking about lost items',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        'You left your bag on the subway. Report it and ask how to get it back.',
      aiRole: 'Lost and found staff',
      aiRoleDescription: 'Asks for details and explains the process',
      goals: [
        'Describe the bag and what’s in it',
        'Say which line and roughly when',
        'Ask how they’ll contact you',
      ],
    },
  },

  // ── Government ───────────────────────────────────────────────────────────
  {
    id: 'government-arc',
    categoryId: 'government',
    title: 'Applying for an ARC',
    difficulty: 'Hard',
    minutes: 12,
    detail: {
      situation:
        'You apply for your alien registration card. Have your documents checked and ask how long it takes.',
      aiRole: 'Immigration officer',
      aiRoleDescription: 'Checks documents and explains the steps',
      goals: [
        'State why you came in one sentence',
        'Ask them to check your documents',
        'Ask about processing time and pickup',
      ],
    },
  },
  {
    id: 'government-papers',
    categoryId: 'government',
    title: 'Getting papers at the local office',
    difficulty: 'Medium',
    minutes: 8,
    detail: {
      situation:
        'You need a residence certificate for a contract. Ask for it and pay the fee.',
      aiRole: 'Civil servant',
      aiRoleDescription: 'Finds the right form and takes the fee',
      goals: [
        'Say which document you need',
        'Say what it’s for',
        'Ask about the fee and the copies',
      ],
    },
  },
  {
    id: 'government-visa',
    categoryId: 'government',
    title: 'Asking about a visa extension',
    difficulty: 'Hard',
    minutes: 11,
    detail: {
      situation:
        'Your visa expires next month. Ask what you need and when to apply.',
      aiRole: 'Immigration officer',
      aiRoleDescription: 'Lists the documents and the deadline',
      goals: [
        'Say when your visa expires',
        'Ask which documents you need',
        'Ask when you should apply',
      ],
    },
  },
  {
    id: 'government-bank',
    categoryId: 'government',
    title: 'Opening a bank account',
    difficulty: 'Hard',
    minutes: 12,
    featured: true,
    place: 'Bank',
    detail: {
      situation:
        'You open your first account in Korea. Explain what you need it for and finish the paperwork.',
      aiRole: 'Bank teller',
      aiRoleDescription: 'Checks your ID and explains the account',
      goals: [
        'Say which account you want',
        'Hand over your ID and ARC',
        'Ask about transfer limits and the card',
      ],
    },
  },
  {
    id: 'government-parcel',
    categoryId: 'government',
    title: 'Sending a parcel at the post office',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: 'You send a box home. Pick a shipping option and pay.',
      aiRole: 'Postal clerk',
      aiRoleDescription: 'Weighs the box and compares the options',
      goals: [
        'Say where you’re sending it',
        'Ask which option is fastest',
        'Ask when it arrives and how to track it',
      ],
    },
  },
  {
    id: 'government-phone-plan',
    categoryId: 'government',
    title: 'Signing up for a phone plan',
    difficulty: 'Medium',
    minutes: 9,
    detail: {
      situation:
        'You want a plan with enough data. Compare two and sign up for one.',
      aiRole: 'Store clerk',
      aiRoleDescription: 'Compares plans and explains the contract',
      goals: [
        'Say how much data you use',
        'Ask what the monthly cost is',
        'Ask how to cancel later',
      ],
    },
  },

  // ── Part-time job ────────────────────────────────────────────────────────
  {
    id: 'job-interview',
    categoryId: 'part-time-job',
    title: 'Answering in an interview',
    difficulty: 'Hard',
    minutes: 10,
    detail: {
      situation:
        'You interview for a café job. Talk about your experience and availability, then ask a question.',
      aiRole: 'Café owner',
      aiRoleDescription: 'Asks about experience and availability',
      goals: [
        'Introduce yourself in three sentences',
        'Say which days and hours you can work',
        'Ask one question about the job',
      ],
    },
  },
  {
    id: 'job-shifts',
    categoryId: 'part-time-job',
    title: 'Arranging your shifts',
    difficulty: 'Medium',
    minutes: 8,
    detail: {
      situation:
        'Your class schedule changed. Ask to move two shifts and offer a swap.',
      aiRole: 'Manager',
      aiRoleDescription: 'Checks the schedule and looks for cover',
      goals: [
        'Say which shifts you can’t work',
        'Offer a day you can cover instead',
        'Confirm the new schedule',
      ],
    },
  },
  {
    id: 'job-customer',
    categoryId: 'part-time-job',
    title: 'Serving a customer',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation:
        'A customer asks for something you ran out of. Apologize and offer another option.',
      aiRole: 'Customer',
      aiRoleDescription: 'Asks questions and reacts to what you offer',
      goals: [
        'Greet them politely',
        'Say what’s sold out and apologize',
        'Offer one other option',
      ],
    },
  },
  {
    id: 'job-order',
    categoryId: 'part-time-job',
    title: 'Taking an order',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: "It's the lunch rush. Take an order and repeat it back.",
      aiRole: 'Customer',
      aiRoleDescription: 'Orders quickly and changes their mind once',
      goals: [
        'Ask what they’d like',
        'Repeat the order back',
        'Tell them the total and the wait',
      ],
    },
  },
  {
    id: 'job-pay',
    categoryId: 'part-time-job',
    title: 'Asking about pay',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        'Your pay came in lower than you expected. Ask about it calmly and sort it out.',
      aiRole: 'Manager',
      aiRoleDescription: 'Looks up your hours and explains the math',
      goals: [
        'Say which month you mean',
        'Ask how the hours were counted',
        'Agree on what happens next',
      ],
    },
  },
  {
    id: 'job-late',
    categoryId: 'part-time-job',
    title: 'Explaining being late',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'The subway stopped and you got in late. Explain and apologize.',
      aiRole: 'Manager',
      aiRoleDescription: 'Asks what happened and what you’ll do',
      goals: ['Apologize first', 'Say what happened', 'Say how you’ll make it up'],
    },
  },

  // ── Airport ──────────────────────────────────────────────────────────────
  {
    id: 'airport-immigration',
    categoryId: 'airport',
    title: 'Going through immigration',
    difficulty: 'Hard',
    minutes: 10,
    detail: {
      situation:
        "You're at immigration in Incheon. Answer questions about your purpose, length of stay and address.",
      aiRole: 'Immigration officer',
      aiRoleDescription: 'Checks your purpose and stay details',
      goals: [
        'State your purpose clearly',
        'Give your stay length and address',
        'Ask them to repeat if you miss something',
      ],
    },
  },
  {
    id: 'airport-baggage',
    categoryId: 'airport',
    title: 'Collecting your baggage',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: "Your suitcase didn't come out. Report it and ask what happens next.",
      aiRole: 'Baggage staff',
      aiRoleDescription: 'Takes the claim and explains the follow-up',
      goals: [
        'Describe your suitcase',
        'Give your flight number',
        'Ask how they’ll reach you',
      ],
    },
  },
  {
    id: 'airport-checkin',
    categoryId: 'airport',
    title: 'Checking in for a flight',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: 'You check in two hours early. Drop your bag and pick a seat.',
      aiRole: 'Check-in agent',
      aiRoleDescription: 'Checks your passport and weighs your bag',
      goals: [
        'Hand over your passport and ticket',
        'Ask for a window or aisle seat',
        'Ask about the baggage limit',
      ],
    },
  },
  {
    id: 'airport-gate',
    categoryId: 'airport',
    title: 'Asking for your gate',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'The gate on your ticket changed. Ask where to go and how long it takes.',
      aiRole: 'Airport staff',
      aiRoleDescription: 'Points you to the gate and the time',
      goals: [
        'Give your flight number',
        'Ask which gate it is now',
        'Ask how long it takes to walk there',
      ],
    },
  },
  {
    id: 'airport-meal',
    categoryId: 'airport',
    title: 'Requesting a meal on board',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'The cart comes around. Pick a meal and ask for a drink.',
      aiRole: 'Flight attendant',
      aiRoleDescription: 'Offers the meal options and drinks',
      goals: ['Pick one meal', 'Ask for a drink', 'Ask for one more thing politely'],
    },
  },
  {
    id: 'airport-customs',
    categoryId: 'airport',
    title: 'Declaring at customs',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation: 'You brought food and a gift. Declare them and answer the questions.',
      aiRole: 'Customs officer',
      aiRoleDescription: 'Asks what you’re carrying and why',
      goals: [
        'Say what you’re declaring',
        'Say what it’s for and how much it cost',
        'Answer the follow-up questions',
      ],
    },
  },

  // ── Accommodation ────────────────────────────────────────────────────────
  {
    id: 'stay-checkin',
    categoryId: 'accommodation',
    title: 'Checking in',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation:
        'You arrive at your booking. Give the name, finish check-in and ask about breakfast.',
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Confirms your booking and explains',
      goals: [
        'Give the booking name and number',
        'Make one request about the room',
        'Ask about breakfast and Wi-Fi',
      ],
    },
  },
  {
    id: 'stay-facilities',
    categoryId: 'accommodation',
    title: 'Asking about facilities',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: 'You want to use the gym and the laundry. Ask when they open.',
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Explains the hours and where things are',
      goals: [
        'Ask which facilities there are',
        'Ask about the opening hours',
        'Ask whether it costs extra',
      ],
    },
  },
  {
    id: 'stay-room-change',
    categoryId: 'accommodation',
    title: 'Requesting a room change',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation: "The room is noisy and the heating doesn't work. Ask to move.",
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Checks what’s free and offers options',
      goals: [
        'Explain the problem clearly',
        'Ask to move to another room',
        'Agree on when you can move',
      ],
    },
  },
  {
    id: 'stay-breakfast',
    categoryId: 'accommodation',
    title: 'Asking about breakfast',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'You want breakfast before you head out. Ask when and where.',
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Explains the hours and the menu',
      goals: [
        'Ask what time breakfast starts',
        'Ask where it’s served',
        'Ask whether it’s included',
      ],
    },
  },
  {
    id: 'stay-luggage',
    categoryId: 'accommodation',
    title: 'Asking to store your luggage',
    difficulty: 'Medium',
    minutes: 6,
    detail: {
      situation: 'You check out at noon but leave at night. Ask them to hold your bags.',
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Takes your bags and gives you a tag',
      goals: [
        'Ask them to hold your luggage',
        'Say when you’ll pick it up',
        'Ask whether it costs anything',
      ],
    },
  },
  {
    id: 'stay-checkout',
    categoryId: 'accommodation',
    title: 'Checking out',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "It's checkout morning. Settle the bill and ask about a taxi.",
      aiRole: 'Front desk clerk',
      aiRoleDescription: 'Goes through the bill and calls a taxi',
      goals: [
        'Say you’re checking out',
        'Ask what the extra charges are',
        'Ask them to call a taxi',
      ],
    },
  },

  // ── Directions ───────────────────────────────────────────────────────────
  {
    id: 'directions-subway',
    categoryId: 'directions',
    title: 'Finding the subway station',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "You came out the wrong exit. Ask someone where the station is.",
      aiRole: 'Passer-by',
      aiRoleDescription: 'Points the way and gives a landmark',
      goals: [
        'Approach politely',
        'Ask where the nearest station is',
        'Repeat the directions back',
      ],
    },
  },
  {
    id: 'directions-meeting-point',
    categoryId: 'directions',
    title: 'Asking where to meet',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: 'The exit is crowded. Agree on an exact meeting point on the phone.',
      aiRole: 'Friend',
      aiRoleDescription: 'Suggests places and checks the time',
      goals: [
        'Suggest one exact spot',
        'Agree on the time',
        'Say what to do if you’re late',
      ],
    },
  },
  {
    id: 'directions-lost',
    categoryId: 'directions',
    title: 'Asking for help when lost',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation:
        "You can't find the building. Ask someone passing by for help and confirm the directions.",
      aiRole: 'Passer-by',
      aiRoleDescription: 'Gives directions and checks you got them',
      goals: [
        'Approach politely',
        'Say the place name and address',
        'Repeat the directions back',
      ],
    },
  },
  {
    id: 'directions-convenience-store',
    categoryId: 'directions',
    title: 'Finding a nearby convenience store',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: 'You need cash and a drink. Ask where the closest store is.',
      aiRole: 'Passer-by',
      aiRoleDescription: 'Names the store and the direction',
      goals: [
        'Ask where the closest store is',
        'Ask how long it takes to walk',
        'Ask whether it has an ATM',
      ],
    },
  },
  {
    id: 'directions-floor',
    categoryId: 'directions',
    title: 'Checking which floor it is on',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "The building directory is confusing. Ask at the desk which floor you want.",
      aiRole: 'Building staff',
      aiRoleDescription: 'Checks the directory and points to the elevator',
      goals: [
        'Say which office you’re looking for',
        'Ask which floor it’s on',
        'Ask where the elevator is',
      ],
    },
  },
  {
    id: 'directions-duration',
    categoryId: 'directions',
    title: 'Asking how long it takes',
    difficulty: 'Medium',
    minutes: 6,
    detail: {
      situation: "You're deciding between walking and a bus. Ask which is faster.",
      aiRole: 'Passer-by',
      aiRoleDescription: 'Compares walking and the bus',
      goals: [
        'Say where you’re headed',
        'Ask how long each way takes',
        'Say which one you’ll take',
      ],
    },
  },

  // ── Friends ──────────────────────────────────────────────────────────────
  {
    id: 'friends-plans',
    categoryId: 'friends',
    title: 'Making plans',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: "It's Friday. Suggest something to do this weekend and settle the details.",
      aiRole: 'Friend',
      aiRoleDescription: 'Answers casually and suggests changes',
      goals: [
        'Suggest one thing to do',
        'Agree on the day and time',
        'Decide where to meet',
      ],
    },
  },
  {
    id: 'friends-hobbies',
    categoryId: 'friends',
    title: 'Talking about hobbies',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: 'You just met through a friend. Talk about what you both do for fun.',
      aiRole: 'Friend',
      aiRoleDescription: 'Shares their hobbies and asks about yours',
      goals: [
        'Say what you do for fun',
        'Ask two follow-up questions',
        'Find one thing you have in common',
      ],
    },
  },
  {
    id: 'friends-worry',
    categoryId: 'friends',
    title: 'Opening up about a worry',
    difficulty: 'Hard',
    minutes: 10,
    detail: {
      situation:
        "Tell a close friend what's been hard lately. Use casual speech, share how you feel and ask for advice.",
      aiRole: 'Friend',
      aiRoleDescription: 'Answers casually and asks how you feel',
      goals: [
        'Use three feeling words',
        'Tell the story in order',
        'Ask for advice and respond',
      ],
    },
  },
  {
    id: 'friends-catch-up',
    categoryId: 'friends',
    title: 'Catching up',
    difficulty: 'Easy',
    minutes: 5,
    detail: {
      situation: "You haven't talked in months. Catch up on what you've both been doing.",
      aiRole: 'Friend',
      aiRoleDescription: 'Asks how you’ve been and shares news',
      goals: [
        'Say what you’ve been up to',
        'Ask how they’ve been',
        'Suggest meeting soon',
      ],
    },
  },
  {
    id: 'friends-movie',
    categoryId: 'friends',
    title: 'Getting a movie recommendation',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: "You want something to watch tonight. Ask what they'd recommend and why.",
      aiRole: 'Friend',
      aiRoleDescription: 'Recommends a few and explains why',
      goals: [
        'Say what you’re in the mood for',
        'Ask why they like it',
        'Say which one you’ll watch',
      ],
    },
  },
  {
    id: 'friends-reschedule',
    categoryId: 'friends',
    title: 'Rescheduling and apologizing',
    difficulty: 'Hard',
    minutes: 9,
    detail: {
      situation: "Something came up the day before. Apologize and find another day.",
      aiRole: 'Friend',
      aiRoleDescription: 'Reacts honestly and suggests other days',
      goals: [
        'Apologize and say why',
        'Suggest two other days',
        'Offer to make it up to them',
      ],
    },
  },

  // ── K-content ────────────────────────────────────────────────────────────
  {
    id: 'kcontent-drama-scene',
    categoryId: 'k-content',
    title: 'Acting out a drama scene',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation:
        'You act out a scene from a hit drama with your partner. Trade lines and match the emotion.',
      aiRole: 'Scene partner',
      aiRoleDescription: 'Plays the other role and keeps the scene going',
      goals: [
        'Match the emotion of each line',
        'Match intonation and pace',
        'Describe the scene in one sentence',
      ],
    },
  },
  {
    id: 'kcontent-fan-meeting',
    categoryId: 'k-content',
    title: 'Greeting at a fan meeting',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: "You get 30 seconds at a fan meeting. Introduce yourself and say one thing.",
      aiRole: 'Artist',
      aiRoleDescription: 'Greets you warmly and asks a question',
      goals: [
        'Introduce yourself in one sentence',
        'Say what you like about them',
        'Ask one short question',
      ],
    },
  },
  {
    id: 'kcontent-variety-captions',
    categoryId: 'k-content',
    title: 'Learning variety show captions',
    difficulty: 'Medium',
    minutes: 8,
    detail: {
      situation: 'Variety captions use slang. Guess what they mean and use them yourself.',
      aiRole: 'Show fan',
      aiRoleDescription: 'Explains the slang and quizzes you back',
      goals: [
        'Guess what the caption means',
        'Use it in your own sentence',
        'Ask when people say it',
      ],
    },
  },
  {
    id: 'kcontent-favorite-artist',
    categoryId: 'k-content',
    title: 'Introducing your favorite artist',
    difficulty: 'Easy',
    minutes: 6,
    detail: {
      situation: 'A friend has never heard of them. Introduce them in a minute.',
      aiRole: 'Friend',
      aiRoleDescription: 'Asks what makes them worth listening to',
      goals: [
        'Say who they are in one sentence',
        'Name two songs and why you like them',
        'Recommend where to start',
      ],
    },
  },
  {
    id: 'kcontent-reactions',
    categoryId: 'k-content',
    title: 'Practicing reactions',
    difficulty: 'Medium',
    minutes: 7,
    detail: {
      situation: 'You always go quiet when you’re surprised. Practice reacting out loud.',
      aiRole: 'Friend',
      aiRoleDescription: 'Tells you news and waits for your reaction',
      goals: [
        'React to surprising news',
        'React to sad news',
        'Ask a follow-up each time',
      ],
    },
  },
];

export const situationById = Object.fromEntries(
  situations.map((situation) => [situation.id, situation]),
) as Record<string, Situation>;

export function situationsByCategory(categoryId: string) {
  return situations.filter((situation) => situation.categoryId === categoryId);
}

/**
 * HM-1 `Browse situations`. The home comp shows these four, in this order —
 * the `featured` flag alone sorts RP-1 but does not fix the home rail's order.
 */
const homeFeaturedIds = ['cafe-order', 'school-professor', 'government-bank', 'pharmacy-symptoms'];

export const homeFeatured = homeFeaturedIds
  .map((id) => situations.find((situation) => situation.id === id))
  .filter((situation): situation is Situation => Boolean(situation));
