export type Question={id:string;section:string;title:string;hint?:string;max?:number;all?:boolean;options:string[];exclusive?:string[];detailWhen?:string;detailLabel?:string};
export const questions:Question[]=[
  {
    "id": "residence",
    "section": "About you",
    "title": "Do you currently live in Singapore?",
    "options": [
      "Yes",
      "No"
    ],
    "detailWhen": "No",
    "detailLabel": "Which country or region do you live in?"
  },
  {
    "id": "designPreference",
    "section": "Your favourite design",
    "title": "Which of these three brochure designs do you like best?",
    "hint": "Compare the images and concepts, then choose one. You can enlarge each brochure before deciding.",
    "options": ["Craft — Japanese tradition & trust", "Family — Healthy food to share", "Everyday — A little luxury for yourself", "No preference"]
  },
  {
    "id": "breakfast",
    "section": "Your everyday meals",
    "title": "How did you most often have your meals in the past 7 days?",
    "options": [
      "Prepared food at home and ate at home",
      "Prepared food at home and took it to work or elsewhere",
      "Had takeaway or delivery at home or work",
      "Ate at a café, hawker centre or restaurant",
      "Other"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "priorities",
    "section": "Your everyday meals",
    "title": "What matters when choosing meals, whether eating out or at home?",
    "max": 3,
    "options": [
      "Good taste",
      "An affordable price",
      "Little time or effort to prepare or buy",
      "Balanced nutrition",
      "Getting protein",
      "Feeling full",
      "A warm meal",
      "Discovering new flavours",
      "Other"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "challenges",
    "section": "Your everyday meals",
    "title": "What difficulties do you face with everyday meals?",
    "max": 2,
    "options": [
      "Limited time to prepare or buy food",
      "Cooking and washing up",
      "Deciding what to eat",
      "Balancing nutrition",
      "Getting bored with the same food",
      "Using up ingredients or purchased food",
      "Finding the right portion size",
      "Cost",
      "No difficulties",
      "Other"
    ],
    "exclusive": [
      "No difficulties"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "product",
    "section": "A taste of Okinawa",
    "title": "Which products would you like to try?",
    "max": 6,
    "options": [
      "Yushi tofu",
      "Shima tofu",
      "Atsuage",
      "Okara spoon",
      "I am not sure yet",
      "None of these"
    ],
    "hint": "Look at the photos, descriptions and serving ideas above.",
    "exclusive": [
      "I am not sure yet",
      "None of these"
    ],
    "all": true
  },
  {
    "id": "occasion",
    "section": "Picture it on your table",
    "title": "When would you enjoy the products you selected?",
    "max": 8,
    "options": [
      "Breakfast at home",
      "Breakfast at work or on the go",
      "Lunch",
      "As part of dinner",
      "A snack or dessert",
      "A special occasion",
      "I cannot picture a use for them",
      "Other"
    ],
    "hint": "If you selected several products, consider any of them. If you did not select a product, consider the range as a whole.",
    "exclusive": [
      "I cannot picture a use for them"
    ],
    "all": true,
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "appeal",
    "section": "What speaks to you",
    "title": "What appealed to you in this introduction?",
    "max": 8,
    "options": [
      "Okinawan food culture",
      "Kawakami Foods’ history and craftsmanship",
      "The expected taste and texture",
      "The serving ideas",
      "How the products could fit everyday meals",
      "The photography and design",
      "Nothing in particular",
      "Other"
    ],
    "exclusive": [
      "Nothing in particular"
    ],
    "all": true,
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "preparation",
    "section": "Making it work",
    "title": "How much preparation time would you accept to enjoy these products at home?",
    "options": [
      "No preparation: ready to eat",
      "Up to 3 minutes",
      "4–5 minutes",
      "6–10 minutes",
      "More than 10 minutes",
      "It depends on the product or occasion",
      "I would not eat these at home"
    ],
    "hint": "Include opening, heating and serving — not eating time."
  },
  {
    "id": "interest",
    "section": "Your first impression",
    "title": "How interested would you be in buying the products introduced?",
    "options": [
      "Very interested",
      "Somewhat interested",
      "Neither interested nor uninterested",
      "Not very interested",
      "Not interested at all",
      "I need more information"
    ],
    "hint": "If several products interest you, think about the one you would most like to buy.",
    "detailWhen": "I need more information",
    "detailLabel": "What information would help you decide?"
  },
  {
    "id": "barriers",
    "section": "Before you buy",
    "title": "What would you most like to know before considering a purchase?",
    "max": 3,
    "options": [
      "The price",
      "Pack size and number of servings",
      "Taste and texture",
      "Preparation time and effort",
      "Storage and shelf life",
      "Serving ideas and recipes",
      "Ingredients and allergens",
      "Nutrition, such as protein and calories",
      "Whether it has halal or other certification",
      "Suitability for dietary restrictions, such as a gluten-free diet",
      "How it could fit a weight-management diet",
      "How it could fit a diet for someone concerned about blood sugar, blood pressure or cholesterol",
      "Where to buy it",
      "Nothing else",
      "Other"
    ],
    "exclusive": [
      "Nothing else"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "pack",
    "section": "The right size",
    "title": "Which pack format would suit you best?",
    "options": [
      "A small pack for one person on one occasion",
      "Individually packed portions in a multipack",
      "A larger pack to share or use over several meals",
      "It would depend on the product or price",
      "None of these",
      "Not sure",
      "Other"
    ],
    "hint": "Choose the format that would best suit your everyday meals.",
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "channel",
    "section": "Where to buy",
    "title": "Where would you prefer to buy or order these products?",
    "max": 2,
    "options": [
      "My usual supermarket",
      "A Japanese food store",
      "An online shop",
      "On a café or restaurant menu",
      "Food delivery",
      "An event or pop-up",
      "I would not buy them",
      "Other"
    ],
    "exclusive": [
      "I would not buy them"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please tell us more."
  },
  {
    "id": "gender",
    "section": "A little about you",
    "title": "What is your gender?",
    "options": [
      "Female",
      "Male",
      "Non-binary",
      "Another gender",
      "Prefer not to say"
    ]
  },
  {
    "id": "occupation",
    "section": "A little about you",
    "title": "Which best describes your current main occupation or role?",
    "hint": "Choose your main role. If you are a business owner, select that option rather than an employee role.",
    "options": [
      "Company employee — non-management role",
      "Manager — team leader or department manager",
      "Senior executive — director or C-suite",
      "Business owner / entrepreneur",
      "Self-employed professional / freelancer",
      "Public-sector / non-profit employee — non-management role",
      "Part-time / casual worker — non-management role",
      "Student",
      "Homemaker / full-time caregiver",
      "Retired",
      "Not currently employed",
      "Other",
      "Prefer not to say"
    ],
    "detailWhen": "Other",
    "detailLabel": "Please describe your occupation or role (optional)."
  }
];
export function validAnswer(q:Question,value:unknown):value is string[]{return Array.isArray(value)&&value.length>0&&value.length<=(q.max||1)&&new Set(value).size===value.length&&value.every(v=>typeof v==='string'&&q.options.includes(v))&&!(value.length>1&&value.some(v=>q.exclusive?.includes(v)));}
